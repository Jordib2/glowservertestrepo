from pydantic import BaseModel

class UploadedImagesDto(BaseModel):
    images: list[str]