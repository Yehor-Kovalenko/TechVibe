from azure.functions import QueueMessage
from transformers import pipeline

from ..shared.common import write_blob, read_blob, read_job_metadata, write_job_metadata, write_failed_job_metadata
from ..shared.config import TRANSCRIPT_FILENAME, SUMMARY_FILENAME, MAX_DEQUEUE_COUNT
from ..shared.job_status import JobStatus
from ..shared.logs import logging


def parse_id(msg: QueueMessage):
    try:
        body = msg.get_json()
        logging.info(f"Received body: ${body}")
        return body["id"]
    except Exception as e:
        logging.error(f"Failed to parse message: {e}")
        return e


def extract_sentences(transcript):
    """
    This part processes a transcript job: perform sentence-level sentiment analysis and optionally classify sentences by features
    using a BART-based zero-shot model (facebook/bart-large-mnli). 
    IMPORTANT ! - zero-shot classification runs one sentence at a time and can be slow for long transcripts.
    """

    transcribed_text = transcript.get("transcript", "")
    if not transcribed_text:
        logging.error("Transcript missing or empty.")
        return Exception("Transcript missing or empty.")

    sentences = [s.strip() for s in transcribed_text.split(".") if s.strip()]
    return sentences


def analyze_sentiment(sentences, sentiment_model):
    sentiment_series = []

    for s in sentences:
        result = sentiment_model(s)[0]
        score = round(result["score"], 2)
        if result["label"].upper() == "NEGATIVE":
            score = -score
        sentiment_series.append({"label": result["label"], "score": score})

    return sentiment_series


def calculate_overall_sentiment(sentiment_series):
    # overall sentiment
    overall_score = round(sum([x["score"] for x in sentiment_series]) / len(sentiment_series), 2)
    overall_label = "NEUTRAL"
    if overall_score > 0.5:
        overall_label = "POSITIVE"
    elif overall_score < -0.5:
        overall_label = "NEGATIVE"

    return overall_score, overall_label


def save_results(job_id, overall_score, overall_label, sentiment_series):
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


def update_job_metadata(job_id):
    try:
        logging.info(f"nlp saved job {job_id} summary to blob")
        url = read_job_metadata(job_id).get("url")
        write_job_metadata(job_id, url, JobStatus.DONE.value)
        logging.info(f"nlp updated job {job_id} metadata to blob")
    except Exception as e:
        logging.error(f"Error in metadata update: {e}")


def main(msg: QueueMessage):
    job_id = parse_id(msg)
    try:
        transcript = read_blob(f"results/{job_id}/{TRANSCRIPT_FILENAME}")
        sentiment_model = pipeline("sentiment-analysis")

        sentences = extract_sentences(transcript)

        sentiment_series = analyze_sentiment(sentences, sentiment_model)
        overall_score, overall_label = calculate_overall_sentiment(sentiment_series)

        save_results(job_id, overall_score, overall_label, sentiment_series)
        update_job_metadata(job_id)

        logging.info(f"nlp processed job {job_id}: {overall_label}")
    except Exception as e:
        logging.error(f"Error in nlp job {job_id}: {e}")

        if msg.dequeue_count >= MAX_DEQUEUE_COUNT:
            write_failed_job_metadata(job_id)
            logging.error(f"Failed to nlp job {job_id}")

        raise
