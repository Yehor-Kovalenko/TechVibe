import azure.functions as func
import json
import uuid
from ..shared.storage import enqueue_message, upload_result_blob
from ..shared.config import QUEUE_NAME, RESULTS_CONTAINER
from ..shared.logs import logging

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
    except ValueError:
        body = {}

    job_id = body.get("id") or str(uuid.uuid4())
    input_text = body.get("text", "")
    # Store initial input in blob
    upload_result_blob(f"{job_id}_step0.json", {"id": job_id, "text": input_text, "step": 0}, container=RESULTS_CONTAINER)
    # Enqueue message for speech_to_text (step 1)
    msg = {"id": job_id, "step": 1, "text": input_text}
    enqueue_message(msg, queue_name=QUEUE_NAME)
    logging.info(f"downloader queued job {job_id} with text: {input_text}")
    return func.HttpResponse(json.dumps({"status":"queued","job_id":job_id}), status_code=200, mimetype="application/json")
