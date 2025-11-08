import json
import logging
from azure.storage.blob import BlobServiceClient
from azure.storage.queue import QueueClient, BinaryBase64EncodePolicy
from ..shared.config import JOB_METADATA_FILENAME, STORAGE_CONN, RESULTS_CONTAINER, CONNECTION_STRING, VIDEO_METADATA_FILENAME


def get_queue_client(queue_name):
    qc = QueueClient.from_connection_string(conn_str=STORAGE_CONN, queue_name=queue_name)
    try:
        qc.create_queue()
        logging.info(f"Created queue {queue_name}")
    except Exception as e:
        logging.debug(f"Queue '{queue_name}' may already exist: {e}")
    return qc


def enqueue_message(message: dict, queue_name: str):
    queue_client = get_queue_client(queue_name)

    queue_client.message_encode_policy = BinaryBase64EncodePolicy()

    message_string = json.dumps(message)
    message_bytes = message_string.encode("utf-8")
    queue_client.send_message(queue_client.message_encode_policy.encode(content=message_bytes))


def get_blob_client(blob_name, container=RESULTS_CONTAINER):
    bsc = BlobServiceClient.from_connection_string(STORAGE_CONN)
    container_client = bsc.get_container_client(container)
    try:
        container_client.create_container()
    except Exception as e:
        logging.debug(f"Container '{container}' may already exist: {e}")
    return container_client.get_blob_client(blob_name)


def write_blob(blob_name: str, data: dict):
    blob_client = get_blob_client(blob_name)
    try:
        blob_client.upload_blob(json.dumps(data), overwrite=True)
        logging.info(f"Blob uploaded: {blob_name}")
    except Exception as e:
        logging.error(f"Failed to upload blob {blob_name}: {e}")
        raise


def read_blob(blob_name: str) -> dict:
    blob_client = get_blob_client(blob_name)
    try:
        blob_data = blob_client.download_blob().readall().decode("utf-8")
        return json.loads(blob_data)
    except Exception as e:
        logging.error(f"Failed to read blob {blob_name}: {e}")
        raise  # Re-raise the exception so the calling function can handle it


# JOB METADATA CRUD
def read_job_metadata(job_id: str) -> dict:
    """Read job metadata from blob storage"""
    return read_blob(f"results/{job_id}/{JOB_METADATA_FILENAME}")


def write_job_metadata(job_id: str, url: str, status: str) -> None:
    """Write job metadata to blob storage"""
    write_blob(
        f"results/{job_id}/{JOB_METADATA_FILENAME}",
        {"id": job_id, "url": url, "status": status},
    )


# VIDEO METADATA CRUD
def read_video_metadata(job_id: str) -> dict:
    """Read video metadata from blob storage"""
    return read_blob(f"results/{job_id}/{VIDEO_METADATA_FILENAME}")