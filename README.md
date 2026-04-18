♻️ Swachh AI Connect
Smart Waste Segregation using AI 
🌍 Problem Statement

Waste mismanagement remains a major issue, especially in rural and semi-urban regions where proper segregation and awareness are limited. This leads to environmental damage, health risks, and inefficient recycling systems.

💡 Solution

Swachh AI Connect is an AI-powered system that performs real-time waste detection and classification using computer vision.

Instead of manual segregation, the system:

Captures live video input
Processes it using ML models
Classifies waste instantly
✨ Key Features
🎥 Real-Time Detection – Detects waste using webcam/live feed
🧠 AI Classification – Categorizes into Recyclable, Non-Recyclable, Hazardous
🌐 Multi-language Support – Accessible across regions
📍 Geo-Tagging – Tracks waste locations
📊 Admin Dashboard – Monitoring, alerts, and analytics
⚡ Fast Inference – Optimized for real-time predictions
🏗️ Tech Stack
Layer	Technology
Frontend	Streamlit / Flask
Backend	Python
ML Model	PyTorch
Model Format	ONNX
Input	Webcam / Images
Deployment	Streamlit Cloud
⚙️ How It Works
Capture image or use webcam feed
Model processes input
Detects waste objects
Classifies into categories
Outputs waste type and confidence score
🚀 Getting Started
Prerequisites
Python 3.x
pip
Installation

git clone https://github.com/YogeshTyagi00/swachh-ai-connect-54946-31944.git

cd swachh-ai-connect-54946-31944
pip install -r requirements.txt

Run the App

streamlit run app.py

📂 Project Structure
app.py
train.py
helper.py
settings.py
weights/
requirements.txt
🧪 Model Details
Trained on waste detection dataset
Uses object detection for classification
Supports real-time inference (edge + cloud)

Dataset:
https://universe.roboflow.com/ai-project-i3wje/waste-detection-vqkjo/model/3

🌐 Live Demo

https://intelligent-waste-segregation-system.streamlit.app

👥 Team

Developed as part of Smart India Hackathon (SIH) internal round

📌 Future Scope
Mobile app integration
Improved model accuracy
Integration with municipal systems
Scalable deployment for smart cities
