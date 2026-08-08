from sqlalchemy import Column, Integer, String, Text
from db import Base


class Document(Base):

    __tablename__ = "documents"

    # ==========================
    # Basic Document Information
    # ==========================

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    filename = Column(
        String
    )

    category = Column(
        String
    )

    confidence = Column(
        String
    )

    # ==========================
    # Document Verification
    # ==========================

    verification = Column(
        String
    )

    # ==========================
    # Fraud Detection
    # ==========================

    fraud_status = Column(
        String
    )

    # ==========================
    # AI Auto Summary
    # ==========================

    summary = Column(
        Text
    )