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

# Initialize the models
model = GenerativeModel("gemini-1.5-flash-001")
multimodal_model = GenerativeModel("gemini-1.0-pro-vision-001")
conversation_history = []  # List to store conversation history
extracted_text = None  # Variable to store extracted text from the image

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the uploads folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/')
def home():
    return "Flask Server is Running!"

@app.route('/upload', methods=['POST'])
def upload_file():
    global extracted_text  # To store extracted text

    if 'file' not in request.files:
        logging.debug('No file part in request')
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']

    if file.filename == '':
        logging.debug('No selected file')
        return jsonify({'error': 'No selected file'}), 400

    logging.debug(f"Received file: {file.filename}")

    try:
        # Extract folder name if provided
        folder_name = os.path.dirname(file.filename)
        upload_folder = os.path.join(app.config['UPLOAD_FOLDER'], folder_name)

        # Create folder if not exists
        if folder_name and not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
            logging.debug(f"Created folder: {upload_folder}")

        # Save file to the appropriate folder
        file_path = os.path.join(upload_folder, os.path.basename(file.filename))
        file.save(file_path)
        logging.debug(f"File saved to: {file_path}")

        # Check file was saved successfully
        if not os.path.isfile(file_path):
            logging.error(f"File not found after saving: {file_path}")
            return jsonify({'error': 'File not found after saving'}), 500

        # Process the image with AI
        image1 = Image.load_from_file(file_path)
        contents = ["Extract only the text from the image", image1]
        response = gemini_vision(contents, model=multimodal_model)
        logging.debug(f"AI Response: {response}")

        # Store extracted text
        extracted_text = response

        # Append conversation history
        conversation_history.append({"ai": response})
        summary_prompt = f"Summarize the image: {response}"
        summary_response = gemini_vision(summary_prompt, model=multimodal_model)
        conversation_history.append({"ai": summary_response})

        return jsonify({'message': response, 'summary': summary_response}), 200

    except Exception as e:
        logging.error(f"Error processing image: {e}")
        return jsonify({'error': 'Failed to process image'}), 500
     

@app.route('/chat', methods=['POST'])
def chat():
    global conversation_history, extracted_text  # Use global variables for session history

    user_input = request.json.get('message')
    if not user_input:
        return jsonify({'error': 'No input provided'}), 400

    # Append user input to conversation history
    conversation_history.append({"user": user_input})

    # Create the full multimodal prompt
    prompt_contents = ["go through the chat history to keep in mind what's been spoken, but speak only in relevance to what's been asked, if nothing is been asked reply normally as you would to the question, be smart."]
    prompt_contents += [f"User: {msg['user']}" for msg in conversation_history if 'user' in msg]
    prompt_contents += [f"AI: {msg['ai']}" for msg in conversation_history if 'ai' in msg]

    # Include the extracted text in the chat context if it exists
    if extracted_text:
        prompt_contents.append(f"Extracted Text: {extracted_text}")

    try:
        # Generate the AI response
        final = gemini(prompt_contents, model)

        # Append AI response to conversation history
        conversation_history.append({"ai": final})

        return jsonify({'response': final})

    except ValueError as e:
        logging.error(f"AI request failed: {e}")
        # Clear conversation history and extracted text
        conversation_history = []
        extracted_text = None
        return jsonify({'error': 'That is not allowed. Everything has been reset.'}), 403  # 403 Forbidden

@app.route('/reset', methods=['POST'])
def reset():
    global conversation_history, extracted_text
    conversation_history = []  # Clear conversation history
    extracted_text = None  # Clear extracted text
    return jsonify({'message': 'Conversation history cleared.'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)