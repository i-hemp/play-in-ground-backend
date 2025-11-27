from fastapi import FastAPI
import routes.auth_routes as auth_routes
from routes import grounds_routes,auth_routes #, user_routes
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Playground backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    # "http://localhost:3000",
    # "http://127.0.0.1:3000",
    # "https://.vercel.app",
    # ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# app.include_router(user_routes.router)
app.include_router(grounds_routes.router)
app.include_router(auth_routes.router)

@app.get("/")
def home():
    return {"message": "PlayInGround Backend API is running "}
