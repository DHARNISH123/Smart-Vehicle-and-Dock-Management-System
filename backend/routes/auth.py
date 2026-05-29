from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models import User
from database import db

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400
    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401
    token = create_access_token(identity={"id": user.id, "username": user.username, "role": user.role})
    return jsonify({"access_token": token, "user": {"username": user.username, "role": user.role, "full_name": user.full_name}})

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")
    role = data.get("role", "operator")
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "User exists"}), 400
    user = User(username=username, role=role, full_name=data.get("full_name"), email=data.get("email"), mobile=data.get("mobile"))
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User created successfully"}), 201
