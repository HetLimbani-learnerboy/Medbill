from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Receipt, ReceiptItem
from sqlalchemy.exc import SQLAlchemyError

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
    
@receipt_bp.route("/api/receipts", methods=["GET"])
def get_receipts():

    receipts = Receipt.query.order_by(Receipt.created_at.desc()).all()

    data = []

    for receipt in receipts:
        data.append({
            "receipt_id": receipt.receipt_id,
            "customer_name": receipt.customer_name,
            "total_amount": receipt.total_amount,
            "created_at": receipt.created_at
        })

    return jsonify(data)

@receipt_bp.route("/api/receipts/<receipt_id>", methods=["GET"])
def get_receipt(receipt_id):

    receipt = Receipt.query.filter_by(receipt_id=receipt_id).first()

    if not receipt:
        return jsonify({"message": "Receipt not found"}), 404

    items = []

    for item in receipt.items:
        items.append({
            "medicine_name": item.medicine_name,
            "price": item.medicine_price,
            "quantity": item.quantity,
            "total_price": item.total_price
        })

    return jsonify({
        "receipt_id": receipt.receipt_id,
        "customer_name": receipt.customer_name,
        "email": receipt.email,
        "phone_number": receipt.phone_number,
        "subtotal": receipt.subtotal,
        "gst_amount": receipt.gst_amount,
        "offer_amount": receipt.offer_amount,
        "total_amount": receipt.total_amount,
        "items": items,
        "created_at": receipt.created_at
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