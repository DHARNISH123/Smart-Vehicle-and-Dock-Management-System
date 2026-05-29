import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(os.path.dirname(__file__), 'smartdock.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "superjwtsecret")
    SOCKETIO_MESSAGE_QUEUE = os.getenv("REDIS_URL", None)
    WHATSAPP_API_URL = os.getenv("WHATSAPP_API_URL", "https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json")
    WHATSAPP_ACCOUNT_SID = os.getenv("WHATSAPP_ACCOUNT_SID", "")
    WHATSAPP_AUTH_TOKEN = os.getenv("WHATSAPP_AUTH_TOKEN", "")
    WHATSAPP_FROM = os.getenv("WHATSAPP_FROM", "whatsapp:+14155238886")
