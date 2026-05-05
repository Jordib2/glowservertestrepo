from fastapi import APIRouter
from app.services.schools_service import SchoolsService

router = APIRouter()

@router.get("/schools")
def get_schools():
    try:
        school_service = SchoolsService()
        schools = school_service.get_all_schools()
    except Exception as e:
        print(f"Error fetching schools: {e}")
        raise
    
    return {"schools": schools}