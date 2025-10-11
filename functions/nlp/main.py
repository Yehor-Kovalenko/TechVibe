import azure.functions as func
import json
from shared.storage_utils import enqueue_message
from shared.config import QUEUE_NAME

def main(msg: func.QueueMessage):
    body = msg.get_json()
    # process only step 1
    if body.get("step") != 1:
        return
    body["text"] = body.get("text", "") + "g"
    body["step"] = 2
    enqueue_message(body, queue_name=QUEUE_NAME)
    logging = func.logging
    logging.info(f"append_b processed job {body.get('id')}: {body['text']}")
