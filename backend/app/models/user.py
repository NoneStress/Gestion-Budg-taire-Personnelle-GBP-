from app.db.base import Base
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    BIGINT,
    ForeignKey,
    DECIMAL
    )
from sqlalchemy.sql import func


# Table de stockage des differents utilisateurs
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

# Table de stockage et de gestion des differents aricles et qui assigne leur assigne les differentes categories
class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key= True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Propriétaire du ticket
    transaction_id = Column(Integer, ForeignKey("transactions.id"))
    type = Column(String(100), nullable= False)
    file_path = Column(String((500)), nullable= False)
    data = Column(String(5000), nullable=True)  # Données extraites OCR (JSON)
    size = Column(BIGINT)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

# Evaluation des budgets mensuels en fonction de tes categories
class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key= True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Propriétaire du budget
    category = Column(String(100), nullable= False)
    monthly_limit = Column(DECIMAL(10,2), nullable= False)
    notification_threshold = Column(DECIMAL(5,2), nullable= False)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

