"""
Routes for property-related operations
"""

from flask import Blueprint, request, jsonify
from services.property_service import get_property_data, validate_address

properties_bp = Blueprint('properties', __name__)


@properties_bp.route('/validate-address', methods=['POST'])
def validate_property_address():
    """Validate a property address"""
    data = request.get_json()
    address = data.get('address')

    if not address:
        return jsonify({"error": "Address is required"}), 400

    result = validate_address(address)
    return jsonify(result)


@properties_bp.route('/property-data', methods=['POST'])
def fetch_property_data():
    """
    Fetch property data including comps and market trends
    """
    data = request.get_json()
    address = data.get('address')
    listing_price = data.get('listing_price')

    if not address or not listing_price:
        return jsonify({"error": "Address and listing price are required"}), 400

    try:
        listing_price = float(listing_price)
    except ValueError:
        return jsonify({"error": "Invalid listing price"}), 400

    # Validate address first
    validation = validate_address(address)
    if not validation['valid']:
        return jsonify({"error": validation['message']}), 400

    # Fetch property data
    property_data = get_property_data(address, listing_price)

    return jsonify(property_data)
