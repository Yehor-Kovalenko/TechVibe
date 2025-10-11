import azure.functions as func
import json
import uuid
from shared.storage_utils import enqueue_message
from shared.config import QUEUE_NAME

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
    except ValueError:
        body = {}

    job_id = body.get("id") or str(uuid.uuid4())
    # initial message: step 0, empty text
    msg = {"id": job_id, "step": 0, "text": ""}
    enqueue_message(msg, queue_name=QUEUE_NAME)
    return func.HttpResponse(json.dumps({"status":"queued","job_id":job_id}), status_code=200, mimetype="application/json")
