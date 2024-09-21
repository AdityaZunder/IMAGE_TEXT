from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from ai_service import *  # Import the model from ai_service.py
import logging
from vertexai.generative_models import GenerativeModel, Image

logging.basicConfig(level=logging.DEBUG)
credentials, PROJECT_ID = authenticate()

# Define region
REGION = "asia-south1"

# Import vertexai
import vertexai

# Initialize Vertex AI with project, location, and credentials
vertexai.init(
    project=PROJECT_ID,
    location=REGION,
    credentials=credentials
)

# Import GenerativeModel from vertexai
from vertexai.generative_models import (GenerativeModel,
                                        Image,
                                        Part,)

# Initialize the model
model = GenerativeModel("gemini-1.5-flash-001")
multimodal_model = GenerativeModel("gemini-1.0-pro-vision-001")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Authenticate and get credentials
credentials, PROJECT_ID = authenticate()

# Initialize Vertex AI with project, location, and credentials
vertexai.init(
    project=PROJECT_ID,
    location="asia-south1",
    credentials=credentials
)

@app.route('/')
def home():
    return "Flask Server is Running!"

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        logging.debug('No file part in request')
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']

    if file.filename == '':
        logging.debug('No selected file')
        return jsonify({'error': 'No selected file'}), 400

    logging.debug(f"Received file: {file.filename}")

    try:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)
        logging.debug(f"File saved to: {file_path}")

        # Check if the file exists and is valid
        if not os.path.isfile(file_path):
            logging.debug(f"File not found: {file_path}")
            return jsonify({'error': 'File not found after saving'}), 500

        image1 = Image.load_from_file(file_path)
        contents = ["display only the text in the image", image1]

        response = gemini_vision(contents, model=multimodal_model)
        logging.debug(f"AI Response: {response}")
        return jsonify({'message': response}), 200
    except Exception as e:
        logging.error(f"Error processing image: {e}")
        return jsonify({'error': 'Failed to process image'}), 500
   

@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get('message')  # Ensure this matches your frontend's payload
    if not user_input:
        return jsonify({'error': 'No input provided'}), 400

    # Generate AI response using the gemini function
    response_text = gemini(user_input, model)
    
    return jsonify({'response': response_text})  # Return AI response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)