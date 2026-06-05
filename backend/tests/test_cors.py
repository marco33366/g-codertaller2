from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_options_preflight_from_configured_frontend_origin_is_allowed():
    response = client.options(
        "/api/auth/login",
        headers={
            "Origin": "https://frontend.test",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "https://frontend.test"
