import os

DOWNLOADED_QUEUE = os.environ.get("DOWNLOADED_QUEUE", "downloaded-queue")
TRANSCRIBED_QUEUE = os.environ.get("TRANSCRIBED_QUEUE", "transcribed-queue")
RESULTS_CONTAINER = os.environ.get("RESULTS_CONTAINER", "results")
STORAGE_CONN = os.environ.get("AzureWebJobsStorage", "UseDevelopmentStorage=true")
