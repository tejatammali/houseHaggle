import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Application configuration"""

    # Flask
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    DEBUG = os.environ.get('FLASK_DEBUG', 'True') == 'True'

    # Firebase
    FIREBASE_CREDENTIALS_PATH = os.environ.get('FIREBASE_CREDENTIALS_PATH', 'serviceAccountKey.json')

    # CORS
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',')

    # API Keys (for future use)
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    ZILLOW_API_KEY = os.environ.get('ZILLOW_API_KEY')
