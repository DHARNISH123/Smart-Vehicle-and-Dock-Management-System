import os
import requests
from config import Config
from models import Notification, Vehicle
from database import db


def send_whatsapp_message(vehicle_id: int, message: str):
    vehicle = Vehicle.query.get(vehicle_id)
    if not vehicle:
        return None

    account_sid = Config.WHATSAPP_ACCOUNT_SID
    auth_token = Config.WHATSAPP_AUTH_TOKEN
    from_number = Config.WHATSAPP_FROM
    if not account_sid or not auth_token:
        notification = Notification(vehicle=vehicle, message=message, delivered=False)
        db.session.add(notification)
        db.session.commit()
        return {
            "status": "mock",
            "message": "WhatsApp credentials not configured. Saved mock notification."
        }

    url = Config.WHATSAPP_API_URL.format(AccountSid=account_sid)
    payload = {
        "From": from_number,
        "To": f"whatsapp:+{vehicle.driver_mobile.lstrip('+')}" if vehicle.driver_mobile else "",
        "Body": message,
    }
    response = requests.post(url, data=payload, auth=(account_sid, auth_token))
    notification = Notification(vehicle=vehicle, message=message, delivered=response.ok)
    db.session.add(notification)
    db.session.commit()
    return {
        "status": "sent" if response.ok else "failed",
        "response": response.text,
    }
