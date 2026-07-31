import os
from datetime import datetime
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from database import db, migrate, socketio
from models import User, Vehicle, VehicleLog, Dock, DockAllocation, Supplier, Transporter
from routes.auth import auth_bp
from routes.vehicles import vehicles_bp
from routes.docks import docks_bp
from routes.reports import reports_bp
from routes.users import users_bp
from routes.gate import gate_bp


def create_app():
    app = Flask(
        __name__,
        static_folder=os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")),
        static_url_path="/"
    )
    app.config.from_object(Config)
    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)
    jwt = JWTManager(app)

    import json
    @jwt.user_identity_loader
    def user_identity_lookup(user):
        return json.dumps(user) if isinstance(user, dict) else str(user)

    socketio.init_app(app)

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(vehicles_bp, url_prefix="/api/vehicles")
    app.register_blueprint(docks_bp, url_prefix="/api/docks")
    app.register_blueprint(reports_bp, url_prefix="/api/reports")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(gate_bp, url_prefix="/api/gate")

    @app.route("/api/ping")
    def ping():
        return jsonify({"message": "pong", "time": datetime.utcnow().isoformat()})

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve(path):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, "index.html")


    def ensure_seed_data():
        db.create_all()
        if not User.query.filter_by(username="admin").first():
            admin = User(username="admin", role="admin", full_name="Administrator")
            admin.set_password("admin123")
            db.session.add(admin)
            db.session.commit()
        if not Dock.query.first():
            for idx in range(1, 5):
                dock = Dock(code=f"Dock-{idx}", name=f"Dock {idx}", is_available=True)
                db.session.add(dock)
            db.session.commit()
        if not Supplier.query.first():
            db.session.add_all([
                Supplier(name="Supplier A", priority=4),
                Supplier(name="Supplier B", priority=2),
                Supplier(name="Supplier C", priority=1),
            ])
            db.session.commit()
        if not Transporter.query.first():
            db.session.add_all([
                Transporter(name="Transporter X", contact="+919900112233"),
                Transporter(name="Transporter Y", contact="+919900223344"),
            ])
            db.session.commit()

    with app.app_context():
        ensure_seed_data()

    return app, socketio


if __name__ == "__main__":
    app, socketio = create_app()
    port = int(os.getenv("PORT", 5000))
    socketio.run(app, host="0.0.0.0", port=port, debug=True, allow_unsafe_werkzeug=True)
