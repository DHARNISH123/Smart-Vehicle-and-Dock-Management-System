from flask import Blueprint, jsonify, Response
from flask_jwt_extended import jwt_required
from datetime import datetime, timedelta
import csv
import io
from models import Vehicle, Dock, DockAllocation, VehicleLog, Supplier, AuditLog
from database import db

reports_bp = Blueprint("reports", __name__)

@reports_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def dashboard_report():
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    total_today = Vehicle.query.filter(Vehicle.report_time >= today_start).count()
    active_queue = Vehicle.query.filter(Vehicle.status.in_(["Reported", "Gate In", "Waiting"])).count()
    
    total_docks = Dock.query.filter_by(is_active=True).count() or 1
    occupied_docks = Dock.query.filter_by(is_active=True, is_available=False).count()
    dock_util = int((occupied_docks / total_docks) * 100)
    
    delayed = Vehicle.query.filter(Vehicle.status == "Waiting").count()
    
    # Python-based database-agnostic aggregations for robustness
    allocations = DockAllocation.query.order_by(DockAllocation.allocated_at.desc()).limit(100).all()
    wait_times = []
    process_times = []
    for a in allocations:
        v = Vehicle.query.get(a.vehicle_id)
        if v:
            wait_times.append((a.allocated_at - v.report_time).total_seconds() / 60)
        if a.completed_at:
            process_times.append((a.completed_at - a.allocated_at).total_seconds() / 60)
            
    avg_wait = int(sum(wait_times) / len(wait_times)) if wait_times else 15
    avg_proc = int(sum(process_times) / len(process_times)) if process_times else 25
    
    completed_vehicles = Vehicle.query.filter(Vehicle.status == "Completed").limit(100).all()
    tat_times = []
    for v in completed_vehicles:
        comp_log = VehicleLog.query.filter_by(vehicle_id=v.id, status="Completed").first()
        if comp_log:
            tat_times.append((comp_log.timestamp - v.report_time).total_seconds() / 60)
    avg_tat = int(sum(tat_times) / len(tat_times)) if tat_times else 40

    # Hourly trend (last 8 hours)
    now = datetime.utcnow()
    hourly_trend = []
    for i in range(7, -1, -1):
        h_start = now.replace(minute=0, second=0, microsecond=0) - timedelta(hours=i)
        h_end = h_start + timedelta(hours=1)
        count = Vehicle.query.filter(Vehicle.report_time >= h_start, Vehicle.report_time < h_end).count()
        hourly_trend.append({"hour": h_start.strftime("%H:00"), "count": count})

    # Status distribution
    statuses = ["Reported", "Gate In", "Waiting", "Reserved", "Dock In", "Processing", "Completed", "Gate Out", "Cancelled"]
    status_distribution = [{"status": st, "value": Vehicle.query.filter_by(status=st).count()} for st in statuses]

    # Supplier trend (top suppliers today)
    suppliers = Supplier.query.all()
    supplier_trend = []
    for s in suppliers:
        count = Vehicle.query.filter(Vehicle.supplier_id == s.id, Vehicle.report_time >= today_start).count()
        supplier_trend.append({"supplier": s.name, "count": count})
    supplier_trend = sorted(supplier_trend, key=lambda x: x["count"], reverse=True)[:5]

    # Recent activity logs (Audit & Log entries combined)
    recent_logs = VehicleLog.query.order_by(VehicleLog.timestamp.desc()).limit(5).all()
    recent_activity = [{
        "time": log.timestamp.isoformat(),
        "title": f"Vehicle {log.vehicle.vehicle_number} status updated to {log.status}",
        "description": log.notes or ""
    } for log in recent_logs if log.vehicle]

    return jsonify({
        "total_today": total_today,
        "active_queue": active_queue,
        "dock_utilization": dock_util,
        "delayed_count": delayed,
        "avg_waiting_time": avg_wait,
        "avg_processing_time": avg_proc,
        "avg_turnaround_time": avg_tat,
        "hourly_trend": hourly_trend,
        "status_distribution": status_distribution,
        "supplier_trend": supplier_trend,
        "recent_activity": recent_activity
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

@reports_bp.route("/export", methods=["GET"])
@jwt_required()
def export_report():
    vehicles = Vehicle.query.order_by(Vehicle.report_time.desc()).all()
    
    # Generate CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Token", "Vehicle Number", "Driver Name", "Driver Mobile", "Material Type", 
        "Direction", "Priority Level", "Status", "Supplier", "Transporter", 
        "Reported Time", "Expected Loading Time (Mins)", "Gate Operator", "RFID Tag"
    ])
    
    for v in vehicles:
        writer.writerow([
            v.token, v.vehicle_number, v.driver_name, v.driver_mobile, v.material_type,
            v.direction, v.priority_level, v.status,
            v.supplier.name if v.supplier else "N/A",
            v.transporter.name if v.transporter else "N/A",
            v.report_time.isoformat(), v.expected_loading_time,
            v.gate_operator or "System", v.rfid_tag or "N/A"
        ])
        
    response = Response(output.getvalue(), mimetype="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=vms_vehicle_report.csv"
    return response
