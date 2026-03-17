from app.extensions import db
from datetime import datetime


class Receipt(db.Model):
    __tablename__ = "receipts"

    id = db.Column(db.Integer, primary_key=True)

    receipt_id = db.Column(
        db.String(30),
        unique=True,
        nullable=False,
        default=lambda: f"REC-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    )

    customer_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120))
    phone_number = db.Column(db.String(15))

    subtotal = db.Column(db.Float, nullable=False)
    gst_percent = db.Column(db.Float, default=0)
    gst_amount = db.Column(db.Float, default=0)

    offer_percent = db.Column(db.Float, default=0)
    offer_amount = db.Column(db.Float, default=0)

    total_amount = db.Column(db.Float, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    items = db.relationship("ReceiptItem", backref="receipt", lazy=True)


class ReceiptItem(db.Model):
    __tablename__ = "receipt_items"

    id = db.Column(db.Integer, primary_key=True)

    receipt_id = db.Column(
        db.String(30),
        db.ForeignKey("receipts.receipt_id"),
        nullable=False
    )

    medicine_name = db.Column(db.String(200), nullable=False)
    medicine_price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)

    total_price = db.Column(db.Float, nullable=False)