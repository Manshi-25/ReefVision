# 🌊 Coral Health Detection using Deep Learning

A full-stack web application that detects the health status of coral reefs from underwater images using multiple deep learning models. Users can upload an image, select a trained model, and receive predictions indicating whether the coral is **Healthy** or **Bleached**, along with the prediction confidence.

---

# 🚀 Live Demo

### 🌐 Frontend (Vercel)

https://coral-health-detection.vercel.app

### ⚙️ Backend API (Render)

https://coral-health-detection-model.onrender.com

### API Health Check

GET /

### Prediction Endpoint

POST /predict

### 📖 Project Showcase: View on Notion

https://health-of-corals.notion.site/Coral-Health-Detection-38740f75a17a80a4ae36ccf5d3d0aa61

---

# ✨ Features

- Upload coral reef images for prediction
- Supports multiple Deep Learning models
  - CNN
  - ResNet50
  - DenseNet
  - EfficientNet
- TensorFlow Lite inference for faster prediction
- Displays prediction confidence
- Stores prediction history in MongoDB Atlas
- Responsive React frontend
- REST API built with Flask
- Fully deployed frontend and backend

---

# 🛠 Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Axios
- CSS

## Backend

- Flask
- TensorFlow Lite
- NumPy
- Pillow
- Gunicorn
- Flask-CORS
- PyMongo

## Database

- MongoDB Atlas

## Deployment

- Vercel (Frontend)
- Render (Backend)

---

# 🤖 Deep Learning Models

The application supports four trained deep learning models.

| Model | Input Size |
|--------|-----------|
| CNN | 128 × 128 |
| ResNet50 | 128 × 128 |
| DenseNet | 128 × 128 |
| EfficientNet | 224 × 224 |

Each uploaded image is automatically preprocessed according to the selected model before TensorFlow Lite inference.

---

# ⚙️ Installation

## Clone the Repository

```bash
git clone https://github.com/Manshi-25/Coral-health-detection.git

cd Coral-health-detection
```

## Frontend Setup

```bash
cd front

npm install

npm run dev
```

---

## Backend Setup

```bash
cd Model

pip install -r requirements.txt

python app.py
```

---

# 🌐 Deployment

## Frontend

The React frontend is deployed on **Vercel**.

https://coral-health-detection.vercel.app

---

## Backend

The Flask backend is deployed on **Render** using Gunicorn.

Start Command

```bash
gunicorn app:app --bind 0.0.0.0:$PORT
```

Backend URL

https://coral-health-detection-model.onrender.com

---

# 🗄 Database

Prediction results are stored in **MongoDB Atlas**.

Each prediction stores:

- Selected model
- Prediction result
- Confidence score
- Uploaded filename

---

# 🔄 Application Workflow

1. User uploads a coral image.
2. User selects a deep learning model.
3. The backend preprocesses the image.
4. TensorFlow Lite performs inference.
5. The API predicts whether the coral is Healthy or Bleached.
6. The prediction confidence is returned to the frontend.
7. Prediction details are stored in MongoDB Atlas.

---

# 🚧 Challenges Faced During Deployment

This project involved solving several real-world deployment challenges, including:

- Deploying a Flask Machine Learning API on Render
- Loading TensorFlow Lite models using absolute paths
- Connecting MongoDB Atlas from the deployed backend
- Debugging deployment issues related to missing files and server configuration

---

# 📌 Future Improvements

- User authentication
- Prediction history dashboard
- Support for additional coral diseases
- Batch image prediction
- Model comparison dashboard
- Improved visualization and analytics

---

# 👩‍💻 Author

**Manshi**

B.Tech Student | Full Stack Developer | Machine Learning Enthusiast

GitHub:
https://github.com/Manshi-25

---

## ⭐ If you found this project useful, please consider giving it a Star on GitHub!
