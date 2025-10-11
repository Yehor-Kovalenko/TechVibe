import azure.functions as func
import json
from shared.storage_utils import enqueue_message
from shared.config import QUEUE_NAME

def main(msg: func.QueueMessage):
    body = msg.get_json()
    # process only step 0
    if body.get("step") != 0:
        return
    body["text"] = body.get("text", "") + "c"
    body["step"] = 1
    enqueue_message(body, queue_name=QUEUE_NAME)
    logging = func.logging
    logging.info(f"append_a processed job {body.get('id')}: {body['text']}")
