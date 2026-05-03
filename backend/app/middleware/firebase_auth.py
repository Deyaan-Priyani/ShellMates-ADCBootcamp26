import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Header
import os

cred = credentials.Certificate(os.getenv("Desktop/ProjectADC/ShellMates-ADCBootcamp26/backend/firebase-service-account.json"))
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