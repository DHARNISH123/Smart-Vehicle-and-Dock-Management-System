from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import Dock, DockAllocation, Vehicle
from services.allocation import manual_allocate
from database import db

docks_bp = Blueprint("docks", __name__)

@docks_bp.route("/", methods=["GET"])
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
    allocation = manual_allocate(dock_id, vehicle)
    if not allocation:
        return jsonify({"error": "Unable to allocate dock."}), 400
    return jsonify({"message": "Vehicle allocated", "allocation": allocation.id})

@docks_bp.route("/allocations", methods=["GET"])
@jwt_required()
def get_allocations():
    allocations = DockAllocation.query.order_by(DockAllocation.allocated_at.desc()).all()
    return jsonify([serialize_allocation(a) for a in allocations])


def serialize_dock(dock):
    return {
        "id": dock.id,
        "code": dock.code,
        "name": dock.name,
        "is_available": dock.is_available,
        "current_vehicle": dock.current_vehicle_id,
    }


def serialize_allocation(allocation):
    return {
        "id": allocation.id,
        "dock": allocation.dock.name,
        "vehicle_id": allocation.vehicle_id,
        "allocated_at": allocation.allocated_at.isoformat(),
        "status": allocation.status,
    }
