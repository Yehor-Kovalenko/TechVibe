import json
import logging
import uuid

from azure.functions import HttpRequest, HttpResponse

from ..shared.common import write_blob, enqueue_message, read_blob
from ..shared.config import NEW_QUEUE, JOB_METADATA_FILENAME
from ..shared.job_status import JobStatus


def main(req: HttpRequest) -> HttpResponse:
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }
    # Handle preflight OPTIONS request
    if req.method == "OPTIONS":
        return HttpResponse(
            status_code=200,
            headers=cors_headers
        )

    # check the additional route
    action = req.params.get("action")
    logging.warning(f"${action} QWERTY")

    # Handle GET request - check job status
    if req.method == "GET":
        job_id = req.params.get("id")
        
        if not job_id:
            return HttpResponse(
                json.dumps({"status": JobStatus.ERROR.value, "message": "Missing job id parameter"}),
                status_code=400,
                mimetype="application/json",
                headers=cors_headers
            )

        try:
            response = {}
            if action == "summary":
                # read summary
                response = read_blob(f"results/{job_id}/summary.json")
            else:
                # Read the job metadata from blob storage
                response = read_blob(f"results/{job_id}/{JOB_METADATA_FILENAME}")

            return HttpResponse(
                json.dumps(response),
                status_code=200,
                mimetype="application/json",
                headers=cors_headers
            )
        except Exception as e:
            logging.error(f"Failed to read job status for {job_id}: {e}")
            return HttpResponse(
                json.dumps({"status": JobStatus.ERROR.value, "message": "Job not found"}),
                status_code=404,
                mimetype="application/json",
                headers=cors_headers
            )
    
    # Handle POST request - create new job
    try:
        body = req.get_json()
    except (ValueError, TypeError):
        body = {}

    job_id = body.get("id") or str(uuid.uuid4())
    url = body.get("url")
    
    if not url:
        return HttpResponse(
            json.dumps({"status": JobStatus.ERROR.value, "message": "Missing url parameter"}),
            status_code=400,
            mimetype="application/json",
            headers=cors_headers
        )

    try:
        write_blob(
            f"results/{job_id}/{JOB_METADATA_FILENAME}",
            {"id": job_id, "url": url, "status": JobStatus.CREATED.value},
        )
        logging.info(f"api saved job {job_id} metadata to blob")

        msg = {"id": job_id}
        enqueue_message(msg, queue_name=NEW_QUEUE)
        logging.info(f"api queued job {job_id}")
    except Exception as e:
        logging.error(f"Failed to enqueue or upload blob: {e}")
        return HttpResponse(
            json.dumps({"status": JobStatus.ERROR.value, "message": str(e)}),
            status_code=500,
            mimetype="application/json",
            headers=cors_headers
        )

    logging.info(f"api processed job {job_id} with url {url}")

    return HttpResponse(
        json.dumps({"id": job_id, "url": url}),
        mimetype="application/json",
        headers=cors_headers
    )