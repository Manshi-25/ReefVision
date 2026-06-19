import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import numpy as np
from tensorflow.lite.python.interpreter import Interpreter
from pymongo import MongoClient
from pathlib import Path

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logging.getLogger("pymongo").setLevel(logging.WARNING)

port = int(os.environ.get("PORT", 10000))

# -------------------------------
# MODEL PATHS
# -------------------------------
BASE_DIR = Path(__file__).resolve().parent

cnn_model_path = BASE_DIR / "Model/all_models/cnn_model_TFL.tflite"
resnet_model_path = BASE_DIR / "Model/all_models/resnet50_model_TFL.tflite"
densenet_model_path = BASE_DIR / "Model/all_models/densenet_model_TFL.tflite"
efficientNet_model_path = BASE_DIR / "Model/all_models/models/saved_model/efficientnet_float32.tflite"

# -------------------------------
# LAZY MODEL LOADING (IMPORTANT)
# -------------------------------
models = {}

def load_tflite_model(model_path):
    interpreter = Interpreter(model_path=str(model_path))
    interpreter.allocate_tensors()
    return interpreter

def get_model(name):
    if name not in models:
        if name == "cnn":
            models[name] = load_tflite_model(cnn_model_path)
        elif name == "resnet":
            models[name] = load_tflite_model(resnet_model_path)
        elif name == "densenet":
            models[name] = load_tflite_model(densenet_model_path)
        elif name == "efficientnet":
            models[name] = load_tflite_model(efficientNet_model_path)
    return models[name]

# -------------------------------
# IMAGE PREPROCESSING
# -------------------------------
def preprocess_image(image, target_size):
    image = image.resize(target_size)
    image = np.array(image, dtype=np.float32) / 255.0
    image = np.expand_dims(image, axis=0)
    return image

# -------------------------------
# TFLITE INFERENCE
# -------------------------------
def predict_with_tflite(interpreter, input_data):
    input_index = interpreter.get_input_details()[0]['index']
    output_index = interpreter.get_output_details()[0]['index']

    interpreter.set_tensor(input_index, input_data)
    interpreter.invoke()

    return interpreter.get_tensor(output_index)

# -------------------------------
# MONGODB (SAFE)
# -------------------------------
MONGO_URI = "mongodb+srv://coral_health:TSSXDayCih0LKnrk@coral-health.om41rpe.mongodb.net"

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client["coral_predictions"]
    collection = db["results"]
    client.server_info()
    print("MongoDB connected")
except Exception as e:
    print("MongoDB connection failed:", e)
    collection = None

# -------------------------------
# API ROUTE
# -------------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "running",
        "message": "Coral Health Detection API is live."
    })

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    model_type = request.form.get("model")

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if model_type not in ["resnet", "cnn", "densenet", "efficientnet"]:
        return jsonify({'error': 'Invalid model selected'}), 400

    try:
        # select model
        interpreter = get_model(model_type)

        # input size
        if model_type == "efficientnet":
            input_size = (224, 224)
        else:
            input_size = (128, 128)

        image = Image.open(file.stream)
        image = preprocess_image(image, input_size)

        prediction = predict_with_tflite(interpreter, image)

        # -------------------------------
        # POSTPROCESSING
        # -------------------------------
        if model_type == "efficientnet":
            logits = prediction[0]
            probs = np.exp(logits - np.max(logits))
            probs = probs / np.sum(probs)

            class_index = int(np.argmax(probs))
            confidence = float(np.max(probs))
        else:
            class_index = 1 if prediction[0][0] >= 0.5 else 0
            confidence = float(prediction[0][0]) if class_index == 1 else 1 - float(prediction[0][0])

        result = "Healthy" if class_index == 1 else "Bleached"

        # save to mongo
        if collection:
            collection.insert_one({
                "model": model_type,
                "result": result,
                "confidence": confidence,
                "filename": file.filename
            })

        return jsonify({
            "result": result,
            "confidence": float(f"{confidence * 100:.4f}")
        })

    except Exception as e:
        logging.error(f"Prediction error: {e}")
        return jsonify({"error": str(e)}), 500

# -------------------------------
# START SERVER
# -------------------------------
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=port)