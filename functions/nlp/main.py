import logging
from azure.functions import QueueMessage
from ..shared.common import write_blob, read_blob


def main(msg: QueueMessage):
    try:
        body = msg.get_json()
        logging.info(f"Received body: ${body}")
    except Exception as e:
        logging.error(f"Failed to parse message: {e}")
        return

    job_id = body["id"]
    text = read_blob(f"results/{job_id}/text.json")

    summary = "positive" if len(text["text"]) > 2 else "negative"

    try:
        write_blob(
            f"results/{job_id}/summary.json",
            {"id": job_id, "summary": summary},
        )
        logging.info(f"nlp saved job {job_id} summary to blob")
    except Exception as e:
        logging.error(f"Error in nlp processing: {e}")

    logging.info(f"nlp processed job {job_id}: {summary}")
