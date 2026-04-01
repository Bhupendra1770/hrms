from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    DATABASE_URL: str = 'postgresql://neondb_owner:npg_A2QvuNs1qDtE@ep-blue-haze-a1u3o3at-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    SECRET_KEY: str = 'ustybdhbjnbcbhjchbvgvxhjxyuegcyhbcbeycvtvcb'
    ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    FRONTEND_URL: str = 'http://localhost:5173'


settings = Settings()
