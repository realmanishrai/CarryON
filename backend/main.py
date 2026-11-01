from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session
from sqlalchemy import text
import uvicorn

from .config import settings
from .database import init_db, get_db
from .routers import profile_router, workflow_router, analyze_router, recovery_router
from .services.ai_service import AIService

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize SQLite DB tables
    init_db()
    yield
    # Shutdown logic if needed

app = FastAPI(
    title="CarryON AI Backend",
    description="The AI Recovery Layer for the Internet — Workflow Intelligence & Recovery API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health Check
@app.get("/health", tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    ai_service = AIService()
    ai_status = "ready" if ai_service.is_ai_available() else "no_api_key_deterministic_fallback"

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "service": "CarryON AI Backend",
        "version": "1.0.0",
        "database": db_status,
        "ai_engine": ai_status,
        "configured_model": settings.OPENAI_MODEL
    }

# Register Routers
app.include_router(profile_router)
app.include_router(workflow_router)
app.include_router(analyze_router)
app.include_router(recovery_router)

@app.get("/", tags=["Root"])
def root():
    return {
        "product": "CarryON AI",
        "tagline": "The AI Recovery Layer for the Internet",
        "docs_url": "/docs",
        "health_url": "/health"
    }

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=True)
