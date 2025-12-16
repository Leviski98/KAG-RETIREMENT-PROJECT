from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from .config import Config

db = SQLAlchemy()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)
    db.init_app(app)

    # Ensure tables exist
    from .models import District  # noqa: F401
    with app.app_context():
        db.create_all()

    from .routes.districts import bp as districts_bp
    from .routes.sections import bp as sections_bp
    from .routes.pastors import bp as pastors_bp
    app.register_blueprint(districts_bp, url_prefix="/api/v1")
    app.register_blueprint(sections_bp, url_prefix="/api/v1")
    app.register_blueprint(pastors_bp, url_prefix="/api/v1")
    return app


app = create_app()
