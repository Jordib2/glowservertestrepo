from pydantic import BaseModel  

class VideoDto(BaseModel):
    created_at: str
    video_url: str