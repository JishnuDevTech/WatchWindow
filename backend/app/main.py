from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.core.config import settings
from app.core.database import create_tables
from app.api import auth_routes, family_routes, schedule_routes, reservation_routes

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
	title=settings.api_title,
	description=settings.api_description,
	version=settings.api_version,
)

app.add_middleware(
	CORSMiddleware,
	allow_origins=settings.cors_origins,
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


@app.on_event("startup")
def initialize_database():
	try:
		create_tables()
	except Exception:
		logger.exception("Database initialization failed; API started without tables")


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
	logger.error("Unhandled exception: %s", exc)
	return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.get("/health")
def health_check():
	return {
		"status": "healthy",
		"service": settings.api_title,
		"version": settings.api_version,
	}


app.include_router(auth_routes.router)
app.include_router(family_routes.router)
app.include_router(schedule_routes.router)
app.include_router(reservation_routes.router)


@app.get("/")
def read_root():
	return {
		"name": settings.api_title,
		"tagline": "Know your window. Own your watch.",
		"version": settings.api_version,
		"documentation": "/docs",
	}
