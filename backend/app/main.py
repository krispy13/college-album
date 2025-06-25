from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from datetime import datetime
import os
import shutil
import logging
import base64
import io
from PIL import Image
from app import models
from app import schemas
from app.database import engine, get_db

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Scrapbook API")

# Configure CORS - allow both localhost and production frontend URLs
allowed_origins = [
    "http://localhost:3000",  # React app's local address
    "https://college-album-frontend.onrender.com",  # Render frontend URL
    "https://college-album.onrender.com",  # Alternative frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Scrapbook API"}

@app.get("/entries/", response_model=List[schemas.Entry])
def read_entries(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    sort_by: Optional[str] = Query(None, description="Sort by field (date, title)"),
    sort_order: Optional[str] = Query(None, description="Sort order (asc, desc)"),
    favorites_only: Optional[bool] = Query(None, alias="favoritesOnly", description="Filter by favorites"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Entry)

    # Apply search filter if provided
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Entry.title.ilike(search_term),
                models.Entry.story.ilike(search_term)
            )
        )

    # Apply date filters if provided
    if start_date:
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(models.Entry.date >= start)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format. Use YYYY-MM-DD")

    if end_date:
        try:
            end = datetime.strptime(end_date, "%Y-%m-%d")
            query = query.filter(models.Entry.date <= end)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_date format. Use YYYY-MM-DD")

    # Apply favorites filter if provided
    if favorites_only:
        query = query.filter(models.Entry.is_favorite == True)

    # Apply sorting if provided
    if sort_by:
        if sort_by == "date":
            if sort_order == "desc":
                query = query.order_by(models.Entry.date.desc())
            else:
                query = query.order_by(models.Entry.date.asc())
        elif sort_by == "title":
            if sort_order == "desc":
                query = query.order_by(models.Entry.title.desc())
            else:
                query = query.order_by(models.Entry.title.asc())

    entries = query.offset(skip).limit(limit).all()
    return entries

@app.get("/entries/{entry_id}", response_model=schemas.Entry)
def read_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(models.Entry).filter(models.Entry.id == entry_id).first()
    if entry is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry

@app.post("/entries/", response_model=schemas.Entry)
async def create_entry(
    title: str = Form(...),
    date: str = Form(...),
    story: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        # Validate file type
        content_type = file.content_type
        if not content_type or not content_type.startswith('image/'):
            logger.error(f"Invalid file type: {content_type}")
            raise HTTPException(status_code=400, detail="Only image files are allowed")
        
        # Read and compress the image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to JPEG and compress
        output = io.BytesIO()
        image.convert('RGB').save(output, format='JPEG', quality=70, optimize=True)
        compressed_image = output.getvalue()
        
        # Convert to base64
        base64_image = base64.b64encode(compressed_image).decode('utf-8')
        
        # Create database entry
        db_entry = models.Entry(
            title=title,
            date=date,
            story=story,
            image_url=f"data:image/jpeg;base64,{base64_image}"  # Store as base64
        )
        db.add(db_entry)
        db.commit()
        db.refresh(db_entry)
        return db_entry
    except Exception as e:
        logger.error(f"Error creating entry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/entries/{entry_id}", response_model=schemas.Entry)
async def update_entry(
    entry_id: int,
    title: str = Form(...),
    date: str = Form(...),
    story: str = Form(...),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    db_entry = db.query(models.Entry).filter(models.Entry.id == entry_id).first()
    if db_entry is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    try:
        # Update file if provided
        if file:
            # Validate file type
            content_type = file.content_type
            if not content_type or not content_type.startswith('image/'):
                logger.error(f"Invalid file type: {content_type}")
                raise HTTPException(status_code=400, detail="Only image files are allowed")
            
            # Read and compress the image
            image_data = await file.read()
            image = Image.open(io.BytesIO(image_data))
            
            # Convert to JPEG and compress
            output = io.BytesIO()
            image.convert('RGB').save(output, format='JPEG', quality=70, optimize=True)
            compressed_image = output.getvalue()
            
            # Convert to base64
            base64_image = base64.b64encode(compressed_image).decode('utf-8')
            
            # Update the image_url with base64 data
            db_entry.image_url = f"data:image/jpeg;base64,{base64_image}"
        
        # Update other fields
        db_entry.title = title
        db_entry.date = date
        db_entry.story = story
        
        db.commit()
        db.refresh(db_entry)
        return db_entry
    except Exception as e:
        logger.error(f"Error updating entry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/entries/{entry_id}")
def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    db_entry = db.query(models.Entry).filter(models.Entry.id == entry_id).first()
    if db_entry is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    try:
        # Do NOT delete the file here; just backup the entry
        backup_entry = models.EntryBackup(
            original_id=db_entry.id,
            title=db_entry.title,
            date=db_entry.date,
            story=db_entry.story,
            image_url=db_entry.image_url,
            created_at=db_entry.created_at,
            updated_at=db_entry.updated_at
        )
        db.add(backup_entry)
        db.delete(db_entry)
        db.commit()
        return {"message": "Entry deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting entry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/deleted-entries/", response_model=List[schemas.EntryBackup])
def list_deleted_entries(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    entries = db.query(models.EntryBackup).offset(skip).limit(limit).all()
    return entries

@app.post("/deleted-entries/{backup_id}/restore", response_model=schemas.Entry)
def restore_entry(backup_id: int, db: Session = Depends(get_db)):
    backup_entry = db.query(models.EntryBackup).filter(models.EntryBackup.id == backup_id).first()
    if backup_entry is None:
        raise HTTPException(status_code=404, detail="Backup entry not found")
    
    # Create new entry from backup
    new_entry = models.Entry(
        title=backup_entry.title,
        date=backup_entry.date,
        story=backup_entry.story,
        image_url=backup_entry.image_url,
        created_at=backup_entry.created_at,
        updated_at=backup_entry.updated_at
    )
    db.add(new_entry)
    
    # Delete the backup entry
    db.delete(backup_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry

@app.delete("/deleted-entries/{backup_id}")
def delete_backup_permanently(backup_id: int, db: Session = Depends(get_db)):
    backup_entry = db.query(models.EntryBackup).filter(models.EntryBackup.id == backup_id).first()
    if backup_entry is None:
        raise HTTPException(status_code=404, detail="Backup entry not found")
    # No need to delete files since images are stored as base64 in database
    db.delete(backup_entry)
    db.commit()
    return {"message": "Entry permanently deleted"}

@app.post("/entries/{entry_id}/favorite", response_model=schemas.Entry)
def toggle_favorite(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(models.Entry).filter(models.Entry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    entry.is_favorite = not entry.is_favorite
    db.commit()
    db.refresh(entry)
    return entry 