import json
import logging
from azure.storage.queue import QueueClient
from azure.storage.blob import BlobServiceClient
from ..shared.config import STORAGE_CONN, RESULTS_CONTAINER


def get_queue_client(queue_name):
    qc = QueueClient.from_connection_string(conn_str=STORAGE_CONN, queue_name=queue_name)
    try:
        qc.create_queue()
        logging.info(f"Created queue {queue_name}")
    except Exception as e:
        logging.debug(f"Queue '{queue_name}' may already exist: {e}")
    return qc


def enqueue_message(message: dict, queue_name):
    qc = get_queue_client(queue_name)
    try:
        qc.send_message(json.dumps(message))
        logging.info(f"Message enqueued to {queue_name}: {message}")
    except Exception as e:
        logging.error(f"Failed to send message to queue {queue_name}: {e}")
        raise


def upload_result_blob(blob_name: str, data: dict, container=RESULTS_CONTAINER):
    bsc = BlobServiceClient.from_connection_string(STORAGE_CONN)
    container_client = bsc.get_container_client(container)
    try:
        container_client.create_container()
    except Exception as e:
        logging.debug(f"Container '{container}' may already exist: {e}")
    blob_client = container_client.get_blob_client(blob_name)
    try:
        blob_client.upload_blob(json.dumps(data), overwrite=True)
        logging.info(f"Blob uploaded: {blob_name}")
    except Exception as e:
        logging.error(f"Failed to upload blob {blob_name}: {e}")
        raise
