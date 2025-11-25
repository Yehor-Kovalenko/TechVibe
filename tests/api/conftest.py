import pytest
import requests


@pytest.fixture(scope="session")
def base_url():
    return "http://localhost:7071/api/api"

@pytest.fixture(scope="session")
def video_url():
    return "https://www.youtube.com/shorts/Qfb2IjEbIAI"

@pytest.fixture(scope="session")
def invalid_video_url():
    return "https://www.youtube.com/watch?v=INVALID_VIDEO_ID_12345"
