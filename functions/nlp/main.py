import azure.functions as func
import logging
from ..shared.common import upload_result_blob
from ..shared.config import RESULTS_CONTAINER

def main(msg: func.QueueMessage):
    try:
        body = msg.get_json()
    except Exception as e:
        logging.error(f"Failed to parse message: {e}")
        return
    logging.info('NLP function processed a message: %s', body)
    # process only step 2
    if body.get("step") != 2:
        logging.info(f"Skipping message with step {body.get('step')}")
        return
    try:
        body["text"] = body.get("text", "") + "_nlp"
        body["step"] = 3
        # Store intermediate result in blob
        upload_result_blob(f"{body['id']}_step2.json", body, container=RESULTS_CONTAINER)
        logging.info(f"nlp processed job {body.get('id')}: {body['text']}")
    except Exception as e:
        logging.error(f"Error in nlp processing: {e}")
