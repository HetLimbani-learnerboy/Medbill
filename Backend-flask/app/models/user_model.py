from app import db
from sqlalchemy.sql import func
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    username = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    password_hash = db.Column(db.String(256), nullable=False)

    role = db.Column(db.String(20), default="user")
    is_verified = db.Column(db.Boolean, default=False)

    created_at = db.Column(
        db.DateTime(timezone=True),
        server_default=func.now()
    )

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)



    def __repr__(self):
        return f"<User {self.username}>"
    