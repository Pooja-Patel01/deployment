# Water Quality Monitor – Backend Guide
Beginner-Friendly Setup & Development Guide

This guide is written for interns who:
- Are new to backend development
- Have never used FastAPI
- Have never worked with PostgreSQL
- Do not know how APIs work

Follow step by step. Do not skip sections.

------------------------------------------------------------
1. What Is The Backend?
------------------------------------------------------------

The backend is the brain of the system.

It:
- Receives requests from frontend
- Validates data
- Stores data in database
- Fetches government API data
- Sends alerts
- Returns responses

Simple flow:

Frontend sends request
-> Backend checks data
-> Backend talks to database
-> Backend returns response
-> Frontend displays result

The backend never shows UI.
It only returns JSON responses.

------------------------------------------------------------
2. Technologies Used
------------------------------------------------------------

- FastAPI (Python framework)
- PostgreSQL (Database)
- SQLAlchemy (ORM)
- JWT (Authentication)
- Pydantic (Data validation)
- Uvicorn (Server)
- Optional: Celery + Redis (background tasks)

------------------------------------------------------------
3. Install Required Software
------------------------------------------------------------

Before starting, install:

1. Python 3.10+
Download: https://www.python.org/downloads/
Check:
python --version

2. PostgreSQL
Download: https://www.postgresql.org/download/

3. Redis (optional for background tasks)
Download: https://redis.io/download

4. Git
Download: https://git-scm.com/

------------------------------------------------------------
4. Setup Backend Project
------------------------------------------------------------

Go to backend folder:

cd backend

Create virtual environment:

python -m venv venv

Activate:

Windows:
venv\Scripts\activate

Mac/Linux:
source venv/bin/activate

IMPORTANT:
Always activate venv before working.

------------------------------------------------------------
5. Install Dependencies
------------------------------------------------------------

If requirements.txt exists:

pip install -r requirements.txt

If not, install manually:

pip install fastapi
pip install uvicorn
pip install sqlalchemy
pip install psycopg2-binary
pip install python-jose
pip install passlib[bcrypt]
pip install python-dotenv
pip install pydantic

Optional (for background tasks):

pip install celery
pip install redis

------------------------------------------------------------
6. Create Database
------------------------------------------------------------

Open PostgreSQL:

psql -U postgres

Create database:

CREATE DATABASE water_db;

Exit:
\q

------------------------------------------------------------
7. Create .env File
------------------------------------------------------------

Inside backend folder, create a file named:

.env

Add:

DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/water_db
SECRET_KEY=supersecretkey
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

Replace "yourpassword" with your PostgreSQL password.

------------------------------------------------------------
8. Running The Backend
------------------------------------------------------------

Run:

uvicorn main:app --reload

Open in browser:

http://127.0.0.1:8000/docs

If Swagger UI appears, backend is working.

------------------------------------------------------------
9. Recommended Project Structure
------------------------------------------------------------

backend/
    app/
        models/
        schemas/
        routes/
        services/
        core/
    main.py
    .env

Explanation:

models/     -> Database table definitions
schemas/    -> Request/response validation
routes/     -> API endpoints
services/   -> Business logic
core/       -> Config, security, database connection
main.py     -> Entry point

------------------------------------------------------------
10. Database Tables (Simple Explanation)
------------------------------------------------------------

Users
Stores system users.
Roles:
- citizen
- ngo
- authority
- admin

Reports
Stores pollution reports from citizens.
Includes:
- photo URL
- location
- description
- status (pending, verified, rejected)

WaterStations
Physical water testing stations.

StationReadings
Stores water test results.
Parameters:
- pH
- turbidity
- DO
- lead
- arsenic

Alerts
Official safety warnings:
- boil_notice
- contamination
- outage

Collaborations
NGO projects and partnerships.

------------------------------------------------------------
11. What Is FastAPI?
------------------------------------------------------------

FastAPI is a framework used to build APIs.

