import json

from azure.functions import QueueMessage
from transformers import pipeline
from ..shared.common import write_blob, read_blob, read_job_metadata, write_job_metadata
from ..shared.config import TRANSCRIPT_FILENAME, SUMMARY_FILENAME
from ..shared.job_status import JobStatus
from ..shared.logs import logging


def main(msg: QueueMessage):
    try:
        body = msg.get_json()
        logging.info(f"Received body: ${body}")
    except Exception as e:
        logging.error(f"Failed to parse message: {e}")
        return

    job_id = body["id"]
    transcript = read_blob(f"results/{job_id}/{TRANSCRIPT_FILENAME}")


    sentiment_model = pipeline("sentiment-analysis")

    """
    This part processes a transcript job: perform sentence-level sentiment analysis and optionally classify sentences by features
    using a BART-based zero-shot model (facebook/bart-large-mnli). 
    IMPORTANT ! - zero-shot classification runs one sentence at a time and can be slow for long transcripts.
    """

    transcribed_text = transcript.get("transcript", "")
    if not transcribed_text:
        logging.error("Transcript missing or empty.")
        return

    sentences = [s.strip() for s in transcribed_text.split(".") if s.strip()]
    sentiment_series = []

    for s in sentences:
        result = sentiment_model(s)[0]
        score = round(result["score"], 2)
        if result["label"].upper() == "NEGATIVE":
            score = -score
        sentiment_series.append({"label": result["label"], "score": score})


    # overall sentiment
    overall_score = round(sum([x["score"] for x in sentiment_series]) / len(sentiment_series), 2)
    overall_label = "NEUTRAL"
    if overall_score > 0.5:
        overall_label = "POSITIVE"
    elif overall_score < -0.5:
        overall_label = "NEGATIVE"

    # save results
    write_blob(
        f"results/{job_id}/{SUMMARY_FILENAME}",
        {
            "verdict": {"score": overall_score, "verdict": overall_label},
            "sentiment_series_chart": {
                "y": [s["score"] for s in sentiment_series],
                "labels": [s["label"] for s in sentiment_series],
            }
        },
    )

    try:
        logging.info(f"nlp saved job {job_id} summary to blob")
        url = read_job_metadata(job_id).get("url")
        write_job_metadata(job_id, url, JobStatus.DONE.value)
        logging.info(f"nlp updated job {job_id} metadata to blob")
    except Exception as e:
        logging.error(f"Error in nlp processing: {e}")

    logging.info(f"nlp processed job {job_id}: {overall_label}")
