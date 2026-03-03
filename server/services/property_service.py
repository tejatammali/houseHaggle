"""
Property service for fetching property data and comps
Currently uses mock data - replace with real API calls when ready
"""

import random
from datetime import datetime, timedelta


def get_property_data(address, listing_price):
    """
    Fetch property data and comps for a given address.
    Mock implementation - replace with Zillow/Redfin API call.

    Args:
        address (str): Property address
        listing_price (float): Current listing price

    Returns:
        dict: Property data including comps and market trends
    """

    # Generate realistic mock data based on the listing price
    avg_comp_price = listing_price * random.uniform(0.92, 1.08)

    comps = []
    for i in range(5):
        days_ago = random.randint(10, 90)
        sold_date = datetime.now() - timedelta(days=days_ago)
        comp_price = avg_comp_price * random.uniform(0.90, 1.10)

        comps.append({
            "address": f"{random.randint(100, 999)} Mock St, Similar Area",
            "sold_price": round(comp_price, -3),  # Round to nearest thousand
            "sold_date": sold_date.strftime("%Y-%m-%d"),
            "days_ago": days_ago,
            "bedrooms": random.randint(2, 5),
            "bathrooms": random.randint(2, 4),
            "sqft": random.randint(1500, 3500),
            "similarity_score": random.randint(75, 98)
        })

    # Sort by similarity score
    comps.sort(key=lambda x: x['similarity_score'], reverse=True)

    # Calculate market trends
    avg_days_on_market = random.randint(15, 45)
    price_trend = random.choice(['rising', 'stable', 'declining'])
    trend_percentage = random.uniform(-3, 5)

    return {
        "address": address,
        "listing_price": listing_price,
        "comps": comps,
        "market_trends": {
            "avg_days_on_market": avg_days_on_market,
            "price_trend": price_trend,
            "trend_percentage": round(trend_percentage, 2),
            "avg_comp_price": round(avg_comp_price, -3),
            "market_temperature": "hot" if avg_days_on_market < 25 else "moderate" if avg_days_on_market < 40 else "cool"
        },
        "property_history": {
            "year_built": random.randint(1960, 2020),
            "last_sale_price": round(listing_price * random.uniform(0.70, 0.95), -3),
            "last_sale_date": (datetime.now() - timedelta(days=random.randint(365, 3650))).strftime("%Y-%m-%d")
        },
        "data_source": "mock",  # Indicates this is mock data
        "fetched_at": datetime.now().isoformat()
    }


def validate_address(address):
    """
    Validate that an address exists and is properly formatted.
    Mock implementation - always returns True for now.

    Args:
        address (str): Property address

    Returns:
        dict: Validation result with status and message
    """
    if not address or len(address) < 10:
        return {
            "valid": False,
            "message": "Please enter a complete property address"
        }

    # Mock validation - in production, use geocoding API
    return {
        "valid": True,
        "message": "Address validated",
        "normalized_address": address.strip()
    }
