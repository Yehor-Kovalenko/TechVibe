import logging
from azure.functions import QueueMessage

from ..shared.common import write_blob, enqueue_message, read_blob, read_job_metadata, write_job_metadata
from ..shared.config import TRANSCRIBED_QUEUE, TRANSCRIPT_FILENAME
from ..shared.job_status import JobStatus

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

        url = read_job_metadata(job_id).get("url")
        write_job_metadata(
            job_id, 
            url,
            JobStatus.TRANSCRIBED.value
        )
        logging.info(f"speech_to_text updated job ${job_id} metadata to blob")

        msg = {"id": job_id}
        enqueue_message(msg, queue_name=TRANSCRIBED_QUEUE)
        logging.info(f"speech_to_text queued job {job_id}")
    except Exception as e:
        logging.error(f"Error in speech_to_text processing: {e}")

    logging.info(f"speech_to_text processed job {job_id}: {text}")

