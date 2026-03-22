from .auth_routes import auth_bp
from .receipt_routes import receipt_bp
from .medicine_routes import medicine_bp
from app.routes.barcode_routes import barcode_bp

    
def register_blueprints(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(receipt_bp)
    app.register_blueprint(medicine_bp)
    app.register_blueprint(barcode_bp)