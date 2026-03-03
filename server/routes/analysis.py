"""
Routes for property analysis and negotiation report generation
"""

from flask import Blueprint, request, jsonify
import firebase_admin
from firebase_admin import firestore
from services.ai_service import generate_negotiation_report
from datetime import datetime

analysis_bp = Blueprint('analysis', __name__)


@analysis_bp.route('/save-analysis', methods=['POST'])
def save_analysis():
    """
    Save a property analysis to Firestore
    """
    data = request.get_json()

    # Extract user ID from request (in production, get from auth token)
    user_id = data.get('user_id')
    if not user_id:
        return jsonify({"error": "User ID is required"}), 401

    # Validate required fields
    required_fields = ['property_data', 'questionnaire_data']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    try:
        db = firestore.client()

        # Create analysis document
        analysis_doc = {
            "user_id": user_id,
            "property_data": data['property_data'],
            "questionnaire_data": data['questionnaire_data'],
            "report": data.get('report'),  # May be None if not generated yet
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "status": "draft" if not data.get('report') else "completed"
        }

        # Save to Firestore
        doc_ref = db.collection('analyses').add(analysis_doc)
        analysis_id = doc_ref[1].id

        return jsonify({
            "success": True,
            "analysis_id": analysis_id,
            "message": "Analysis saved successfully"
        })

    except Exception as e:
        return jsonify({"error": f"Failed to save analysis: {str(e)}"}), 500


@analysis_bp.route('/generate-report', methods=['POST'])
def generate_report():
    """
    Generate a negotiation report based on property data and questionnaire
    """
    data = request.get_json()

    # Validate required fields
    required_fields = ['property_data', 'questionnaire_data']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    try:
        # Generate the report using AI service
        report = generate_negotiation_report(
            data['property_data'],
            data['questionnaire_data']
        )

        return jsonify({
            "success": True,
            "report": report
        })

    except Exception as e:
        return jsonify({"error": f"Failed to generate report: {str(e)}"}), 500


@analysis_bp.route('/user-analyses/<user_id>', methods=['GET'])
def get_user_analyses(user_id):
    """
    Get all analyses for a specific user
    """
    try:
        db = firestore.client()

        # Query analyses for this user
        analyses_ref = db.collection('analyses')
        query = analyses_ref.where('user_id', '==', user_id).order_by('created_at', direction=firestore.Query.DESCENDING)

        analyses = []
        for doc in query.stream():
            analysis = doc.to_dict()
            analysis['id'] = doc.id
            # Convert datetime to ISO string for JSON serialization
            if 'created_at' in analysis:
                analysis['created_at'] = analysis['created_at'].isoformat()
            if 'updated_at' in analysis:
                analysis['updated_at'] = analysis['updated_at'].isoformat()
            analyses.append(analysis)

        return jsonify({
            "success": True,
            "analyses": analyses
        })

    except Exception as e:
        return jsonify({"error": f"Failed to fetch analyses: {str(e)}"}), 500


@analysis_bp.route('/analysis/<analysis_id>', methods=['GET'])
def get_analysis(analysis_id):
    """
    Get a specific analysis by ID
    """
    try:
        db = firestore.client()

        # Get the analysis document
        doc_ref = db.collection('analyses').document(analysis_id)
        doc = doc_ref.get()

        if not doc.exists:
            return jsonify({"error": "Analysis not found"}), 404

        analysis = doc.to_dict()
        analysis['id'] = doc.id

        # Convert datetime to ISO string
        if 'created_at' in analysis:
            analysis['created_at'] = analysis['created_at'].isoformat()
        if 'updated_at' in analysis:
            analysis['updated_at'] = analysis['updated_at'].isoformat()

        return jsonify({
            "success": True,
            "analysis": analysis
        })

    except Exception as e:
        return jsonify({"error": f"Failed to fetch analysis: {str(e)}"}), 500


@analysis_bp.route('/analysis/<analysis_id>', methods=['DELETE'])
def delete_analysis(analysis_id):
    """
    Delete a specific analysis
    """
    try:
        db = firestore.client()

        # Delete the analysis document
        db.collection('analyses').document(analysis_id).delete()

        return jsonify({
            "success": True,
            "message": "Analysis deleted successfully"
        })

    except Exception as e:
        return jsonify({"error": f"Failed to delete analysis: {str(e)}"}), 500
