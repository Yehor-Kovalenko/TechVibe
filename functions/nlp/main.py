import logging
from azure.functions import QueueMessage
from ..shared.common import write_blob, read_blob, read_job_metadata, write_job_metadata
from ..shared.config import TRANSCRIPT_FILENAME, SUMMARY_FILENAME
from ..shared.job_status import JobStatus
from transformers import pipeline


def main(msg: QueueMessage):
    try:
        body = msg.get_json()
        logging.info(f"Received body: ${body}")
    except Exception as e:
        logging.error(f"Failed to parse message: {e}")
        return

    job_id = body["id"]
    transcript = read_blob(f"results/{job_id}/{TRANSCRIPT_FILENAME}")

    # sentiment analysis
    sentiment_model = pipeline("sentiment-analysis")
    # overall summary along with sentiment for each sentence
    transcribed_text = transcript["transcript"]
    sentences = [s.strip() for s in transcribed_text.split(".") if s.strip()]
    sentiment_series = []
    for i, s in enumerate(sentences):
        result = sentiment_model(s)[0]
        # make the score signed
        score = round(result["score"], 2)
        if result["label"].upper() == "NEGATIVE":
            score = -score

        sentiment_series.append({
            "label": result["label"],
            "score": score
        })

    overall_score = round(sum([x["score"] for x in sentiment_series]) / len(sentiment_series), 2)

    overall_label = "NEUTRAL"
    if overall_score > 0.5:
        overall_label = "POSITIVE"
    elif overall_score < -0.5:
        overall_label = "NEGATIVE"

    # save result to the blob and other related stuff
    write_blob(
        f"results/{job_id}/{SUMMARY_FILENAME}",
        {
            "verdict": {
                "score": overall_score,
                "verdict": overall_label,
            },
            "sentiment_series_chart": {
                "y": [s["score"] for s in sentiment_series],
                "labels": [s["label"] for s in sentiment_series]
            }
        },
    )
    try:
        logging.info(f"nlp saved job {job_id} summary to blob")

        url = read_job_metadata(job_id).get("url")
        write_job_metadata(job_id, url, JobStatus.DONE.value)
        logging.info(f"nlp updated job ${job_id} metadata to blob")

    except Exception as e:
        logging.error(f"Error in nlp processing: {e}")

    logging.info(f"nlp processed job {job_id}: {overall_label}")
