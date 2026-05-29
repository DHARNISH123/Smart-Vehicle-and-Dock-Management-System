from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime
from models import Vehicle, VehicleLog
from database import db

gate_bp = Blueprint("gate", __name__)

@gate_bp.route("/entry", methods=["POST"])
@jwt_required()
def gate_entry():
    data = request.get_json() or {}
    vehicle_number = data.get("vehicle_number")
    driver_name = data.get("driver_name")
    driver_mobile = data.get("driver_mobile")
    supplier_id = data.get("supplier_id")
    transporter_id = data.get("transporter_id")
    material_type = data.get("material_type")
    if not vehicle_number or not driver_name or not driver_mobile:
        return jsonify({"error": "Vehicle number, driver name, and mobile required."}), 400
    token = f"TKN-{datetime.utcnow().year}-{int(datetime.utcnow().timestamp()) % 10000}"
    vehicle = Vehicle(
        vehicle_number=vehicle_number,
        driver_name=driver_name,
        driver_mobile=driver_mobile,
        material_type=material_type or "Default",
        report_time=datetime.utcnow(),
        token=token,
        status="Reported",
        supplier_id=supplier_id,
        transporter_id=transporter_id,
    )
    db.session.add(vehicle)
    db.session.commit()
    db.session.add(VehicleLog(vehicle=vehicle, status=vehicle.status, notes="Gate entry created"))
    db.session.commit()
    return jsonify({"vehicle_id": vehicle.id, "token": vehicle.token, "status": vehicle.status})