API means:
A way for frontend and backend to communicate.

Example endpoints:

POST /register
POST /login
POST /reports
GET /stations
GET /alerts

Each endpoint performs one task.

------------------------------------------------------------
12. Basic FastAPI Example
------------------------------------------------------------

main.py example:

from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Backend is running"}

Visit:
http://127.0.0.1:8000/

------------------------------------------------------------
13. Database Connection Example
------------------------------------------------------------

Example database setup:

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

------------------------------------------------------------
14. Example Model (User)
------------------------------------------------------------

from sqlalchemy import Column, Integer, String
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True)
    password = Column(String)
    role = Column(String)

------------------------------------------------------------
15. Example Schema (Validation)
------------------------------------------------------------

from pydantic import BaseModel

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

Schemas validate incoming request data.

------------------------------------------------------------
16. Authentication (JWT)
------------------------------------------------------------

Login flow:

User sends email + password
-> Backend verifies credentials
-> Backend creates JWT token
-> Token sent to frontend
-> Frontend stores token
-> Token sent with future requests

Token is sent in header:

Authorization: Bearer <token>

------------------------------------------------------------
17. Password Hashing
------------------------------------------------------------

Never store plain passwords.

Example:

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"])

hashed_password = pwd_context.hash(password)

------------------------------------------------------------
18. Role-Based Access
------------------------------------------------------------

Different users see different features.

Citizen:
- Submit report

Authority:
- Verify reports
- Issue alerts

NGO:
- View collaboration dashboard

Admin:
- Full access

Check role before allowing access to certain endpoints.

------------------------------------------------------------
19. Government API Integration
------------------------------------------------------------

Backend will fetch water station data from external APIs.

Flow:

Government API
-> Backend fetches data
-> Save in database
-> Frontend displays it

Use Python requests library to call external APIs.

------------------------------------------------------------
20. Alerts Logic (Simple Explanation)
------------------------------------------------------------

Example:

If lead level > safe limit:
Create contamination alert.

If pH too high or low:
Mark station as unsafe.

Backend handles this logic.

------------------------------------------------------------
21. Common Backend Errors
------------------------------------------------------------

Database connection failed:
Check PostgreSQL running.
Check .env password.

Module not found:
pip install -r requirements.txt

Port already in use:
uvicorn main:app --reload --port 8001

JWT invalid:
Check SECRET_KEY consistency.

------------------------------------------------------------
22. Development Strategy
------------------------------------------------------------

Step 1:
Create database models.

Step 2:
Create schemas.

Step 3:
Create routes.

Step 4:
Test in Swagger.

Step 5:
Connect frontend.

Build one module at a time.

------------------------------------------------------------
23. Modules To Implement
------------------------------------------------------------

Module A: User & Reports
- Register
- Login
- Submit report
- Verify report

Module B: Water Data
- Add stations
- Add readings
- Fetch readings

Module C: Alerts
- Create alert
- Fetch alerts

Module D: Analytics
- Historical data queries
- Trend calculation
- Prediction logic (basic rule-based)

------------------------------------------------------------
24. Important Concepts For Beginners
------------------------------------------------------------

ORM:
Tool that converts Python classes into database tables.

Schema:
Validation model.

Endpoint:
URL that performs action.

Dependency Injection:
Reusable logic (like DB session).

Middleware:
Code that runs before request processing.

------------------------------------------------------------
25. Testing APIs
------------------------------------------------------------

Use Swagger:

http://127.0.0.1:8000/docs

You can:
- Send requests
- See responses
- Test authentication

------------------------------------------------------------
26. Final Advice
------------------------------------------------------------

Backend may feel complicated.

Focus on:

- Understanding request and response
- Database relationships
- Authentication flow
- Error handling

Build small features.
Test frequently.
Read error messages carefully.

Do not rush.

Consistency and clarity are more important than speed.

------------------------------------------------------------
End of Backend README
------------------------------------------------------------
