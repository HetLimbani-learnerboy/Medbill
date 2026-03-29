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
            "found": True,
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

    barcode = data.get("barcode")
    name = data.get("medicine_name")

    if not barcode or not name:
        return jsonify({"message": "Barcode and Medicine Name required"}), 400

    existing = Medicine.query.filter_by(barcode=barcode).first()
    if existing:
        return jsonify({"message": "Medicine with this barcode already exists"}), 400

    price = float(data.get("price", 0))
    quantity = int(data.get("quantity", 0))
    expiry_date = None
    if data.get("expiry_date"):
        expiry_date = datetime.strptime(data.get("expiry_date"), "%Y-%m-%d").date()
    else:
        expiry_date = datetime.utcnow().date() + timedelta(days=365*2)

    manufacture_date = datetime.utcnow().date()

    new_medicine = Medicine(
        barcode=barcode,
        medicine_name=name,
        company=data.get("company", "Unknown"),
        category=data.get("category", "General"),
        composition=data.get("composition", "Not Specified"),
        price=price,
        quantity=quantity,
        manufacture_date=manufacture_date,
        expiry_date=expiry_date,
        distributor=data.get("distributor", "Default Distributor"),
        discount=float(data.get("discount", 0.0)),
        tax_percentage=float(data.get("tax_percentage", 0.0))
    )

    db.session.add(new_medicine)
    db.session.commit()

    return jsonify({"message": "Medicine added successfully"}), 201


# Updated PUT route in medicine_bp.py
@medicine_bp.route("/api/inventory/<string:barcode>", methods=["PUT"])
def update_medicine(barcode):
    data = request.get_json()

    med = Medicine.query.filter_by(barcode=barcode).first()
    if not med:
        return jsonify({"message": "Medicine not found"}), 404

    if "new_stock" in data:
        med.quantity += int(data.get("new_stock", 0))
    elif "quantity" in data:
        med.quantity = int(data.get("quantity", med.quantity))

    med.medicine_name = data.get("medicine_name", med.medicine_name)
    med.company = data.get("company", med.company)
    med.category = data.get("category", med.category)
    med.composition = data.get("composition", med.composition)

    if data.get("price") is not None:
        med.price = float(data.get("price"))

    med.distributor = data.get("distributor", med.distributor)
    if data.get("expiry_date"):
        med.expiry_date = datetime.strptime(data.get("expiry_date"), "%Y-%m-%d").date()

    db.session.commit()
    return jsonify({
        "message": "Updated successfully",
        "new_total": med.quantity
    }), 200