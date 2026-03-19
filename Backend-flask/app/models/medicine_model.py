from app import db
from datetime import datetime

class Medicine(db.Model):
    __tablename__ = "medicine"

    id = db.Column(db.Integer, primary_key=True)

    medicine_id = db.Column(
        db.String(30),
        unique=True,
        nullable=False,
        default=lambda: f"MED-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    )

    medicine_name = db.Column(db.String(100), unique=True, nullable=False)
    company = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50))  # Tablet, Syrup, Injection
    composition = db.Column(db.String(200))  # e.g., Paracetamol 500mg
    price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    manufacture_date = db.Column(db.Date)
    expiry_date = db.Column(db.Date, nullable=False)
    distributor = db.Column(db.String(100))
    discount = db.Column(db.Float, default=0.0)
    tax_percentage = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)