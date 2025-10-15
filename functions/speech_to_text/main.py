import azure.functions as func
from ..shared.storage import enqueue_message, upload_result_blob
from ..shared.config import QUEUE_NAME, RESULTS_CONTAINER
from ..shared.logs import logging

def main(msg: func.QueueMessage):
    try:
        body = msg.get_json()
    except Exception as e:
        logging.error(f"Failed to parse message: {e}")
        return
    # process only step 1
    if body.get("step") != 1:
        logging.info(f"Skipping message with step {body.get('step')}")
        return
    try:
        body["text"] = body.get("text", "") + "_speech"
        body["step"] = 2
        # Store intermediate result in blob
        upload_result_blob(f"{body['id']}_step1.json", body, container=RESULTS_CONTAINER)
        enqueue_message(body, queue_name=QUEUE_NAME)
        logging.info(f"speech_to_text processed job {body.get('id')}: {body['text']}")
    except Exception as e:
        logging.error(f"Error in speech_to_text processing: {e}")
