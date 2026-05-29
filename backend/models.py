from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.dialects.postgresql import JSON
from database import db

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False, default="operator")
    full_name = db.Column(db.String(120))
    mobile = db.Column(db.String(30))
    email = db.Column(db.String(120), unique=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Supplier(db.Model):
    __tablename__ = "suppliers"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    priority = db.Column(db.Integer, default=0)
    vehicles = db.relationship("Vehicle", backref="supplier", lazy=True)

class Transporter(db.Model):
    __tablename__ = "transporters"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    contact = db.Column(db.String(80))
    vehicles = db.relationship("Vehicle", backref="transporter", lazy=True)

class Dock(db.Model):
    __tablename__ = "docks"
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    is_available = db.Column(db.Boolean, default=True)
    current_vehicle_id = db.Column(db.Integer, db.ForeignKey("vehicles.id"), nullable=True)
    allocations = db.relationship("DockAllocation", backref="dock", lazy=True)

class Vehicle(db.Model):
    __tablename__ = "vehicles"
    id = db.Column(db.Integer, primary_key=True)
    vehicle_number = db.Column(db.String(80), nullable=False)
    driver_name = db.Column(db.String(120), nullable=False)
    driver_mobile = db.Column(db.String(30), nullable=False)
    material_type = db.Column(db.String(120), nullable=False)
    report_time = db.Column(db.DateTime, default=datetime.utcnow)
    token = db.Column(db.String(80), unique=True, nullable=False)
    status = db.Column(db.String(50), default="Reported")
    supplier_id = db.Column(db.Integer, db.ForeignKey("suppliers.id"), nullable=True)
    transporter_id = db.Column(db.Integer, db.ForeignKey("transporters.id"), nullable=True)
    priority_score = db.Column(db.Integer, default=0)
    waiting_started = db.Column(db.DateTime, default=datetime.utcnow)
    log_entries = db.relationship("VehicleLog", backref="vehicle", lazy=True)
    allocation = db.relationship("DockAllocation", backref="vehicle", uselist=False)

class VehicleLog(db.Model):
    __tablename__ = "vehicle_logs"
    id = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey("vehicles.id"), nullable=False)
    status = db.Column(db.String(80), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.Text)

class DockAllocation(db.Model):
    __tablename__ = "dock_allocations"
    id = db.Column(db.Integer, primary_key=True)
    dock_id = db.Column(db.Integer, db.ForeignKey("docks.id"), nullable=False)
    vehicle_id = db.Column(db.Integer, db.ForeignKey("vehicles.id"), nullable=False)
    allocated_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(50), default="Allocated")
    notes = db.Column(db.Text)

class Notification(db.Model):
    __tablename__ = "notifications"
    id = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey("vehicles.id"), nullable=True)
    message = db.Column(db.Text, nullable=False)
    channel = db.Column(db.String(50), default="whatsapp")
    sent_at = db.Column(db.DateTime, default=datetime.utcnow)
    delivered = db.Column(db.Boolean, default=False)

class Report(db.Model):
    __tablename__ = "reports"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    type = db.Column(db.String(80), nullable=False)
    data = db.Column(JSON)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)
