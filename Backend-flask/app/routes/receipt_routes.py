from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Receipt, ReceiptItem
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime


receipt_bp = Blueprint("receipt_bp", __name__)


@receipt_bp.route("/api/receipts", methods=["POST"])
def create_receipt():
    data = request.get_json()

    customer_name = data.get("customer_name")
    total_amount = data.get("total_amount")
    items = data.get("items", [])

    if not customer_name or not items:
        return jsonify({"message": "Customer name and items required"}), 400

    try:
        new_receipt = Receipt(
            customer_name=customer_name,
            email=data.get("email"),
            phone_number=data.get("phone_number"),
            subtotal=float(data.get("subtotal", 0)),
            gst_percent=float(data.get("gst_percent", 0)),
            gst_amount=float(data.get("gst_amount", 0)),
            offer_percent=float(data.get("offer_percent", 0)),
            offer_amount=float(data.get("offer_amount", 0)),
            total_amount=float(total_amount)
        )

        db.session.add(new_receipt)
        db.session.flush()

        # Add items
        for item in items:
            price = float(item.get("price", 0))
            qty = int(item.get("quantity", 1))

            new_item = ReceiptItem(
                receipt_id=new_receipt.receipt_id,
                medicine_name=item.get("name"),
                medicine_price=price,
                quantity=qty,
                total_price=price * qty  
            )

            db.session.add(new_item)

        db.session.commit()

        return jsonify({
            "message": "Receipt created successfully",
            "receipt_id": new_receipt.receipt_id
        }), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"message": "DB error", "error": str(e)}), 500
    
    
@receipt_bp.route("/api/receipts/check-user", methods=["GET"])
def check_user():
    phone = request.args.get('phone')
    email = request.args.get('email')

    receipt = None

    if phone:
        receipt = Receipt.query.filter_by(phone_number=phone)\
            .order_by(Receipt.created_at.desc())\
            .first()

    elif email:
        receipt = Receipt.query.filter_by(email=email)\
            .order_by(Receipt.created_at.desc())\
            .first()

    if receipt:
        return jsonify({
            "exists": True,
            "customer_name": receipt.customer_name,
            "email": receipt.email,
            "phone_number": receipt.phone_number
        }), 200

    return jsonify({"exists": False}), 200

    
@receipt_bp.route("/api/receipts", methods=["GET"])
def get_receipts():
    receipts = Receipt.query.all()

    result = []

    for r in receipts:
        items = ReceiptItem.query.filter_by(receipt_id=r.receipt_id).all()

        result.append({
            "id": r.receipt_id,
            "customerName": r.customer_name,
            "customerEmail": r.email,
            "customerPhone": r.phone_number,
            "dateTime": r.created_at.strftime("%d %b %Y, %I:%M %p"),
            "billAmount": r.total_amount,

            # Static (you can make dynamic later)
            "shopName": "MedBill Pharmacy",
            "shopPhone": "+91 80000 11111",
            "creatorName": "Admin",

            "items": [
                {
                    "name": i.medicine_name,
                    "qty": i.quantity,
                    "pricePerUnit": i.medicine_price,
                    "total": i.total_price
                } for i in items
            ],

            "payment": {
                "method": "UPI",
                "transactionId": "AUTO-" + r.receipt_id,
                "customerId": r.email or "N/A",
                "time": r.created_at.strftime("%d %b %Y, %I:%M %p")
            }
        })

    return jsonify(result)

@receipt_bp.route("/api/receipts/<receipt_id>", methods=["GET"])
def get_single_receipt(receipt_id):
    r = Receipt.query.filter_by(receipt_id=receipt_id).first()

    if not r:
        return jsonify({"message": "Not found"}), 404

    items = ReceiptItem.query.filter_by(receipt_id=r.receipt_id).all()

    return jsonify({
        "id": r.receipt_id,
        "customerName": r.customer_name,
        "customerEmail": r.email,
        "customerPhone": r.phone_number,
        "billAmount": r.total_amount,
        "items": [
            {
                "name": i.medicine_name,
                "qty": i.quantity,
                "pricePerUnit": i.medicine_price,
                "total": i.total_price
            } for i in items
        ]
    })

@receipt_bp.route("/api/receipts/<receipt_id>", methods=["DELETE"])
def delete_receipt(receipt_id):

    receipt = Receipt.query.filter_by(receipt_id=receipt_id).first()

    if not receipt:
        return jsonify({"message": "Receipt not found"}), 404

    ReceiptItem.query.filter_by(receipt_id=receipt.id).delete()

    db.session.delete(receipt)
    db.session.commit()

    return jsonify({"message": "Receipt deleted"})