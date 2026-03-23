from flask import Blueprint, jsonify
from app.models import get_forecast_insights

insights_bp = Blueprint('insights', __name__)

@insights_bp.route('/top-demand', methods=['GET'])
def fetch_top_demand():

    data = get_forecast_insights()

    if isinstance(data, dict) and "error" in data:
        return jsonify({
            "status": "error",
            "message": data["error"]
        }), 400

    return jsonify({
        "status": "success",
        "message": "AI Insights generated for January 2025",
        "data": data
    })