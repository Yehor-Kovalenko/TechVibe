import azure.functions as func
import json
import logging
from ..shared.storage import enqueue_message, upload_result_blob
from ..shared.config import QUEUE_NAME, RESULTS_CONTAINER

def main(msg: func.QueueMessage):
    body = msg.get_json()
    # process only step 2
    if body.get("step") != 2:
        return
    body["text"] = body.get("text", "") + "_nlp"
    body["step"] = 3
    # Store intermediate result in blob
    upload_result_blob(f"{body['id']}_step2.json", body, container=RESULTS_CONTAINER)
    enqueue_message(body, queue_name=QUEUE_NAME)
    logging.info(f"nlp processed job {body.get('id')}: {body['text']}")
