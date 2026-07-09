from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    cors_origins: str = "*"

    def normalize_origin(self, origin: str) -> str:
        origin = origin.strip()
        if origin == "*":
            return origin
        if origin.startswith("http://") or origin.startswith("https://"):
            return origin
        return f"https://{origin}"

    @property
    def cors_origins_list(self) -> list[str]:
        values = [self.normalize_origin(o) for o in self.cors_origins.split(",") if o.strip()]
        return ["*"] if not values or values == ["*"] else values


settings = Settings()
