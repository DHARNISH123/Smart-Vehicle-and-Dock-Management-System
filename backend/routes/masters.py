from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import json
from models import Supplier, Transporter, Dock, Material, User, AuditLog
from database import db

masters_bp = Blueprint("masters", __name__)

def log_activity(operator, action, description):
    log = AuditLog(operator=operator, action=action, description=description)
    db.session.add(log)
    db.session.commit()

def get_operator():
    identity_str = get_jwt_identity()
    try:
        identity_dict = json.loads(identity_str)
        return identity_dict.get("username", "system")
    except Exception:
        return str(identity_str)

# --- SUPPLIERS CRUD ---
@masters_bp.route("/suppliers", methods=["GET"])
@jwt_required()
def list_suppliers():
    suppliers = Supplier.query.order_by(Supplier.name).all()
    return jsonify([{"id": s.id, "name": s.name, "priority": s.priority, "created_at": s.created_at.isoformat()} for s in suppliers])

@masters_bp.route("/suppliers", methods=["POST"])
@jwt_required()
def create_supplier():
    data = request.get_json() or {}
    name = data.get("name")
    priority = int(data.get("priority") or 0)
    if not name:
        return jsonify({"error": "Name required"}), 400
    
    operator = get_operator()
    supplier = Supplier(name=name, priority=priority, created_by=operator, updated_by=operator)
    db.session.add(supplier)
    db.session.commit()
    log_activity(operator, "Create Supplier", f"Created supplier {name}")
    return jsonify({"success": True, "id": supplier.id})

@masters_bp.route("/suppliers/<int:id>", methods=["PUT"])
@jwt_required()
def update_supplier(id):
    supplier = Supplier.query.get_or_404(id)
    data = request.get_json() or {}
    supplier.name = data.get("name", supplier.name)
    supplier.priority = int(data.get("priority", supplier.priority))
    
    operator = get_operator()
    supplier.updated_by = operator
    db.session.commit()
    log_activity(operator, "Update Supplier", f"Updated supplier ID {id} to {supplier.name}")
    return jsonify({"success": True})

