from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Entry(Base):
    __tablename__ = "entries"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(Text, nullable=True)
    date = Column(Text, nullable=True)
    story = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_favorite = Column(Boolean, default=False)

class EntryBackup(Base):
    __tablename__ = "entry_backups"

    id = Column(Integer, primary_key=True, index=True)
    original_id = Column(Integer, index=True)
    title = Column(Text, nullable=True)
    date = Column(Text, nullable=True)
    story = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    deleted_at = Column(DateTime, default=datetime.utcnow)

class PhotoStory(Base):
    __tablename__ = "photo_stories"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    story = Column(String)
    date = Column(DateTime)
    imageUrl = Column(String)
    is_deleted = Column(Boolean, default=False)
    is_favorite = Column(Boolean, default=False)  # New field for favorites 