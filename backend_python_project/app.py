from flask import Flask, request, jsonify, render_template
import dotenv
import os
from PIL import Image
from flask_cors import CORS
import base64
from io import BytesIO
import google.generativeai as genai
import fitz  # PyMuPDF

dotenv.load_dotenv()

app = Flask(__name__)
CORS(app)


# Helper Functions
def get_image_base64(image_raw):
    buffered = BytesIO()
    img_format = image_raw.format if image_raw.format else 'JPEG'
    try:
        image_raw.save(buffered, format=img_format)
    except ValueError:
        image_raw.convert('RGB').save(buffered, format='JPEG')
    img_byte = buffered.getvalue()
    return base64.b64encode(img_byte).decode('utf-8')

def base64_to_image(base64_string):
    base64_string = base64_string.split(",")[1]
    return Image.open(BytesIO(base64.b64decode(base64_string)))

def pdf_to_images(pdf_file):
    images = []
    pdf_document = fitz.open(stream=pdf_file.read(), filetype="pdf")
    for page_num in range(len(pdf_document)):
        page = pdf_document.load_page(page_num)
        pix = page.get_pixmap()
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        images.append(img)
    return images

def messages_to_gemini(messages):
    gemini_messages = []
    prev_role = None
    for message in messages:
        if prev_role and (prev_role == message["role"]):
            gemini_message = gemini_messages[-1]
        else:
            gemini_message = {
                "role": "model" if message["role"] == "assistant" else "user",
                "parts": [],
            }

        for content in message["content"]:
            if content["type"] == "text":
                gemini_message["parts"].append(content["text"])
            elif content["type"] == "image_url":
                gemini_message["parts"].append(base64_to_image(content["image_url"]["url"]))

        if prev_role != message["role"]:
            gemini_messages.append(gemini_message)

        prev_role = message["role"]
    return gemini_messages

def stream_llm_response(api_key, messages):
    response_message = ""
    response_messages = []

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(model_name="gemini-1.5-pro")

    gemini_messages = messages_to_gemini(messages)

    for chunk in model.generate_content(
        contents=gemini_messages,
        stream=True,
    ):
        chunk_text = chunk.text or ""
        response_message += chunk_text
        response_messages.append({
            "role": "assistant",
            "content": [{"type": "text", "text": chunk_text}]
        })

    return response_messages

# Flask Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    messages = data.get('messages', [])
    api_key = os.getenv("GOOGLE_API_KEY")
    
    if not api_key:
        return jsonify({"error": "Google API Key is missing"}), 400
    
    response_messages = stream_llm_response(api_key, messages)
    return jsonify({"messages": response_messages})

@app.route('/api/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        raw_img = Image.open(file)
        img_base64 = get_image_base64(raw_img)
        return jsonify({"image_url": f"data:image/jpeg;base64,{img_base64}"})
    
    elif file and file.filename.lower().endswith('.pdf'):
        images = pdf_to_images(file)
        img_urls = [f"data:image/jpeg;base64,{get_image_base64(img)}" for img in images]
        return jsonify({"image_urls": img_urls})
    
    return jsonify({"error": "Unsupported file type"}), 400

if __name__ == '__main__':
    app.run(debug=True) 