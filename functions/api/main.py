import json
import uuid

from azure.functions import HttpRequest, HttpResponse

from ..shared.common import enqueue_message, read_blob, read_job_metadata, write_job_metadata, read_video_metadata
from ..shared.config import NEW_QUEUE, SUMMARY_FILENAME, TRANSCRIPT_FILENAME
from ..shared.job_status import JobStatus
from ..shared.logs import logging

cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }


def main(req: HttpRequest) -> HttpResponse:
    if req.method == "OPTIONS":
        return handle_preflight_options()

    action = req.params.get("action")
    logging.warning(f"${action} QWERTY")

    if req.method == "GET":
        return handle_get(req, action)
    
    return handle_post(req)


def handle_preflight_options() -> HttpResponse | None:
    return HttpResponse(
        status_code=200,
        headers=cors_headers
    )


def handle_get(req: HttpRequest, action: str) -> HttpResponse:
    """Handle GET request - check job status, summary, or metadata"""
    job_id = req.params.get("id")
    
    if not job_id:
        return HttpResponse(
            json.dumps({"status": JobStatus.FAILED.value, "message": "Missing job id parameter"}),
            status_code=400,
            mimetype="application/json",
            headers=cors_headers
        )

    try:
        response = {}
        if action == "summary":
            logging.info("ACTION == SUMMARY, accessed")
            try:
                response = read_blob(f"results/{job_id}/{SUMMARY_FILENAME}") 
            except:
                response = {"status": "Didn't get the summary file bro, sorry"}
        elif action == "metadata":
            response = read_video_metadata(job_id)
        else:
            response = read_job_metadata(job_id)

        return HttpResponse(
            json.dumps(response),
            status_code=200,
            mimetype="application/json",
            headers=cors_headers
        )
    except Exception as e:
        logging.error(f"Failed to read job data for {job_id} (action={action}): {e}")
        return HttpResponse(
            json.dumps({"status": JobStatus.FAILED.value, "message": "Data not found"}),
            status_code=404,
            mimetype="application/json",
            headers=cors_headers
        )


def handle_post(req: HttpRequest) -> HttpResponse:
    """Handle POST request - create new job"""
    try:
        body = req.get_json()
    except (ValueError, TypeError):
        body = {}

    job_id = body.get("id") or str(uuid.uuid4())
    url = body.get("url")
    
    if not url:
        return HttpResponse(
            json.dumps({"status": JobStatus.FAILED.value, "message": "Missing url parameter"}),
            status_code=400,
            mimetype="application/json",
            headers=cors_headers
        )

    try:
        write_job_metadata(job_id, url, JobStatus.CREATED.value)
        logging.info(f"api saved job {job_id} metadata to blob")

        msg = {"id": job_id}
        enqueue_message(msg, queue_name=NEW_QUEUE)
        logging.info(f"api queued job {job_id}")
    except Exception as e:
        logging.error(f"Failed to enqueue or upload blob: {e}")
        return HttpResponse(
            json.dumps({"status": JobStatus.FAILED.value, "message": str(e)}),
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


def handle_get(req: HttpRequest, action: str) -> HttpResponse:
    """Handle GET request - check job status, summary, or metadata"""
    job_id = req.params.get("id")

    if not job_id:
        return HttpResponse(
            json.dumps({"status": JobStatus.FAILED.value, "message": "Missing job id parameter"}),
            status_code=400,
            mimetype="application/json",
            headers=cors_headers
        )

    try:
        response = {}
        if action == "summary":
            logging.info("ACTION == SUMMARY, accessed")
            try:
                response = read_blob(f"results/{job_id}/{SUMMARY_FILENAME}")
            except:
                response = {"status": "Didn't get the summary file bro, sorry"}
        elif action == "metadata":
            response = read_video_metadata(job_id)
        elif action == "transcript":  # НОВИЙ ЕНДПОІНТ
            logging.info("ACTION == TRANSCRIPT, accessed")
            try:
                transcript_data = read_blob(f"results/{job_id}/{TRANSCRIPT_FILENAME}")
                # Витягуємо текст з транскрипту
                if isinstance(transcript_data, dict) and "text" in transcript_data:
                    response = {"full-text": transcript_data["text"]}
                elif isinstance(transcript_data, dict) and "segments" in transcript_data:
                    # Якщо транскрипт має segments, з'єднуємо їх
                    text = " ".join([seg.get("text", "") for seg in transcript_data["segments"]])
                    response = {"full-text": text}
                else:
                    response = {"full-text": str(transcript_data)}
            except Exception as e:
                logging.error(f"Failed to read transcript for {job_id}: {e}")
                response = {"full-text": "Transcript not available yet"}
        else:
            response = read_job_metadata(job_id)

        return HttpResponse(
            json.dumps(response),
            status_code=200,
            mimetype="application/json",
            headers=cors_headers
        )
    except Exception as e:
        logging.error(f"Failed to read job data for {job_id} (action={action}): {e}")
        return HttpResponse(
            json.dumps({"status": JobStatus.FAILED.value, "message": "Data not found"}),
            status_code=404,
            mimetype="application/json",
            headers=cors_headers
        )
