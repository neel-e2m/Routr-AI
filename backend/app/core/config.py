from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    cors_origins: str = "*"

    @property
    def cors_origins_list(self) -> list[str]:
        values = [o.strip() for o in self.cors_origins.split(",") if o.strip()]
        return ["*"] if values == ["*"] else values

    @property
    def allow_credentials(self) -> bool:
        return self.cors_origins.strip() != "*"


settings = Settings()
