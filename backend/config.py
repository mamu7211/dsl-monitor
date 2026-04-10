from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    fritz_ip: str = "192.168.178.1"
    fritz_user: str = ""
    fritz_password: str = ""
    poll_interval_minutes: int = 60
    data_dir: str = "./data"
    target_downstream: int = 50000  # kbit/s
    target_upstream: int = 10000    # kbit/s

    model_config = {"env_prefix": "", "env_file": ".env"}


settings = Settings()
