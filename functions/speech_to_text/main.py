import azure.functions as func
import json
import logging
from ..shared.storage import enqueue_message, upload_result_blob
from ..shared.config import QUEUE_NAME, RESULTS_CONTAINER

def main(msg: func.QueueMessage):
    body = msg.get_json()
    # process only step 1
    if body.get("step") != 1:
        return
    body["text"] = body.get("text", "") + "_speech"
    body["step"] = 2
    # Store intermediate result in blob
    upload_result_blob(f"{body['id']}_step1.json", body, container=RESULTS_CONTAINER)
    enqueue_message(body, queue_name=QUEUE_NAME)
    logging.info(f"speech_to_text processed job {body.get('id')}: {body['text']}")
