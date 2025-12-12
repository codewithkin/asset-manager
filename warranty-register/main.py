from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel
from psycopg2.extras import RealDictCursor
import psycopg2
from dotenv import load_dotenv
import os
from typing import Optional

# auth helpers
from auth.user import authenticate_user, create_access_token, create_user
from auth.utils import get_current_user

# Load environment variables from .env
load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", 5432)
DB_NAME = os.getenv("DB_NAME", "warranty_db")
DB_USER = os.getenv("DB_USER", "warranty_user")
DB_PASSWORD = os.getenv("DB_PASSWORD", "StrongPassword123!")

app = FastAPI()

# Database connection
try:
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )
except Exception as e:
    raise RuntimeError(f"Failed to connect to the database: {e}")

# Input validation model
class Warranty(BaseModel):
    asset_id: str
    asset_name: str
    user_id: str


class UserCreate(BaseModel):
    username: str
    password: str

# Custom handler for empty or invalid request body
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for e in exc.errors():
        loc = e.get("loc", [])
        msg = e.get("msg", "")
        # If the body is completely missing, show friendly message
        if loc == ("body",) or (len(loc) == 1 and loc[0] == "body"):
            errors.append({"field": "body", "message": "Request body is missing or empty"})
        else:
            errors.append({"field": loc[-1], "message": msg})
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": "Validation failed",
            "details": errors
        },
    )

@app.post("/register-warranty")
def register_warranty(warranty: Warranty):
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                "INSERT INTO warranties (asset_id, asset_name, user_id) VALUES (%s, %s, %s) RETURNING id, registered_at",
                (warranty.asset_id, warranty.asset_name, warranty.user_id)
            )
            result = cursor.fetchone()
            conn.commit()
        return {"success": True, "warranty_id": result["id"], "registered_at": result["registered_at"]}
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e.pgerror}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


from fastapi import Depends
from fastapi.security import OAuth2PasswordRequestForm

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/register")
def register(user: UserCreate):
    # create user in DB
    created = create_user(user.username, user.password)
    if not created:
        raise HTTPException(status_code=400, detail="Unable to create user (may already exist)")
    return {"success": True, "user": {"id": created.get("id"), "username": created.get("username")}}

@app.get("/warranties")
def get_warranties(current_user: str = Depends(get_current_user)):
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT id, asset_id, asset_name, user_id, registered_at FROM warranties ORDER BY registered_at DESC")
            warranties = cursor.fetchall()
        return {"success": True, "data": warranties}
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e.pgerror}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
