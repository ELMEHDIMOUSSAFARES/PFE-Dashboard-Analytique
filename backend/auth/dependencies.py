from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from auth_utils import hash_password, verify_password, create_access_token, decode_token
from fastapi import Depends, HTTPException

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)

    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return payload

