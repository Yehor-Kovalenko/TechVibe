import azure.functions as func
import logging
import json

from ..shared.common import upload_result_blob, enqueue_message_base64
from ..shared.config import TRANSCRIBED_QUEUE, RESULTS_CONTAINER

def main(msg: func.QueueMessage):
    try:
        logging.info("Function starting")
        # msg.get_body() już jest zdekodowane do bytes, nie trzeba base64.b64decode
        body = json.loads(msg.get_body().decode("utf-8"))
        logging.info('Received body: %s', body)
    except Exception as e:
        logging.error(f"Failed to parse message: {e}")
        return

    if body.get("step") != 1:
        logging.info(f"Skipping message with step {body.get('step')}")
        return

    try:
        body["text"] = body.get("text", "") + "_speech"
        body["step"] = 2
        # Store intermediate result in blob
        upload_result_blob(f"{body['id']}_step1.json", body, container=RESULTS_CONTAINER)
        enqueue_message_base64(body, queue_name=TRANSCRIBED_QUEUE)
        logging.info(f"speech_to_text processed job {body.get('id')}: {body['text']}")
    except Exception as e:
        logging.error(f"Error in speech_to_text processing: {e}")
