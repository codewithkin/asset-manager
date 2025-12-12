from datetime import datetime, timedelta
import os
from jose import jwt
from passlib.context import CryptContext
from dotenv import load_dotenv
import psycopg2
from psycopg2.errors import UniqueViolation
from psycopg2.extras import RealDictCursor

# Load env
load_dotenv()

# JWT / security settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Database connection for auth module (separate connection to avoid circular imports)
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", 5432)
DB_NAME = os.getenv("DB_NAME", "warranty_db")
DB_USER = os.getenv("DB_USER", "warranty_user")
DB_PASSWORD = os.getenv("DB_PASSWORD", "StrongPassword123!")

try:
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )
except Exception:
    conn = None

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def authenticate_user(username: str, password: str):
    """Return user dict if credentials are valid, otherwise None."""
    if conn is None:
        return None
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT id, username, hashed_password FROM users WHERE username = %s", (username,))
            user = cursor.fetchone()
            if not user:
                return None
            if not verify_password(password, user["hashed_password"]):
                return None
            return user
    except Exception:
        return None


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_user(username: str, password: str):
    """Create a new user in the DB. Returns created user row (without hashed_password) or None on error."""
    if conn is None:
        return None
    hashed = get_password_hash(password)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                "INSERT INTO users (username, hashed_password, created_at) VALUES (%s, %s, NOW()) RETURNING id, username, created_at",
                (username, hashed),
            )
            user = cursor.fetchone()
            conn.commit()
            return user
    except UniqueViolation:
        # Username already exists
        if conn:
            conn.rollback()
        return {"error": "duplicate"}
    except Exception:
        if conn:
            conn.rollback()
        return None
