import json
import logging
from azure.storage.blob import BlobServiceClient
from azure.storage.queue import QueueClient, BinaryBase64EncodePolicy
from ..shared.config import STORAGE_CONN, RESULTS_CONTAINER, CONNECTION_STRING


def get_queue_client(queue_name):
    qc = QueueClient.from_connection_string(conn_str=STORAGE_CONN, queue_name=queue_name)
    try:
        qc.create_queue()
        logging.info(f"Created queue {queue_name}")
    except Exception as e:
        logging.debug(f"Queue '{queue_name}' may already exist: {e}")
    return qc


def enqueue_message_base64(message: dict, queue_name: str):
    queue_client = get_queue_client(queue_name)

    queue_client.message_encode_policy = BinaryBase64EncodePolicy()

    message_string = json.dumps(message)
    message_bytes = message_string.encode("utf-8")
    queue_client.send_message(queue_client.message_encode_policy.encode(content=message_bytes))


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
