from datetime import datetime
from models import Dock, DockAllocation, Vehicle, VehicleLog
from database import db

MATERIAL_PRIORITY = {
    "Perishable": 5,
    "Hazardous": 4,
    "High Value": 4,
    "Default": 1,
}

def compute_priority(vehicle):
    supplier_priority = vehicle.supplier.priority if vehicle.supplier else 0
    material_priority = MATERIAL_PRIORITY.get(vehicle.material_type, MATERIAL_PRIORITY["Default"])
    
    # Priority Level weight: Critical=5, Urgent=3, Normal=1
    prio_level_weights = {"Normal": 1, "Urgent": 3, "Critical": 5}
    prio_level_weight = prio_level_weights.get(vehicle.priority_level, 1)
    
    waiting_time = int((datetime.utcnow() - vehicle.waiting_started).total_seconds() / 60)
    return supplier_priority + material_priority + prio_level_weight + waiting_time

def auto_allocate(vehicle):
    # Find active, available docks
    docks = Dock.query.filter_by(is_active=True, is_available=True).all()
    if not docks:
        return None
        
    # Filter by dock capability matching vehicle material_type
    compatible_docks = [
        d for d in docks 
        if d.capabilities == "All" or d.capabilities.lower() == vehicle.material_type.lower()
    ]
    
    if not compatible_docks:
        return None
        
    # Prefer specific capability dock over 'All'
    free_dock = min(compatible_docks, key=lambda d: 0 if d.capabilities.lower() == vehicle.material_type.lower() else 1)
    
    free_dock.is_available = False
    free_dock.current_vehicle_id = vehicle.id
    vehicle.status = "Dock In"
    allocation = DockAllocation(dock=free_dock, vehicle=vehicle, status="Allocated")
    db.session.add(allocation)
    db.session.add(vehicle)
    db.session.add(free_dock)
    db.session.commit()
    
    log = VehicleLog(vehicle=vehicle, status=vehicle.status, notes=f"Auto allocated to {free_dock.name}")
    db.session.add(log)
    db.session.commit()
    return allocation

def manual_allocate(dock_id, vehicle):
    dock = Dock.query.get(dock_id)
    if not dock or not dock.is_available:
        return None
    dock.is_available = False
    dock.current_vehicle_id = vehicle.id
    vehicle.status = "Dock In"
    allocation = DockAllocation(dock=dock, vehicle=vehicle, status="Allocated")
    db.session.add_all([dock, vehicle, allocation])
    db.session.commit()
    db.session.add(VehicleLog(vehicle=vehicle, status=vehicle.status, notes=f"Manually allocated to {dock.name}"))
    db.session.commit()
    return allocation
