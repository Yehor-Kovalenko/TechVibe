import os

QUEUE_NAME = os.environ.get("QUEUE_NAME", "processing-queue")
RESULTS_CONTAINER = os.environ.get("RESULTS_CONTAINER", "results")
STORAGE_CONN = os.environ.get("AzureWebJobsStorage", "UseDevelopmentStorage=true")
