from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import json
from datetime import datetime
from models import Vehicle, VehicleLog, Supplier, Transporter, Dock, DockAllocation
from services.allocation import compute_priority, auto_allocate
from database import db, socketio
from services.notifications import send_whatsapp_message

vehicles_bp = Blueprint("vehicles", __name__)

@vehicles_bp.route("/", methods=["GET"])
@jwt_required()
def get_vehicles():
    vehicles = Vehicle.query.order_by(Vehicle.report_time.desc()).all()
    return jsonify([serialize_vehicle(v) for v in vehicles])

@vehicles_bp.route("/queue", methods=["GET"])
@jwt_required()
def get_queue():
    queue = Vehicle.query.filter(Vehicle.status.in_(["Reported", "Gate In", "Waiting"]))
    queue = queue.order_by(Vehicle.report_time.asc()).all()
    return jsonify([serialize_vehicle(v) for v in queue])

@vehicles_bp.route("/entry", methods=["POST"])
@jwt_required()
def create_entry():
    data = request.get_json() or {}
    vehicle_number = data.get("vehicle_number")
    driver_name = data.get("driver_name")
    driver_mobile = data.get("driver_mobile")
    material_type = data.get("material_type")
    supplier_id = data.get("supplier_id")
    transporter_id = data.get("transporter_id")
    
    # Phase 1 Fields
    direction = data.get("direction", "Inbound")
    priority_level = data.get("priority_level", "Normal")
    expected_loading_time = int(data.get("expected_loading_time") or 0)
    remarks = data.get("remarks", "")
    rfid_tag = data.get("rfid_tag", "")
    qr_code = data.get("qr_code", "")
    anpr_license_plate = data.get("anpr_license_plate", "")
    
    if not vehicle_number or not driver_name or not driver_mobile or not material_type:
        return jsonify({"error": "Required fields are missing."}), 400

    # Retrieve Operator Username from JWT
    identity_str = get_jwt_identity()
    try:
        identity_dict = json.loads(identity_str)
        gate_operator = identity_dict.get("username", "system")
    except Exception:
        gate_operator = str(identity_str)

    token = f"TKN-{datetime.utcnow().year}-{int(datetime.utcnow().timestamp()) % 10000}"
    vehicle = Vehicle(
        vehicle_number=vehicle_number,
        driver_name=driver_name,
        driver_mobile=driver_mobile,
        material_type=material_type,
        report_time=datetime.utcnow(),
        token=token,
        status="Reported",
        supplier_id=supplier_id,
        transporter_id=transporter_id,
        direction=direction,
        priority_level=priority_level,
        expected_loading_time=expected_loading_time,
        remarks=remarks,
        gate_operator=gate_operator,
        rfid_tag=rfid_tag,
        qr_code=qr_code,
        anpr_license_plate=anpr_license_plate,
    )
    db.session.add(vehicle)
    db.session.commit()
    vehicle.priority_score = compute_priority(vehicle)
    db.session.add(vehicle)
    db.session.add(VehicleLog(vehicle=vehicle, status=vehicle.status, notes="Registered at gate"))
    db.session.commit()
    allocation = auto_allocate(vehicle)
    
    vehicle_data = serialize_vehicle(vehicle)
    socketio.emit("vehicle_update", vehicle_data)
    
    if allocation:
        socketio.emit("dock_update", {"dock_id": allocation.dock_id, "status": "allocated"})
        msg = f"Welcome to Gate-2-Dock! Your vehicle {vehicle.vehicle_number} has been allocated to {allocation.dock.name}. Please proceed directly to the dock."
        send_whatsapp_message(vehicle.id, msg)
    else:
        msg = f"Welcome to Gate-2-Dock! Your Token is {vehicle.token}. You are now in the waiting queue. Track live status: http://localhost:3000/track/{vehicle.token}"
        send_whatsapp_message(vehicle.id, msg)
        
    return jsonify({"vehicle": vehicle_data, "allocation": allocation and allocation.id})

ALLOWED_TRANSITIONS = {
    "Reported": ["Gate In", "Cancelled"],
    "Gate In": ["Waiting", "Cancelled"],
    "Waiting": ["Reserved", "Dock In", "Cancelled"],
    "Reserved": ["Dock In", "Cancelled"],
    "Dock In": ["Processing", "Cancelled"],
    "Processing": ["Completed", "Cancelled"],
    "Completed": ["Gate Out"],
    "Gate Out": [],
    "Cancelled": []
}

