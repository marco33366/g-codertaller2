from uuid import uuid4

from fastapi.testclient import TestClient
from sqlalchemy import func

from app.core.security import get_password_hash
from app.database import SessionLocal
from app.main import app
from app.models.audit_log import AuditLog
from app.models.user import User
from tests.auth_helpers import auth_headers


client = TestClient(app)


def _insert_dashboard_sample() -> None:
    suffix = uuid4().hex[:8]
    with SessionLocal() as db:
        operator = User(
            username=f"dashboard_operario_{suffix}",
            password_hash=get_password_hash("Operario12345"),
            role="operario",
            is_active=True,
        )
        inactive_user = User(
            username=f"dashboard_inactivo_{suffix}",
            password_hash=get_password_hash("Operario12345"),
            role="operario",
            is_active=False,
        )
        db.add_all([operator, inactive_user])
        db.flush()

        db.add_all(
            [
                AuditLog(
                    user_id=operator.id,
                    username_snapshot=operator.username,
                    user_role=operator.role,
                    action="FILE_UPLOADED",
                    resource="analyze",
                    file_name="pieza-dashboard.stl",
                    file_extension="stl",
                    status="success",
                ),
                AuditLog(
                    user_id=operator.id,
                    username_snapshot=operator.username,
                    user_role=operator.role,
                    action="CONVERT_SUCCESS",
                    resource="convert",
                    file_name="pieza-dashboard.stl",
                    file_extension="stl",
                    status="success",
                ),
                AuditLog(
                    user_id=operator.id,
                    username_snapshot=operator.username,
                    user_role=operator.role,
                    action="ANALYZE_FAILED",
                    resource="analyze",
                    file_name="pieza-fallida.obj",
                    file_extension="obj",
                    status="failed",
                ),
                AuditLog(
                    user_id=operator.id,
                    username_snapshot=operator.username,
                    user_role=operator.role,
                    action="GCODE_EXPORTED",
                    resource="convert",
                    file_name="pieza-dashboard.stl",
                    file_extension="stl",
                    status="success",
                ),
            ]
        )
        db.commit()


def _count_action(db, action: str) -> int:
    return db.query(func.count(AuditLog.id)).filter(AuditLog.action == action).scalar() or 0


def test_gerente_can_access_dashboard_summary():
    response = client.get("/api/dashboard/summary", headers=auth_headers("gerente", "gerente"))

    assert response.status_code == 200
    assert "total_file_uploads" in response.json()


def test_jefe_operarios_cannot_access_dashboard_summary():
    response = client.get("/api/dashboard/summary", headers=auth_headers("jefe", "jefe_operarios"))

    assert response.status_code == 403


def test_operario_cannot_access_dashboard_summary():
    response = client.get("/api/dashboard/summary", headers=auth_headers("operario1", "operario"))

    assert response.status_code == 403


def test_dashboard_summary_without_token_returns_401():
    response = client.get("/api/dashboard/summary")

    assert response.status_code == 401


def test_dashboard_summary_calculates_basic_counts():
    _insert_dashboard_sample()

    response = client.get("/api/dashboard/summary", headers=auth_headers("gerente", "gerente"))
    body = response.json()

    assert response.status_code == 200, body
    with SessionLocal() as db:
        assert body["total_file_uploads"] == _count_action(db, "FILE_UPLOADED")
        assert body["total_successful_conversions"] == _count_action(db, "CONVERT_SUCCESS")
        assert body["total_failed_analysis"] == _count_action(db, "ANALYZE_FAILED")
        assert body["total_exports"] == _count_action(db, "GCODE_EXPORTED")
        assert body["active_users"] == (db.query(func.count(User.id)).filter(User.is_active.is_(True)).scalar() or 0)
        assert body["inactive_users"] == (db.query(func.count(User.id)).filter(User.is_active.is_(False)).scalar() or 0)

    assert body["last_activity_at"] is not None
    assert "most_used_extension" in body
    assert "top_operator" in body
