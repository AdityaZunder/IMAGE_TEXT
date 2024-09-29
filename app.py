from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import yt_dlp
from ai_service import *  # Import the model from ai_service.py
import logging
from vertexai.generative_models import GenerativeModel, Image
import speech_recognition as sr
from pydub import AudioSegment  # Importing pydub for audio conversion
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound

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

def extract_text_from_audio(audio_path):
    """Extract text from audio using Google Speech Recognition."""
    recognizer = sr.Recognizer()
    with sr.AudioFile(audio_path) as source:
        audio_data = recognizer.record(source)
        try:
            text = recognizer.recognize_google(audio_data)
            return text
        except sr.UnknownValueError:
            return "Audio not understood"
        except sr.RequestError as e:
            return f"Could not request results from Google Speech Recognition service; {e}"

def convert_mp3_to_wav(mp3_path):
    """Convert MP3 file to WAV format."""
    wav_path = mp3_path.replace('.mp3', '.wav')
    audio = AudioSegment.from_mp3(mp3_path)
    audio.export(wav_path, format='wav')
    return wav_path

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

from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound

@app.route('/video', methods=['POST'])
def handle_video():
    global extracted_text  # To store extracted text from the video
    video_url = request.json.get('url')

    if not video_url:
        logging.debug('No video URL provided')
        return jsonify({'error': 'No video URL provided'}), 400

    logging.debug(f"Received video URL: {video_url}")

    try:
        # Extract video ID from URL (assuming standard YouTube URL format)
        video_id = video_url.split('v=')[-1]

        transcript = None
        try:
            # Fetch the transcript using youtube_transcript_api
            transcript_data = YouTubeTranscriptApi.get_transcript(video_id)
            transcript = " ".join([item['text'] for item in transcript_data])
            logging.debug("Transcript found.")
        except (TranscriptsDisabled, NoTranscriptFound) as e:
            logging.debug("Transcript not available, falling back to audio extraction.")
        
        # Download the audio from the YouTube video
        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'outtmpl': os.path.join(app.config['UPLOAD_FOLDER'], '%(title)s.%(ext)s'),
            'noplaylist': True,
            'remove_sources': True,
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=True)
            audio_path = ydl.prepare_filename(info).replace('.webm', '.mp3')  # Ensure the path points to the MP3 file

        # Convert MP3 to WAV
        wav_path = convert_mp3_to_wav(audio_path)

        # Use transcript if it exists, otherwise fall back to audio extraction
        if transcript:
            logging.debug(f"Extracted transcript text: {transcript}")
            extracted_text = transcript

            # Append transcript to conversation history
            conversation_history.append({"ai": extracted_text})
        else:
            logging.debug("No transcript available; using audio extraction instead.")
            # Extract text from the downloaded audio using speech recognition
            extracted_text = extract_text_from_audio(wav_path)

            if extracted_text == "Audio not understood":
                return jsonify({'error': 'Could not understand audio.'}), 400

            # Append the extracted text from audio to conversation history
            conversation_history.append({"ai": extracted_text})

        # Create a smart summary combining video title and transcript/audio text
        video_title = info.get('title', 'Untitled Video')
        summary_prompt = (f"Summarize the video smartly by combining the transcript/audio text "
                          f"with the title '{video_title}'. "
                          f"Transcript/Audio: {extracted_text}")
        
        # AI to generate the summary based on the extracted text and video title
        summary_response = gemini_vision(summary_prompt, model=multimodal_model)
        conversation_history.append({"ai": summary_response})

        return jsonify({
            'message': extracted_text, 
            'summary': summary_response,
            'title': video_title
        }), 200

    except Exception as e:
        logging.error(f"Error processing video: {e}")
        return jsonify({'error': 'Failed to process video'}), 500

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