def can_transition(current, target):
    if current == target:
        return True
    return target in ALLOWED_TRANSITIONS.get(current, [])

@vehicles_bp.route("/<int:vehicle_id>/status", methods=["PATCH"])
@jwt_required()
def update_status(vehicle_id):
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    data = request.get_json() or {}
    status = data.get("status")
    notes = data.get("notes")
    if not status:
        return jsonify({"error": "Status required."}), 400
        
    if not can_transition(vehicle.status, status):
        return jsonify({"error": f"Invalid status transition from {vehicle.status} to {status}."}), 400
        
    vehicle.status = status
    db.session.add(vehicle)
    db.session.add(VehicleLog(vehicle=vehicle, status=status, notes=notes))
    db.session.commit()
    
    if status in ["Completed", "Gate Out", "Cancelled"]:
        allocation = DockAllocation.query.filter_by(vehicle_id=vehicle.id, completed_at=None).first()
        if allocation:
            allocation.completed_at = datetime.utcnow()
            allocation.status = "Completed" if status == "Completed" else "Cancelled"
            db.session.add(allocation)
            
            dock = Dock.query.get(allocation.dock_id)
            if dock:
                dock.is_available = True
                dock.current_vehicle_id = None
                db.session.add(dock)
                
            db.session.commit()
            socketio.emit("dock_update", {"dock_id": allocation.dock_id, "status": "free"})
            
    vehicle_data = serialize_vehicle(vehicle)
    socketio.emit("vehicle_update", vehicle_data)
    
    if status == "Completed":
        msg = f"Loading/unloading complete for Token {vehicle.token}! You are cleared to exit via Gate Out. Thank you."
        send_whatsapp_message(vehicle.id, msg)
    elif status == "Waiting":
        msg = f"Yard alert for Token {vehicle.token}. You have been placed on standby. Please wait in the holding yard."
        send_whatsapp_message(vehicle.id, msg)
    
    return jsonify(vehicle_data)

@vehicles_bp.route("/public/track/<string:token>", methods=["GET"])
def public_track_vehicle(token):
    vehicle = Vehicle.query.filter_by(token=token).first()
    if not vehicle:
        return jsonify({"error": "Vehicle token not found"}), 404
        
    position = 0
    if vehicle.status in ["Reported", "Gate In", "Waiting"]:
        position = Vehicle.query.filter(
            Vehicle.status.in_(["Reported", "Gate In", "Waiting"]),
            Vehicle.report_time <= vehicle.report_time
        ).count()
        
    data = serialize_vehicle(vehicle)
    data["queue_position"] = position
    
    if vehicle.allocation and vehicle.allocation.status == "Allocated":
        data["dock_code"] = vehicle.allocation.dock.code
        data["dock_name"] = vehicle.allocation.dock.name
    else:
        data["dock_code"] = None
        data["dock_name"] = None
        
    return jsonify(data)


@vehicles_bp.route("/suppliers", methods=["GET"])
@jwt_required()
def get_suppliers():
    suppliers = Supplier.query.order_by(Supplier.name).all()
    return jsonify([{"id": s.id, "name": s.name, "priority": s.priority} for s in suppliers])

@vehicles_bp.route("/transporters", methods=["GET"])
@jwt_required()
def get_transporters():
    transporters = Transporter.query.order_by(Transporter.name).all()
    return jsonify([{"id": t.id, "name": t.name, "contact": t.contact} for t in transporters])


def serialize_vehicle(vehicle):
    wait_minutes = int((datetime.utcnow() - vehicle.report_time).total_seconds() / 60)
    return {
        "id": vehicle.id,
        "vehicle_number": vehicle.vehicle_number,
        "driver_name": vehicle.driver_name,
        "driver_mobile": vehicle.driver_mobile,
        "material_type": vehicle.material_type,
        "report_time": vehicle.report_time.isoformat(),
        "token": vehicle.token,
        "status": vehicle.status,
        "supplier": vehicle.supplier.name if vehicle.supplier else None,
        "transporter": vehicle.transporter.name if vehicle.transporter else None,
        "priority_score": vehicle.priority_score,
        "waiting_minutes": wait_minutes,
        "direction": vehicle.direction,
        "priority_level": vehicle.priority_level,
        "expected_loading_time": vehicle.expected_loading_time,
        "remarks": vehicle.remarks,
        "gate_operator": vehicle.gate_operator,
        "rfid_tag": vehicle.rfid_tag,
        "qr_code": vehicle.qr_code,
        "anpr_license_plate": vehicle.anpr_license_plate,
    }
