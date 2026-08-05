import os
from datetime import datetime
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from database import db, migrate, socketio
from models import User, Vehicle, VehicleLog, Dock, DockAllocation, Supplier, Transporter, Material
from routes.auth import auth_bp
from routes.vehicles import vehicles_bp
from routes.docks import docks_bp
from routes.reports import reports_bp
from routes.users import users_bp
from routes.gate import gate_bp
from routes.masters import masters_bp


def create_app():
    app = Flask(
        __name__,
        static_folder=os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")),
        static_url_path=""
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

    # Versioned API routes (Phase 12)
    app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")
    app.register_blueprint(vehicles_bp, url_prefix="/api/v1/vehicles")
    app.register_blueprint(docks_bp, url_prefix="/api/v1/docks")
    app.register_blueprint(reports_bp, url_prefix="/api/v1/reports")
    app.register_blueprint(users_bp, url_prefix="/api/v1/users")
    app.register_blueprint(gate_bp, url_prefix="/api/v1/gate")
    app.register_blueprint(masters_bp, url_prefix="/api/v1/masters")

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
        # Seed default users for different roles
        users_seed = [
            {"username": "admin", "role": "admin", "full_name": "Administrator", "password": "admin123"},
            {"username": "gate", "role": "gate_operator", "full_name": "Gate Operator", "password": "operator123"},
            {"username": "dock", "role": "dock_supervisor", "full_name": "Dock Supervisor", "password": "supervisor123"},
            {"username": "warehouse", "role": "warehouse", "full_name": "Warehouse Staff", "password": "warehouse123"},
            {"username": "management", "role": "management", "full_name": "Management Viewer", "password": "management123"}
        ]
        for u_data in users_seed:
            if not User.query.filter_by(username=u_data["username"]).first():
                user = User(username=u_data["username"], role=u_data["role"], full_name=u_data["full_name"])
                user.set_password(u_data["password"])
                db.session.add(user)
        db.session.commit()

        # Seed 6 Docks with capabilities (Phase 4)
        if not Dock.query.first():
            docks_seed = [
                {"code": "Dock-1", "name": "Dock 1 (Perishable)", "capabilities": "Perishable"},
                {"code": "Dock-2", "name": "Dock 2 (Hazardous)", "capabilities": "Hazardous"},
                {"code": "Dock-3", "name": "Dock 3 (High Value)", "capabilities": "High Value"},
                {"code": "Dock-4", "name": "Dock 4 (General)", "capabilities": "All"},
                {"code": "Dock-5", "name": "Dock 5 (General)", "capabilities": "All"},
                {"code": "Dock-6", "name": "Dock 6 (General)", "capabilities": "All"}
            ]
            for d in docks_seed:
                dock = Dock(code=d["code"], name=d["name"], capabilities=d["capabilities"], is_available=True)
                db.session.add(dock)
            db.session.commit()

        # Seed Materials (Phase 8)
        if not Material.query.first():
            materials_seed = [
                {"code": "Perishable", "name": "Perishable Goods", "dock_capabilities": "Perishable"},
                {"code": "Hazardous", "name": "Hazardous Materials", "dock_capabilities": "Hazardous"},
                {"code": "High Value", "name": "High Value Electronics", "dock_capabilities": "High Value"},
                {"code": "Default", "name": "General Cargo", "dock_capabilities": "All"}
            ]
            for m in materials_seed:
                mat = Material(code=m["code"], name=m["name"], dock_capabilities=m["dock_capabilities"])
                db.session.add(mat)
            db.session.commit()

        # Seed Suppliers
        if not Supplier.query.first():
            db.session.add_all([
                Supplier(name="Supplier A", priority=4),
                Supplier(name="Supplier B", priority=2),
                Supplier(name="Supplier C", priority=1),
            ])
            db.session.commit()

        # Seed Transporters
        if not Transporter.query.first():
            db.session.add_all([
                Transporter(name="Transporter X", contact="+919900112233"),
                Transporter(name="Transporter Y", contact="+919900223344"),
            ])
            db.session.commit()

    with app.app_context():
        ensure_seed_data()

    return app, socketio
