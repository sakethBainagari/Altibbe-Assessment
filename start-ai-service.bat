@echo off
echo Starting AI Service...
cd ai-service
pip install -r requirements.txt
python app.py
