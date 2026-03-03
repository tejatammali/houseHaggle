"""
AI service for generating negotiation reports and price recommendations
Currently uses mock/algorithmic responses - replace with OpenAI GPT-4 when ready
"""


def generate_negotiation_report(property_data, questionnaire_data):
    """
    Generate a comprehensive negotiation report based on property data and user input.
    Mock implementation using algorithmic logic - replace with GPT-4 API call.

    Args:
        property_data (dict): Objective property data (comps, trends)
        questionnaire_data (dict): User's subjective analysis from questionnaire

    Returns:
        dict: Negotiation report with recommended price and talking points
    """

    listing_price = property_data['listing_price']
    avg_comp_price = property_data['market_trends']['avg_comp_price']
    scorecard = questionnaire_data['scorecard']
    hooks = questionnaire_data['seductive_hooks']
    weak_spots = questionnaire_data['weak_spots']
    renovation_costs = questionnaire_data['renovation_costs']
    gut_check_price = questionnaire_data['gut_check_price']

    # Calculate average score from scorecard
    total_score = sum(scorecard.values())
    avg_score = total_score / len(scorecard)
    max_possible = 10 * len(scorecard)
    score_percentage = (total_score / max_possible) * 100

    # Calculate total renovation costs
    total_reno_cost = sum(item['cost'] for item in renovation_costs)

    # Calculate recommended offer using multiple factors
    # Start with comp average
    base_offer = avg_comp_price

    # Adjust based on scorecard (max ±10%)
    score_adjustment = ((avg_score - 5) / 5) * 0.10  # -10% to +10%
    base_offer *= (1 + score_adjustment)

    # Adjust for weak spots (subtract renovation costs)
    base_offer -= (total_reno_cost * 0.5)  # Assume 50% of reno cost is negotiable

    # Consider market temperature
    market_temp = property_data['market_trends']['market_temperature']
    if market_temp == 'hot':
        base_offer *= 1.02  # Add 2% in hot market
    elif market_temp == 'cool':
        base_offer *= 0.98  # Reduce 2% in cool market

    # Ensure offer doesn't exceed gut check or listing price
    recommended_offer = min(base_offer, gut_check_price, listing_price * 0.98)
    recommended_offer = max(recommended_offer, listing_price * 0.85)  # Not below 85%

    # Create offer range (±2%)
    offer_low = recommended_offer * 0.98
    offer_high = recommended_offer * 1.02

    # Generate rationale
    rationale = f"Based on our analysis of {len(property_data['comps'])} comparable properties, "
    rationale += f"the average market price is ${avg_comp_price:,.0f}. "

    if score_percentage < 65:
        rationale += f"However, your scorecard ratings (averaging {avg_score:.1f}/10) indicate significant room for improvement. "
    elif score_percentage > 85:
        rationale += f"Your scorecard ratings are strong (averaging {avg_score:.1f}/10), but there are still opportunities to negotiate. "
    else:
        rationale += f"Your scorecard ratings (averaging {avg_score:.1f}/10) suggest a balanced property with both strengths and areas of concern. "

    if total_reno_cost > 0:
        rationale += f"Considering the ${total_reno_cost:,.0f} in estimated renovation costs to address weak spots, "
        rationale += f"a starting offer of ${recommended_offer:,.0f} is justified. "

    rationale += f"The local market is currently {market_temp}, "
    if market_temp == 'hot':
        rationale += "so be prepared to move quickly but still negotiate firmly on identified weak spots."
    elif market_temp == 'cool':
        rationale += "which gives you more leverage to negotiate based on the property's weak spots."
    else:
        rationale += "providing a balanced environment for negotiation."

    # Generate talking points
    talking_points = []

    # Point 1: Market comparison
    if avg_comp_price < listing_price:
        talking_points.append({
            "title": "Market Comps Support Lower Price",
            "detail": f"Recent comparable sales average ${avg_comp_price:,.0f}, which is ${listing_price - avg_comp_price:,.0f} below the listing price."
        })
    else:
        talking_points.append({
            "title": "Listing Is Competitively Priced",
            "detail": f"The listing price aligns with recent comps (avg ${avg_comp_price:,.0f}), but property-specific issues justify a lower offer."
        })

    # Point 2: Weak spots leverage
    if weak_spots:
        top_weak_spot = weak_spots[0]
        talking_points.append({
            "title": f"Critical Issue: {top_weak_spot['what']}",
            "detail": f"{top_weak_spot['why']} This is a significant concern that affects the property's value and livability."
        })

    # Point 3: Renovation costs
    if total_reno_cost > 0:
        talking_points.append({
            "title": "Substantial Renovation Required",
            "detail": f"Estimated ${total_reno_cost:,.0f} in necessary improvements to bring the property up to market standards. Specifically: {', '.join([item['what'] for item in renovation_costs[:3]])}."
        })

    # Point 4: Balance with hooks
    if hooks:
        talking_points.append({
            "title": "Acknowledged Strengths",
            "detail": f"We appreciate the property's {hooks[0]['what'].lower()} ({hooks[0]['why'].lower()}), but this doesn't offset the substantial improvements needed."
        })

    # Point 5: Market conditions
    if market_temp == 'cool':
        talking_points.append({
            "title": "Market Conditions Favor Buyers",
            "detail": f"With an average of {property_data['market_trends']['avg_days_on_market']} days on market, buyers currently have negotiating leverage."
        })
    elif market_temp == 'hot':
        talking_points.append({
            "title": "Strong Offer Despite Hot Market",
            "detail": f"Even in this competitive market, our offer reflects the property's specific condition and required improvements."
        })

    # Trim to top 5 talking points
    talking_points = talking_points[:5]

    return {
        "recommended_offer": {
            "amount": round(recommended_offer, -3),
            "range": {
                "low": round(offer_low, -3),
                "high": round(offer_high, -3)
            },
            "percentage_of_listing": round((recommended_offer / listing_price) * 100, 1)
        },
        "rationale": rationale,
        "talking_points": talking_points,
        "analysis_summary": {
            "avg_scorecard_rating": round(avg_score, 1),
            "score_percentage": round(score_percentage, 1),
            "total_renovation_cost": total_reno_cost,
            "num_weak_spots": len(weak_spots),
            "num_seductive_hooks": len(hooks),
            "market_temperature": market_temp,
            "gap_from_gut_check": round(gut_check_price - recommended_offer, -3)
        },
        "negotiation_strategy": _generate_strategy(market_temp, weak_spots, hooks),
        "generated_by": "mock_ai",  # Indicates this is algorithmic, not GPT-4
        "confidence_score": 85  # Mock confidence score
    }


def _generate_strategy(market_temp, weak_spots, hooks):
    """Generate negotiation strategy based on conditions"""

    strategy = []

    # Opening strategy
    if market_temp == 'hot':
        strategy.append("Start with your recommended offer and be prepared for counteroffers. Emphasize your readiness to close quickly.")
    elif market_temp == 'cool':
        strategy.append("Start 3-5% below your recommended offer to leave room for negotiation. Take your time to thoroughly inspect.")
    else:
        strategy.append("Start at your recommended offer. Be firm but fair, emphasizing specific property concerns.")

    # Weak spot strategy
    if len(weak_spots) >= 3:
        strategy.append("Use your detailed list of weak spots as leverage. Request a pre-inspection to document concerns.")
    elif weak_spots:
        strategy.append(f"Focus negotiations on the key issue: {weak_spots[0]['what']}. Get contractor estimates to support your position.")

    # Hook acknowledgment
    if hooks:
        strategy.append(f"Acknowledge the property's strengths (especially {hooks[0]['what']}) to show you're a serious buyer who has done thorough research.")

    # Closing strategy
    strategy.append("Be prepared to walk away if the seller won't negotiate reasonably. There are other properties.")

    return strategy
