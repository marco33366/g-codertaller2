from datetime import datetime

from pydantic import BaseModel, Field


class DashboardSummaryResponse(BaseModel):
    total_file_uploads: int = Field(ge=0)
    total_successful_conversions: int = Field(ge=0)
    total_failed_analysis: int = Field(ge=0)
    total_exports: int = Field(ge=0)
    active_users: int = Field(ge=0)
    inactive_users: int = Field(ge=0)
    last_activity_at: datetime | None
    most_used_extension: str | None
    top_operator: str | None
