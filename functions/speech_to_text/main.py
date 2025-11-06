import logging
from azure.functions import QueueMessage

from ..shared.common import write_blob, enqueue_message, read_blob
from ..shared.config import TRANSCRIBED_QUEUE, JOB_METADATA_FILENAME, TRANSCRIPT_FILENAME

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
            f"results/{job_id}/{TRANSCRIPT_FILENAME}",
            {"id": job_id, "transcript": text}
        )
        logging.info(f"speech-to-text saved job {job_id} text to blob")

        metadata = read_blob(f"results/{job_id}/{JOB_METADATA_FILENAME}")
        metadata["status"] = "TRANSCRIBED"
        write_blob(
            f"results/{job_id}/{JOB_METADATA_FILENAME}",
            metadata
        )
        logging.info(f"speech_to_text updated job ${job_id} metadata to blob")

        msg = {"id": job_id}
        enqueue_message(msg, queue_name=TRANSCRIBED_QUEUE)
        logging.info(f"speech_to_text queued job {job_id}")
    except Exception as e:
        logging.error(f"Error in speech_to_text processing: {e}")

    logging.info(f"speech_to_text processed job {job_id}: {text}")

