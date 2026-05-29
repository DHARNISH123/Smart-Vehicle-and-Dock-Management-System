from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import User
from database import db

users_bp = Blueprint("users", __name__)

@users_bp.route("/", methods=["GET"])
@jwt_required()
def list_users():
    users = User.query.order_by(User.username).all()
    return jsonify([{
        "id": u.id,
        "username": u.username,
        "full_name": u.full_name,
        "role": u.role,
        "email": u.email,
        "mobile": u.mobile,
    } for u in users])

@users_bp.route("/<int:user_id>", methods=["PATCH"])
@jwt_required()
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}
    user.full_name = data.get("full_name", user.full_name)
    user.role = data.get("role", user.role)
    user.email = data.get("email", user.email)
    user.mobile = data.get("mobile", user.mobile)
    db.session.commit()
    return jsonify({"message": "User updated"})
