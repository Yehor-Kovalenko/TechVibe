import tempfile
import torch
import whisper
import logging

from azure.functions import QueueMessage

from ..shared.common import write_blob, enqueue_message, read_blob, get_blob_client, read_job_metadata, write_job_metadata
from ..shared.config import TRANSCRIBED_QUEUE, JOB_METADATA_FILENAME, TRANSCRIPT_FILENAME
from ..shared.job_status import JobStatus

logging.info("Loading Whisper model...")
device = "cuda" if torch.cuda.is_available() else "cpu"
logging.info(f"Using device for Whisper: {device}")

_model = whisper.load_model("base", device=device)
logging.info(f"Model loaded on: {device}")

def main(msg: QueueMessage):
    # Parse queue message
    try:
        body = msg.get_json()
        job_id = body.get("id")
        logging.info(f"Processing job {job_id}")
    except Exception as e:
        logging.error(f"Failed to parse queue message: {e}")
        return

    try:
        blob_client = get_blob_client(f"results/{job_id}/audio.mp3")
        with tempfile.NamedTemporaryFile(suffix=".mp3") as tmp_file:
            tmp_file.write(blob_client.download_blob().readall())
            tmp_file.flush()

            logging.info(f"Transcribing audio for job {job_id}...")
            result = _model.transcribe(tmp_file.name)
            transcript = result["text"]
            language = result.get("language", "unknown")
            logging.info(f"Transcription complete for job {job_id}, language: {language}")

    except Exception as e:
        logging.error(f"Error during transcription for job {job_id}: {e}")
        return

    # Save transcript.json to blob storage
    try:
        write_blob(
            f"results/{job_id}/{TRANSCRIPT_FILENAME}",
            {"id": job_id, "transcript": transcript, "language": language}
        )
        logging.info(f"Transcript saved for job {job_id}")

        url = read_job_metadata(job_id).get("url")
        write_job_metadata(
            job_id, 
            url,
            JobStatus.TRANSCRIBED.value
        )
        logging.info(f"speech_to_text updated job ${job_id} metadata to blob")

        # Enqueue next processing step
        enqueue_message({"id": job_id}, queue_name=TRANSCRIBED_QUEUE)
        logging.info(f"Job {job_id} enqueued to {TRANSCRIBED_QUEUE}")

    except Exception as e:
        logging.error(f"Error saving transcript or updating metadata for job {job_id}: {e}")