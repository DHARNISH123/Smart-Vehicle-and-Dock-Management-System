from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime, timedelta
from models import Dock, DockAllocation, Vehicle
from services.allocation import manual_allocate
from database import db, socketio
from routes.vehicles import serialize_vehicle
from services.notifications import send_whatsapp_message

docks_bp = Blueprint("docks", __name__)

@docks_bp.route("", methods=["GET"])
@jwt_required()
def list_docks():
    docks = Dock.query.order_by(Dock.code).all()
    return jsonify([serialize_dock(d) for d in docks])

@docks_bp.route("/allocate", methods=["POST"])
@jwt_required()
def allocate_dock():
    data = request.get_json() or {}
    vehicle_id = data.get("vehicle_id")
    dock_id = data.get("dock_id")
    vehicle = Vehicle.query.get(vehicle_id)
    if not vehicle:
        return jsonify({"error": "Vehicle not found"}), 404
        
    # Validation check: check capabilities constraint
    dock = Dock.query.get(dock_id)
    if not dock:
        return jsonify({"error": "Dock not found"}), 404
        
    if dock.capabilities != "All" and dock.capabilities.lower() != vehicle.material_type.lower():
        return jsonify({"error": f"Dock capability mismatch. Dock supports {dock.capabilities}, vehicle has {vehicle.material_type}."}), 400

    allocation = manual_allocate(dock_id, vehicle)
    if not allocation:
        return jsonify({"error": "Unable to allocate dock."}), 400
        
    socketio.emit("dock_update", {"dock_id": dock_id, "vehicle_id": vehicle.id, "status": "allocated"})
    socketio.emit("vehicle_update", serialize_vehicle(vehicle))
    
    msg = f"Attention Driver! You have been allocated to {allocation.dock.name}. Please proceed directly to the dock with vehicle {vehicle.vehicle_number}."
    send_whatsapp_message(vehicle.id, msg)
    
    return jsonify({"message": "Vehicle allocated", "allocation": allocation.id})

@docks_bp.route("/allocations", methods=["GET"])
@jwt_required()
def get_allocations():
    allocations = DockAllocation.query.order_by(DockAllocation.allocated_at.desc()).all()
    return jsonify([serialize_allocation(a) for a in allocations])


def serialize_dock(dock):
    current_vehicle = None
    active_alloc = DockAllocation.query.filter_by(dock_id=dock.id, completed_at=None).first()
    
    if dock.current_vehicle_id:
        v = Vehicle.query.get(dock.current_vehicle_id)
        if v:
            elapsed = int((datetime.utcnow() - active_alloc.allocated_at).total_seconds() / 60) if active_alloc else 0
            expected_mins = v.expected_loading_time or 30
            expected_time = (active_alloc.allocated_at + timedelta(minutes=expected_mins)).isoformat() if active_alloc else None
            
            current_vehicle = {
                "id": v.id,
                "vehicle_number": v.vehicle_number,
                "driver_name": v.driver_name,
                "status": v.status,
                "supplier": v.supplier.name if v.supplier else None,
                "operator": v.gate_operator or "System",
                "elapsed_minutes": elapsed,
                "expected_completion": expected_time
            }
            
    return {
        "id": dock.id,
        "code": dock.code,
        "name": dock.name,
        "is_active": dock.is_active,
        "is_available": dock.is_available,
        "capabilities": dock.capabilities,
        "current_vehicle": current_vehicle
    }


def serialize_allocation(allocation):
    return {
        "id": allocation.id,
        "dock": allocation.dock.name,
        "vehicle_id": allocation.vehicle_id,
        "allocated_at": allocation.allocated_at.isoformat(),
        "status": allocation.status,
    }
