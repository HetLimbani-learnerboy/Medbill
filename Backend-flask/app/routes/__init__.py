from .auth_routes import auth_bp
from .receipt_routes import receipt_bp

    
def register_blueprints(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(receipt_bp)