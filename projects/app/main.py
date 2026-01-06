import logging
from fastapi import FastAPI
from projects.app.api.v1.router import api_router
from projects.app.db.base import Base
from projects.app.models.user import User, Ticket, Budget
from projects.app.models.transaction import Transaction
from projects.app.db.session import engine

Base.metadata.create_all(bind=engine)

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Expense Classifier API")

app.include_router(api_router, prefix="/api/v1")