@masters_bp.route("/suppliers/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_supplier(id):
    supplier = Supplier.query.get_or_404(id)
    operator = get_operator()
    db.session.delete(supplier)
    db.session.commit()
    log_activity(operator, "Delete Supplier", f"Deleted supplier {supplier.name}")
    return jsonify({"success": True})


# --- TRANSPORTERS CRUD ---
@masters_bp.route("/transporters", methods=["GET"])
@jwt_required()
def list_transporters():
    transporters = Transporter.query.order_by(Transporter.name).all()
    return jsonify([{"id": t.id, "name": t.name, "contact": t.contact, "created_at": t.created_at.isoformat()} for t in transporters])

@masters_bp.route("/transporters", methods=["POST"])
@jwt_required()
def create_transporter():
    data = request.get_json() or {}
    name = data.get("name")
    contact = data.get("contact", "")
    if not name:
        return jsonify({"error": "Name required"}), 400
    
    operator = get_operator()
    transporter = Transporter(name=name, contact=contact, created_by=operator, updated_by=operator)
    db.session.add(transporter)
    db.session.commit()
    log_activity(operator, "Create Transporter", f"Created transporter {name}")
    return jsonify({"success": True, "id": transporter.id})

@masters_bp.route("/transporters/<int:id>", methods=["PUT"])
@jwt_required()
def update_transporter(id):
    transporter = Transporter.query.get_or_404(id)
    data = request.get_json() or {}
    transporter.name = data.get("name", transporter.name)
    transporter.contact = data.get("contact", transporter.contact)
    
    operator = get_operator()
    transporter.updated_by = operator
    db.session.commit()
    log_activity(operator, "Update Transporter", f"Updated transporter ID {id}")
    return jsonify({"success": True})

@masters_bp.route("/transporters/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_transporter(id):
    transporter = Transporter.query.get_or_404(id)
    operator = get_operator()
    db.session.delete(transporter)
    db.session.commit()
    log_activity(operator, "Delete Transporter", f"Deleted transporter {transporter.name}")
    return jsonify({"success": True})


# --- DOCKS CRUD ---
@masters_bp.route("/docks", methods=["GET"])
@jwt_required()
def list_docks():
    docks = Dock.query.order_by(Dock.code).all()
    return jsonify([{
        "id": d.id, 
        "code": d.code, 
        "name": d.name, 
        "is_active": d.is_active, 
        "is_available": d.is_available,
        "capabilities": d.capabilities,
        "created_at": d.created_at.isoformat()
    } for d in docks])

@masters_bp.route("/docks", methods=["POST"])
@jwt_required()
def create_dock():
    data = request.get_json() or {}
    code = data.get("code")
    name = data.get("name")
    capabilities = data.get("capabilities", "All")
    if not code or not name:
        return jsonify({"error": "Code and Name required"}), 400
    
    operator = get_operator()
    dock = Dock(code=code, name=name, capabilities=capabilities, created_by=operator, updated_by=operator)
    db.session.add(dock)
    db.session.commit()
    log_activity(operator, "Create Dock", f"Created dock {name} ({code})")
    return jsonify({"success": True, "id": dock.id})

@masters_bp.route("/docks/<int:id>", methods=["PUT"])
@jwt_required()
def update_dock(id):
    dock = Dock.query.get_or_404(id)
    data = request.get_json() or {}
    dock.code = data.get("code", dock.code)
    dock.name = data.get("name", dock.name)
    dock.capabilities = data.get("capabilities", dock.capabilities)
    dock.is_active = data.get("is_active", dock.is_active)
    
    operator = get_operator()
    dock.updated_by = operator
    db.session.commit()
    log_activity(operator, "Update Dock", f"Updated dock {dock.code}")
    return jsonify({"success": True})

@masters_bp.route("/docks/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_dock(id):
    dock = Dock.query.get_or_404(id)
    operator = get_operator()
    db.session.delete(dock)
    db.session.commit()
    log_activity(operator, "Delete Dock", f"Deleted dock {dock.name}")
    return jsonify({"success": True})


# --- MATERIALS CRUD ---
@masters_bp.route("/materials", methods=["GET"])
@jwt_required()
def list_materials():
    materials = Material.query.order_by(Material.code).all()
    return jsonify([{"id": m.id, "code": m.code, "name": m.name, "dock_capabilities": m.dock_capabilities} for m in materials])

@masters_bp.route("/materials", methods=["POST"])
@jwt_required()
def create_material():
    data = request.get_json() or {}
    code = data.get("code")
    name = data.get("name")
    dock_capabilities = data.get("dock_capabilities", "All")
    if not code or not name:
        return jsonify({"error": "Code and Name required"}), 400
    
    operator = get_operator()
    material = Material(code=code, name=name, dock_capabilities=dock_capabilities, created_by=operator, updated_by=operator)
    db.session.add(material)
    db.session.commit()
    log_activity(operator, "Create Material", f"Created material {name} ({code})")
    return jsonify({"success": True, "id": material.id})

@masters_bp.route("/materials/<int:id>", methods=["PUT"])
@jwt_required()
def update_material(id):
    material = Material.query.get_or_404(id)
    data = request.get_json() or {}
    material.code = data.get("code", material.code)
    material.name = data.get("name", material.name)
    material.dock_capabilities = data.get("dock_capabilities", material.dock_capabilities)
    
    operator = get_operator()
    material.updated_by = operator
    db.session.commit()
    log_activity(operator, "Update Material", f"Updated material {material.code}")
    return jsonify({"success": True})

@masters_bp.route("/materials/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_material(id):
    material = Material.query.get_or_404(id)
    operator = get_operator()
    db.session.delete(material)
    db.session.commit()
    log_activity(operator, "Delete Material", f"Deleted material {material.name}")
    return jsonify({"success": True})


# --- USERS CRUD ---
@masters_bp.route("/users", methods=["GET"])
@jwt_required()
def list_users():
    users = User.query.order_by(User.username).all()
    return jsonify([{
        "id": u.id, 
        "username": u.username, 
        "role": u.role, 
        "full_name": u.full_name,
        "mobile": u.mobile,
        "email": u.email
    } for u in users])

@masters_bp.route("/users", methods=["POST"])
@jwt_required()
def create_user():
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")
    role = data.get("role", "operator")
    full_name = data.get("full_name", "")
    mobile = data.get("mobile", "")
    email = data.get("email", "")
    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400
    
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400
        
    operator = get_operator()
    user = User(username=username, role=role, full_name=full_name, mobile=mobile, email=email, created_by=operator, updated_by=operator)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    log_activity(operator, "Create User", f"Created user {username} with role {role}")
    return jsonify({"success": True, "id": user.id})

@masters_bp.route("/users/<int:id>", methods=["PUT"])
@jwt_required()
def update_user(id):
    user = User.query.get_or_404(id)
    data = request.get_json() or {}
    user.role = data.get("role", user.role)
    user.full_name = data.get("full_name", user.full_name)
    user.mobile = data.get("mobile", user.mobile)
    user.email = data.get("email", user.email)
    
    password = data.get("password")
    if password:
        user.set_password(password)
        
    operator = get_operator()
    user.updated_by = operator
    db.session.commit()
    log_activity(operator, "Update User", f"Updated user {user.username}")
    return jsonify({"success": True})

@masters_bp.route("/users/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_user(id):
    user = User.query.get_or_404(id)
    if user.username == "admin":
        return jsonify({"error": "Cannot delete admin user"}), 400
    operator = get_operator()
    db.session.delete(user)
    db.session.commit()
    log_activity(operator, "Delete User", f"Deleted user {user.username}")
    return jsonify({"success": True})


# --- AUDIT LOGS ---
@masters_bp.route("/audit-logs", methods=["GET"])
@jwt_required()
def list_audit_logs():
    logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).limit(100).all()
    return jsonify([{
        "id": l.id,
        "operator": l.operator,
        "action": l.action,
        "description": l.description,
        "timestamp": l.timestamp.isoformat()
    } for l in logs])
