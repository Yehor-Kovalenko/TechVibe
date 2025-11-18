import os

DOWNLOADED_QUEUE = os.environ.get("DOWNLOADED_QUEUE", "downloaded-queue")
TRANSCRIBED_QUEUE = os.environ.get("TRANSCRIBED_QUEUE", "transcribed-queue")
NEW_QUEUE = os.environ.get("NEW_QUEUE", "new-queue")
RESULTS_CONTAINER = os.environ.get("RESULTS_CONTAINER", "results")
STORAGE_CONN = os.environ.get("AzureWebJobsStorage", "UseDevelopmentStorage=true")
CONNECTION_STRING = os.environ.get("CONNECTION_STRING", "AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;DefaultEndpointsProtocol=http;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;QueueEndpoint=http://127.0.0.1:10001/devstoreaccount1;TableEndpoint=http://127.0.0.1:10002/devstoreaccount1;")

MAX_DEQUEUE_COUNT = os.environ.get("MAX_DEQUEUE_COUNT", "5")

# FILENAME CONFIGURATION
JOB_METADATA_FILENAME = os.environ.get("JOB_METADATA_FILENAME", "job_metadata.json")
VIDEO_METADATA_FILENAME = os.environ.get("VIDEO_METADATA_FILENAME", "video_metadata.json")
TRANSCRIPT_FILENAME = os.environ.get("TRANSCRIBED_FILENAME", "transcript.json")
SUMMARY_FILENAME = os.environ.get("SUMMARY_FILENAME", "summary.json")