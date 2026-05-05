import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Header
import os

firebase_key_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY")
if not firebase_key_path:
    raise RuntimeError("Missing FIREBASE_SERVICE_ACCOUNT_KEY environment variable")

cred = credentials.Certificate(firebase_key_path)
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

async def verify_token(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")
    token = authorization.split(" ")[1]
    try:
        decoded = auth.verify_id_token(token)
        email = decoded.get("email", "")
        if not email.endswith("@umd.edu"):
            raise HTTPException(status_code=403, detail="Only UMD Terpmail addresses allowed")
        return decoded
    except Exception:
        raise HTTPException(status_code=401, detail="Token verification failed")