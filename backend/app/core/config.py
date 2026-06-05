import os


def normalize_origin(value: str | None) -> str:
    return (value or "").strip().rstrip("/")


class Settings:
    secret_key: str = os.getenv("SECRET_KEY", "change-this-local-development-secret")
    algorithm: str = os.getenv("ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./storage/gcoder.db")
    frontend_origin: str = normalize_origin(os.getenv("FRONTEND_ORIGIN", ""))

    @property
    def cors_allowed_origins(self) -> list[str]:
        origins = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3001",
        ]
        if self.frontend_origin and self.frontend_origin not in origins:
            origins.append(self.frontend_origin)
        return origins


settings = Settings()
