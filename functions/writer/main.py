import azure.functions as func
from ..shared.logs import logging
from ..shared.storage import upload_result_blob
from ..shared.config import RESULTS_CONTAINER

def main(msg: func.QueueMessage):
    try:
        body = msg.get_json()
    except Exception as e:
        logging.error(f"Failed to parse message: {e}")
        return
    # only process final messages (step 3)
    if body.get("step") != 3:
        logging.info(f"Skipping message with step {body.get('step')}")
        return
    try:
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
    except Exception as e:
        logging.error(f"Error in writer processing: {e}")
