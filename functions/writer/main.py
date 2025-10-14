import azure.functions as func
import json
import logging
from ..shared.storage import upload_result_blob
from ..shared.config import RESULTS_CONTAINER

def main(msg: func.QueueMessage):
    body = msg.get_json()
    # only process final messages (step 3)
    if body.get("step") != 3:
        return
    job_id = body.get("id")
    result = {
        "id": job_id,
        "result_text": body.get("text"),
        "meta": {
            "steps": 3
        }
    }
    upload_result_blob(f"{job_id}_final.json", result, container=RESULTS_CONTAINER)
    logging.info(f"writer stored result for job {job_id}")
