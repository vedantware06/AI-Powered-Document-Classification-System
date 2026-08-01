from sqlalchemy import Column, Integer, String
from backend.db import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    category = Column(String)
    confidence = Column(String)