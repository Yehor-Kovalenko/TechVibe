import json
import uuid
import logging
from azure.functions import HttpRequest, HttpResponse

from ..shared.storage import enqueue_message, upload_result_blob
from ..shared.config import DOWNLOADED_QUEUE, RESULTS_CONTAINER

def main(req: HttpRequest) -> HttpResponse:
    try:
        body = req.get_json()
    except (ValueError, TypeError):
        body = {}

    job_id = body.get("id") or str(uuid.uuid4())
    input_text = body.get("text", "")

    try:
        # Store initial input in blob
        upload_result_blob(f"{job_id}_step0.json", {"id": job_id, "text": input_text, "step": 0}, container=RESULTS_CONTAINER)
        # Enqueue message for speech_to_text (step 1)
        msg = {"id": job_id, "step": 1, "text": input_text}
        enqueue_message(msg, queue_name=DOWNLOADED_QUEUE)
        logging.info(f"downloader queued job {job_id} with text: {input_text}")
    except Exception as e:
        logging.error(f"Failed to enqueue or upload blob: {e}")
        return HttpResponse(json.dumps({"status":"error","message":str(e)}), status_code=500, mimetype="application/json")

    return HttpResponse(json.dumps({"status":"queued","job_id":job_id}), status_code=200, mimetype="application/json")
