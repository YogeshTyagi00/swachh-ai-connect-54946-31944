♻️ Swachh AI Connect
Smart Waste Segregation using AI | SIH Hackathon Project 🚀
🌍 Problem Statement
Waste mismanagement is a silent crisis—especially in rural and semi-urban areas where awareness and infrastructure for segregation are limited. Improper disposal leads to environmental damage, health risks, and inefficient recycling systems.
Swachh AI Connect aims to bridge this gap using AI-powered real-time waste detection and classification.
💡 Solution Overview
Swachh AI Connect is an intelligent system that uses computer vision + AI to detect and classify waste in real-time using a camera feed.
Instead of relying on manual segregation or image uploads, our system:
🎥 Captures live video input
🧠 Processes it using ML models
♻️ Classifies waste instantly
✨ Key Features
🔴 Real-Time Waste Detection
Detects waste directly from webcam/live feed
🧠 AI-Based Classification
Categorizes waste into:
Recyclable
Non-Recyclable
Hazardous
🌐 Multi-language Support
Accessible to diverse users across regions
📍 Geo-Tagging of Waste
Tracks location of detected waste for monitoring
🛠️ Admin Dashboard
User tracking
Hazard alerts
Data monitoring
⚡ Fast & Efficient Predictions
Optimized for real-time inference
🏗️ Tech Stack
Layer
Technology
💻 Frontend
Streamlit / Flask
🧠 ML Model
PyTorch
🔁 Model Format
ONNX
🎥 Input
Webcam / Image
☁️ Deployment
Streamlit Cloud
⚙️ Backend
Python
⚙️ How It Works
📸 Capture image or use live webcam feed
🧠 AI model processes input
🔍 Object detection identifies waste
♻️ Classification into categories
📊 Output shows:
Waste type
Confidence score
Label
🚀 Getting Started
🔧 Prerequisites
Python 3.x
pip
📥 Installation
Bash
git clone https://github.com/YogeshTyagi00/swachh-ai-connect-54946-31944.git
cd swachh-ai-connect-54946-31944
pip install -r requirements.txt
▶️ Run the App
Bash
streamlit run app.py
📂 Project Structure

├── app.py              # Main application
├── train.py            # Model training script
├── helper.py           # Utility functions
├── settings.py         # Configuration
├── weights/            # Model weights
├── requirements.txt    # Dependencies
├── packages.txt        # Deployment packages
🧪 Model Details
Trained on waste detection dataset
Uses object detection for real-time classification
Supports edge + cloud inference
Dataset:
👉 https://universe.roboflow.com/ai-project-i3wje/waste-detection-vqkjo/model/3⁠� �
GitHub
🌐 Live Demo
🔗 https://intelligent-waste-segregation-system.streamlit.app⁠� 
