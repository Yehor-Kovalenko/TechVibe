from azure.storage.queue import QueueClient
from azure.storage.blob import BlobServiceClient
import json
from .config import STORAGE_CONN, QUEUE_NAME, RESULTS_CONTAINER

def get_queue_client(queue_name=QUEUE_NAME):
    qc = QueueClient.from_connection_string(conn_str=STORAGE_CONN, queue_name=queue_name)
    # ensure queue exists (safe to call many times)
    try:
        qc.create_queue()
    except Exception:
        pass
    return qc

def enqueue_message(message: dict, queue_name=QUEUE_NAME):
    qc = get_queue_client(queue_name)
    qc.send_message(json.dumps(message))
    return True

def upload_result_blob(blob_name: str, data: dict, container=RESULTS_CONTAINER):
    bsc = BlobServiceClient.from_connection_string(STORAGE_CONN)
    container_client = bsc.get_container_client(container)
    try:
        container_client.create_container()
    except Exception:
        pass
    blob_client = container_client.get_blob_client(blob_name)
    blob_client.upload_blob(json.dumps(data), overwrite=True)
    return True
