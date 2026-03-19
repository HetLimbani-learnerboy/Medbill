from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.medicine_model import Medicine
from datetime import datetime, timedelta

medicine_bp = Blueprint("medicine_bp", __name__)

@medicine_bp.route("/api/inventory", methods=["GET"])
def get_all_medicines():
    medicines = Medicine.query.all()

    return jsonify([
        {
            "medicine_id": m.medicine_id,
            "medicine_name": m.medicine_name,
            "company": m.company,
            "price": m.price,
            "quantity": m.quantity
        } for m in medicines
    ])
    
@medicine_bp.route("/api/inventory", methods=["POST"])
def inventory():
    data = request.get_json()

    medicine_name = data.get("medicine_name")
    company = data.get("company")
    price = data.get("price")
    quantity = data.get("quantity")

    from datetime import datetime, timedelta

    new_medicine = Medicine(
        medicine_name=medicine_name,
        company=company,
        category="General",
        composition="Not Specified",
        price=price,
        quantity=quantity,
        manufacture_date=datetime.utcnow().date(),
        expiry_date=datetime.utcnow().date() + timedelta(days=365*2),
        distributor="Default Distributor",
        discount=0.0,
        tax_percentage=0.0
    )

    db.session.add(new_medicine)
    db.session.commit()

    return jsonify({"message": "Added"}), 201

@medicine_bp.route("/api/inventory/medicine-name/<string:medicine_name>", methods=["PUT"])
def update_medicine(medicine_name):
    data = request.get_json()

    med = Medicine.query.filter_by(medicine_name=medicine_name).first()

    if not med:
        return jsonify({"message": "Medicine not found"}), 404

    quantity = data.get("quantity")

    if quantity is not None:
        med.quantity = quantity

    db.session.commit()

    return jsonify({
        "message": "Updated successfully",
        "medicine_name": med.medicine_name,
        "new_quantity": med.quantity
    })