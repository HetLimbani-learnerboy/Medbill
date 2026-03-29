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
            "barcode": m.barcode,
            "medicine_name": m.medicine_name,
            "company": m.company,
            "price": m.price,
            "quantity": m.quantity,
            "expiry_date": m.expiry_date.strftime('%Y-%m-%d') if m.expiry_date else None
        } for m in medicines
    ])
    
@medicine_bp.route("/api/inventory/<string:barcode>", methods=["GET"])
def get_medicine_by_barcode(barcode):
    # Queries the 'barcode' column specifically
    med = Medicine.query.filter_by(barcode=barcode).first()
    
    if not med:
        return jsonify({"message": "Medicine not found"}), 404

    return jsonify({
        "barcode": med.barcode,
        "medicine_name": med.medicine_name,
        "company": med.company,
        "price": med.price,
        "quantity": med.quantity
    }), 200
    
@medicine_bp.route("/api/inventory/search", methods=["GET"])
def search_medicine():
    # Get the 'name' query parameter from the URL: /api/inventory/search?name=para
    query_name = request.args.get('name', '')
    
    if not query_name:
        return jsonify([]), 200

    # Search for names containing the string (case-insensitive)
    results = Medicine.query.filter(
        Medicine.medicine_name.ilike(f"%{query_name}%")
    ).limit(10).all() 

    return jsonify([
        {
            "barcode": m.barcode,
            "medicine_name": m.medicine_name,
            "company": m.company,
            "price": m.price,
            "quantity": m.quantity
        } for m in results
    ])
    
@medicine_bp.route("/api/inventory", methods=["POST"])
def add_medicine():
    data = request.get_json()

    if not data.get("barcode") or not data.get("medicine_name"):
        return jsonify({"message": "Barcode and Medicine Name required"}), 400

    # Prevent duplicate barcode
    existing = Medicine.query.filter_by(barcode=data.get("barcode")).first()
    if existing:
        return jsonify({"message": "Medicine with this barcode already exists"}), 400

    new_medicine = Medicine(
        barcode=data.get("barcode"),
        medicine_name=data.get("medicine_name"),
        company=data.get("company"),
        category=data.get("category", "General"),
        composition=data.get("composition", "Not Specified"),
        price=data.get("price", 0),
        quantity=data.get("quantity", 0),
        manufacture_date=data.get("manufacture_date"),
        expiry_date=data.get("expiry_date"),
        distributor=data.get("distributor"),
        discount=data.get("discount", 0.0),
        tax_percentage=data.get("tax_percentage", 0.0)
    )

    db.session.add(new_medicine)
    db.session.commit()

    return jsonify({"message": "Medicine added successfully"}), 201


@medicine_bp.route("/api/inventory/<string:barcode>", methods=["PUT"])
def update_medicine(barcode):
    data = request.get_json()

    med = Medicine.query.filter_by(barcode=barcode).first()

    if not med:
        return jsonify({"message": "Medicine not found"}), 404

    # Update fields dynamically
    med.medicine_name = data.get("medicine_name", med.medicine_name)
    med.company = data.get("company", med.company)
    med.category = data.get("category", med.category)
    med.composition = data.get("composition", med.composition)
    med.price = data.get("price", med.price)
    med.quantity = data.get("quantity", med.quantity)
    med.distributor = data.get("distributor", med.distributor)
    med.discount = data.get("discount", med.discount)
    med.tax_percentage = data.get("tax_percentage", med.tax_percentage)

    db.session.commit()

    return jsonify({
        "message": "Medicine updated successfully",
        "barcode": med.barcode
    })