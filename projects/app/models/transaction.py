from projects.app.db.base import Base
from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    DECIMAL,
    ForeignKey,
    Enum
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship


# Renseignement des differents salaires ou source de revenu pour Budjet mensuel
class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    description = Column(String(255), nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
    type = Column(
        Enum("income", "expense", name="transaction_type"),
        nullable=False
    )
    category = Column(String(100), nullable=False)
    date = Column(Date, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Relationship to tickets
    tickets = relationship("Ticket", backref="transaction", cascade="all, delete-orphan")