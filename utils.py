from jose import jwt
from datetime import datetime, timedelta, timezone
import bcrypt

SECRET_KEY = "mykey"
ALGO = "HS256"


def hash_password(password):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password, hashed):
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_jwt(user_id):
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=3)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGO)
