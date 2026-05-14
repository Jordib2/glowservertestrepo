from app.persistence.repositories.schools_repository import SchoolsRepository

class SchoolsService:
    
    def __init__(self):
        self.repo = SchoolsRepository()

    def get_all_schools(self):
        return self.repo.get_all_schools()