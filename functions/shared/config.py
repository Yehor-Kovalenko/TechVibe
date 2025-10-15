import os

DOWNLOADED_QUEUE = os.environ.get("DOWNLOADED_QUEUE", "downloaded-queue")
TRANSCRIBED_QUEUE = os.environ.get("TRANSCRIBED_QUEUE", "transcribed-queue")
RESULTS_CONTAINER = os.environ.get("RESULTS_CONTAINER", "results")
STORAGE_CONN = os.environ.get("AzureWebJobsStorage", "UseDevelopmentStorage=true")
CONNECTION_STRING = os.environ.get("CONNECTION_STRING", "AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;DefaultEndpointsProtocol=http;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;QueueEndpoint=http://127.0.0.1:10001/devstoreaccount1;TableEndpoint=http://127.0.0.1:10002/devstoreaccount1;")