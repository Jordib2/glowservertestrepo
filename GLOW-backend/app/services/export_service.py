
class ExportService:
    async def export_video(self, video_id: int) -> dict:
        #Store exported_at in db
        return {"message": f"Video {video_id} exported successfully"}