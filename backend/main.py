from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import check_database_connection, get_database_error
from routes.auth_routes import router as auth_router
from routes.problem_routes import router as problem_router
from routes.statement_routes import router as statement_router
from routes.dashboard_routes import router as dashboard_router
from routes.ai_routes import router as ai_router
from routes.knowledge_routes import router as knowledge_router

app = FastAPI(
    title="CodeVault AI API",
    description="A personal coding journal API to store daily solved problems with code explanations.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(problem_router)
app.include_router(statement_router)
app.include_router(dashboard_router)
app.include_router(ai_router)
app.include_router(knowledge_router)


@app.get("/")
def home():
    return {
        "message": "Welcome to CodeVault AI Backend",
        "status": "running"
    }


@app.get("/health")
def health_check():
    db_status = check_database_connection()

    return {
        "api_status": "healthy",
        "database_connected": db_status,
        "database_error": get_database_error()
    }