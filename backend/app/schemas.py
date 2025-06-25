from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class EntryBase(BaseModel):
    title: Optional[str] = ""
    date: Optional[str] = ""
    story: Optional[str] = ""
    image_url: Optional[str] = None
    is_favorite: bool = False

class EntryCreate(EntryBase):
    pass

class Entry(EntryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class EntryBackup(Entry):
    original_id: int
    deleted_at: datetime

    class Config:
        orm_mode = True 