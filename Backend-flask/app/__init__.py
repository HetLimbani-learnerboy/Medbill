from flask import Flask
from config import Config
from app.extensions import db, migrate
from app.routes import register_blueprints
from flask_cors import CORS

def create_app():

    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)

    register_blueprints(app)  

    return app