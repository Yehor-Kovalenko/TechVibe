import json
import logging
import uuid

from azure.functions import HttpRequest, HttpResponse

from ..shared.common import write_blob, enqueue_message
from ..shared.config import NEW_QUEUE


def main(req: HttpRequest) -> HttpResponse:
    try:
        body = req.get_json()
    except (ValueError, TypeError):
        body = {}

    job_id = body.get("id") or str(uuid.uuid4())
    url = body["url"]

    try:
        write_blob(
            f"results/{job_id}/metadata.json",
            {"id": job_id, "url": url, "status": "CREATED"},
        )
        logging.info(f"api saved job {job_id} metadata to blob")

        msg = {"id": job_id}
        enqueue_message(msg, queue_name=NEW_QUEUE)
        logging.info(f"api queued job {job_id}")
    except Exception as e:
        logging.error(f"Failed to enqueue or upload blob: {e}")
        return HttpResponse(
            json.dumps({"status": "error", "message": str(e)}),
            status_code=500,
            mimetype="application/json"
        )

    logging.info(f"api processed job {job_id}: {body}")

    return HttpResponse(
        json.dumps(body),
    )