from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime
from models import Vehicle, Dock, DockAllocation
from database import db

reports_bp = Blueprint("reports", __name__)

@reports_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def dashboard_report():
    total_today = Vehicle.query.filter(Vehicle.report_time >= datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)).count()
    active_queue = Vehicle.query.filter(Vehicle.status.in_(["Reported", "Gate In", "Waiting"])) .count()
    dock_utilization = Dock.query.filter_by(is_available=False).count()
    delayed = Vehicle.query.filter(Vehicle.status == "Waiting").count()
    vehicles = Vehicle.query.order_by(Vehicle.report_time.desc()).limit(10).all()
    return jsonify({
        "total_today": total_today,
        "active_queue": active_queue,
        "dock_utilization": dock_utilization,
        "delayed_count": delayed,
        "latest_vehicles": [{"token": v.token, "vehicle_number": v.vehicle_number, "status": v.status} for v in vehicles],
    })

@reports_bp.route("/kpis", methods=["GET"])
@jwt_required()
def kpis():
    total = Vehicle.query.count()
    completed = Vehicle.query.filter(Vehicle.status == "Completed").count()
    on_time_pct = int((completed / total) * 100) if total else 0
    return jsonify({
        "total_vehicles": total,
        "completed_vehicles": completed,
        "on_time_percentage": on_time_pct,
        "dock_utilization": Dock.query.filter_by(is_available=False).count(),
    })
