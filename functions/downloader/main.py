import logging
from azure.functions import func

from ..shared.common import upload_result_blob, enqueue_message_base64
from ..shared.config import DOWNLOADED_QUEUE


def main(msg: func.QueueMessage):
    try:
        body = msg.get_json()
    except Exception as e:
        logging.error(f"Failed to parse message: {e}")
        return
    logging.info('NLP function processed a message: %s', body)

    job_id = body.get("id")

    try:
        upload_result_blob(
            f"results/{job_id}/audio.json",
            {"id": job_id, "audio": "lalalala"},
        )
        logging.info(f"downloader processed job {job_id}")

        msg = {"id": job_id}
        enqueue_message_base64(msg, queue_name=DOWNLOADED_QUEUE)
        logging.info(f"downloader queued job {job_id}")
    except Exception as e:
        logging.error(f"Error in nlp processing: {e}")
