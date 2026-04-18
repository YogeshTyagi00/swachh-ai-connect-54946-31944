<div align="center">

<img src="https://img.shields.io/badge/Smart%20India%20Hackathon-2024-orange?style=for-the-badge&logo=india&logoColor=white" />
<img src="https://img.shields.io/badge/Status-MVP%20%2F%20Active-brightgreen?style=for-the-badge" />
<img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" />

# ♻️ Swachh AI Connect

### AI-Powered Intelligent Waste Detection & Segregation System

*Problem Statement: Waste Segregation & Smart City Integration*

[🌐 Live Demo](https://intelligent-waste-segregation-system.streamlit.app) · [📂 Repository](https://github.com/YogeshTyagi00/swachh-ai-connect-54946-31944) · [🐛 Report Bug](https://github.com/YogeshTyagi00/swachh-ai-connect-54946-31944/issues)

</div>

---

## 📌 Overview

**Swachh AI Connect** is a real-time, AI-powered waste detection and classification system developed as part of the **Smart India Hackathon (SIH)**. The system uses computer vision and deep learning to automatically identify and categorize waste from live video feeds or uploaded images — eliminating the need for manual segregation and enabling smarter waste management at scale.

> 🎯 **Goal:** Bridge the gap between citizen-level waste generation and efficient municipal waste management using accessible AI technology.

---

## 🚨 Problem Statement

Waste mismanagement is a critical challenge across India, particularly in rural and semi-urban regions:

- Manual segregation is **inconsistent, slow, and error-prone**
- Awareness of waste categories (recyclable vs hazardous) is **extremely low**
- Municipal bodies lack **real-time data** to deploy cleaning staff efficiently
- Existing apps like Swachh Bharat require manual photo uploads, leading to **poor adoption**

---

## 💡 Solution

Swachh AI Connect automates the entire detection pipeline:

```
📷 Live Input  →  🧠 AI Model  →  🏷️ Classification  →  📊 Dashboard Alert
```

The system captures video or images, runs them through an optimized ML model, classifies waste in real time, and surfaces actionable data on an admin dashboard — all without any manual intervention.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🎥 **Real-Time Detection** | Processes live webcam/video feed for instant waste identification |
| 🧠 **AI Classification** | Categorizes waste into Recyclable, Non-Recyclable, and Hazardous |
| 📍 **Geo-Tagging** | Associates detected waste with GPS coordinates for location tracking |
| 🌐 **Multi-Language Support** | Designed for accessibility across diverse regions and languages |
| 📊 **Admin Dashboard** | Real-time monitoring, analytics, and alerts for municipal authorities |
| ⚡ **Optimized Inference** | ONNX model format for fast, lightweight, deployment-ready predictions |

---

## 🏗️ Tech Stack

<div align="center">

| Layer | Technology |
|---|---|
| **Frontend / UI** | Streamlit |
| **Backend** | Python, Flask |
| **ML Framework** | PyTorch |
| **Model Format** | ONNX (optimized inference) |
| **Input Sources** | Webcam, Image Upload |
| **Deployment** | Streamlit Cloud |

</div>

---

## 🔍 How It Works

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   1. Input        →   Webcam stream or image upload     │
│   2. Preprocess   →   Frame extraction & normalization  │
│   3. Inference    →   PyTorch / ONNX model prediction   │
│   4. Classify     →   Recyclable / Non-Recyclable /     │
│                        Hazardous + confidence score     │
│   5. Output       →   Visual overlay + dashboard alert  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- pip

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YogeshTyagi00/swachh-ai-connect-54946-31944.git
cd swachh-ai-connect-54946-31944

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the application
streamlit run app.py
```

The app will be available at `http://localhost:8501`

---

## 📂 Project Structure

```
swachh-ai-connect/
│
├── app.py              # Main Streamlit application entry point
├── train.py            # Model training script
├── helper.py           # Utility functions & preprocessing helpers
├── settings.py         # Configuration & constants
├── requirements.txt    # Python dependencies
│
└── weights/            # Pre-trained model weights (.pt / .onnx)
```

---

## 🌐 Live Demo

🔗 **[https://intelligent-waste-segregation-system.streamlit.app](https://intelligent-waste-segregation-system.streamlit.app)**

> Upload a waste image or enable your webcam to see real-time classification in action.

---

## 🗺️ Roadmap & Future Scope

- [ ] **Mobile App** — Android/iOS integration for field use by sanitation workers
- [ ] **Edge Deployment** — Optimize for low-resource devices in rural environments
- [ ] **Drone Integration** — Aerial waste monitoring over large areas
- [ ] **Smart City API** — Integration with municipal and smart city management systems
- [ ] **Expanded Categories** — More granular waste classification (e-waste, biomedical, etc.)
- [ ] **Continuous Learning** — Automated retraining pipeline using incoming live data
- [ ] **Larger Datasets** — Improved accuracy through diverse, region-specific training data

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

</div>
