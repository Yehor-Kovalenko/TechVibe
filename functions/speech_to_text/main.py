import logging
from azure.functions import QueueMessage

from ..shared.common import write_blob, enqueue_message, read_blob
from ..shared.config import TRANSCRIBED_QUEUE

def main(msg: QueueMessage):
    try:
        body = msg.get_json()
        logging.info(f"Received body: ${body}")
    except Exception as e:
        logging.error(f"Failed to parse message: {e}")
        return

    job_id = body["id"]
    try:
        audio = read_blob(f"results/{job_id}/audio.json")
        logging.info(f"Audio received: {audio}")
    except Exception as e:
        logging.error(f"Failed to read audio: {e}")
        return

    text = audio["audio"].split(" ")

    try:
        write_blob(
            f"results/{job_id}/text.json",
            {"id": job_id, "text": text}
        )
        logging.info(f"speech-to-text saved job {job_id} text to blob")

        msg = {"id": job_id}
        enqueue_message(msg, queue_name=TRANSCRIBED_QUEUE)
        logging.info(f"speech_to_text queued job {job_id}")
    except Exception as e:
        logging.error(f"Error in speech_to_text processing: {e}")

    logging.info(f"speech_to_text processed job {job_id}: {text}")

