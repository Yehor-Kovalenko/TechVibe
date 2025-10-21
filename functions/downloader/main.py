import logging
from azure.functions import QueueMessage

from ..shared.common import write_blob, enqueue_message, read_blob
from ..shared.config import DOWNLOADED_QUEUE


def main(msg: QueueMessage):
    try:
        body = msg.get_json()
    except Exception as e:
        logging.error(f"Failed to parse message: {e}")
        return
    logging.info('NLP function processed a message: %s', body)

    job_id = body["id"]
    metadata = read_blob(f"results/{job_id}/metadata.json")
    audio = "la " * len(metadata["url"].split(".")) + "la"

    try:
        write_blob(
            f"results/{job_id}/audio.json",
            {"id": job_id, "audio": audio},
        )
        logging.info(f"downloader saved job ${job_id} audio to blob")

        msg = {"id": job_id}
        enqueue_message(msg, queue_name=DOWNLOADED_QUEUE)
        logging.info(f"downloader queued job {job_id}")
    except Exception as e:
        logging.error(f"Error in download processing: {e}")

    logging.info(f"downloader processed job {job_id}")