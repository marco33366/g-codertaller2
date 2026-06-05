from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_roles
from app.models.audit_log import AuditLog
from app.models.user import User
from app.schemas.dashboard import DashboardSummaryResponse


router = APIRouter(tags=["dashboard"])


def count_action(db: Session, action: str) -> int:
    return db.query(func.count(AuditLog.id)).filter(AuditLog.action == action).scalar() or 0


@router.get("/dashboard/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_roles("gerente")),
):
    extension_row = (
        db.query(AuditLog.file_extension, func.count(AuditLog.id).label("total"))
        .filter(AuditLog.file_extension.is_not(None), AuditLog.file_extension != "")
        .group_by(AuditLog.file_extension)
        .order_by(func.count(AuditLog.id).desc(), AuditLog.file_extension.asc())
        .first()
    )
    operator_row = (
        db.query(AuditLog.username_snapshot, func.count(AuditLog.id).label("total"))
        .filter(
            AuditLog.action == "CONVERT_SUCCESS",
            AuditLog.username_snapshot.is_not(None),
            AuditLog.username_snapshot != "",
        )
        .group_by(AuditLog.username_snapshot)
        .order_by(func.count(AuditLog.id).desc(), AuditLog.username_snapshot.asc())
        .first()
    )

    return DashboardSummaryResponse(
        total_file_uploads=count_action(db, "FILE_UPLOADED"),
        total_successful_conversions=count_action(db, "CONVERT_SUCCESS"),
        total_failed_analysis=count_action(db, "ANALYZE_FAILED"),
        total_exports=count_action(db, "GCODE_EXPORTED"),
        active_users=db.query(func.count(User.id)).filter(User.is_active.is_(True)).scalar() or 0,
        inactive_users=db.query(func.count(User.id)).filter(User.is_active.is_(False)).scalar() or 0,
        last_activity_at=db.query(func.max(AuditLog.created_at)).scalar(),
        most_used_extension=extension_row[0] if extension_row else None,
        top_operator=operator_row[0] if operator_row else None,
    )
