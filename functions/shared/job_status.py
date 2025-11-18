from enum import Enum


class JobStatus(Enum):
    DOWNLOADED = "DOWNLOADED"
    TRANSCRIBED = "TRANSCRIBED"
    DONE = "DONE"
    CREATED = "CREATED"
    FAILED = "FAILED"
