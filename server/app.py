"""
HouseHaggle Flask Backend
Main application entry point
"""

from flask import Flask, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials
import os
from config import Config

# Import blueprints
from routes.properties import properties_bp
from routes.analysis import analysis_bp


def create_app(config_class=Config):
    """Application factory"""

    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize CORS
    CORS(app, origins=config_class.CORS_ORIGINS)

    # Initialize Firebase Admin (only if credentials exist)
    if not firebase_admin._apps:
        try:
            # Check if credentials file exists
            if os.path.exists(config_class.FIREBASE_CREDENTIALS_PATH):
                cred = credentials.Certificate(config_class.FIREBASE_CREDENTIALS_PATH)
                firebase_admin.initialize_app(cred)
                print("✓ Firebase Admin initialized successfully")
            else:
                print("⚠ Firebase credentials not found. Firestore operations will fail.")
                print(f"  Expected path: {config_class.FIREBASE_CREDENTIALS_PATH}")
                print("  Please add your serviceAccountKey.json file to use database features.")
        except Exception as e:
            print(f"⚠ Firebase initialization failed: {e}")

    # Register blueprints
    app.register_blueprint(properties_bp, url_prefix='/api/properties')
    app.register_blueprint(analysis_bp, url_prefix='/api/analysis')

    # Health check route
    @app.route('/health')
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": "HouseHaggle API"
        })

    # Root route
    @app.route('/')
    def index():
        return jsonify({
            "message": "HouseHaggle API",
            "version": "1.0.0",
            "endpoints": {
                "health": "/health",
                "properties": "/api/properties",
                "analysis": "/api/analysis"
            }
        })

    return app


if __name__ == '__main__':
    app = create_app()
    print("\n" + "="*50)
    print("🏠 HouseHaggle API Server")
    print("="*50)
    print(f"Running on: http://localhost:5000")
    print(f"CORS enabled for: {Config.CORS_ORIGINS}")
    print("="*50 + "\n")

    app.run(
        host='0.0.0.0',
        port=5000,
        debug=Config.DEBUG
    )
