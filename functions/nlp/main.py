import logging
import json
from pathlib import Path


from azure.functions import QueueMessage
from transformers import pipeline
from ..shared.common import write_blob, read_blob, read_job_metadata, write_job_metadata
from ..shared.config import TRANSCRIPT_FILENAME, SUMMARY_FILENAME
from ..shared.job_status import JobStatus


def main(msg: QueueMessage):
    try:
        body = msg.get_json()
        logging.info(f"Received body: ${body}")
    except Exception as e:
        logging.error(f"Failed to parse message: {e}")
        return

    job_id = body["id"]
    transcript = read_blob(f"results/{job_id}/{TRANSCRIPT_FILENAME}")
    keywords_path = Path(__file__).parent / "key-words.json"
    sentiment_model = pipeline("sentiment-analysis")

    # try to load key-words.json if exists
    try:
        with open(keywords_path, "r", encoding="utf-8") as f:
            device_data = json.load(f)
        logging.info(f"device data: {device_data}")
        smartphone = device_data[0]
        features = smartphone.get("features", [])
        device = smartphone.get("device")
    except Exception:
        features = []
        device = "smartphone"

    """
    This part processes a transcript job: perform sentence-level sentiment analysis and optionally classify sentences by features
    using a BART-based zero-shot model (facebook/bart-large-mnli). 
    IMPORTANT ! - zero-shot classification runs one sentence at a time and can be slow for long transcripts.
    """

    # lightweight zero-shot classifier for feature assignment
    feature_classifier = None
    if features:
        try:
            feature_classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
        except Exception as e:
            logging.warning(f"Zero-shot classifier not available: {e}")

    transcribed_text = transcript.get("transcript", "")
    if not transcribed_text:
        logging.error("Transcript missing or empty.")
        return

    sentences = [s.strip() for s in transcribed_text.split(".") if s.strip()]
    sentiment_series = []
    feature_sentiments = {f: [] for f in features}

    for s in sentences:
        result = sentiment_model(s)[0]
        score = round(result["score"], 2)
        if result["label"].upper() == "NEGATIVE":
            score = -score
        sentiment_series.append({"label": result["label"], "score": score})

        # classify each sentence to feature if classifier available
        if feature_classifier and features:
            try:
                classification = feature_classifier(s, candidate_labels=features)
                top_feature, conf = classification["labels"][0], classification["scores"][0]
                if conf > 0.5:
                    feature_sentiments[top_feature].append(score)
            except Exception as e:
                logging.warning(f"Classification failed: {e}")

    # overall sentiment
    overall_score = round(sum([x["score"] for x in sentiment_series]) / len(sentiment_series), 2)
    overall_label = "NEUTRAL"
    if overall_score > 0.5:
        overall_label = "POSITIVE"
    elif overall_score < -0.5:
        overall_label = "NEGATIVE"

    # compute sentiment-by-part (feature-level)
    sentiment_by_part = {}
    for f, scores in feature_sentiments.items():
        if not scores:
            continue
        avg = round(sum(scores) / len(scores), 2)
        label = "NEUTRAL"
        if avg > 0.5:
            label = "POSITIVE"
        elif avg < -0.5:
            label = "NEGATIVE"
        sentiment_by_part[f] = {"score": avg, "label": label}

    # save results
    write_blob(
        f"results/{job_id}/{SUMMARY_FILENAME}",
        {
            "verdict": {"score": overall_score, "verdict": overall_label},
            "sentiment_series_chart": {
                "y": [s["score"] for s in sentiment_series],
                "labels": [s["label"] for s in sentiment_series],
            },
            "sentiment_by_part": {
                "device": device,
                "features_verdict": sentiment_by_part
            },
        },
    )
    logging.info(f"Summary sentiment by part content before writing the content {sentiment_by_part}")

    try:
        logging.info(f"nlp saved job {job_id} summary to blob")
        url = read_job_metadata(job_id).get("url")
        write_job_metadata(job_id, url, JobStatus.DONE.value)
        logging.info(f"nlp updated job {job_id} metadata to blob")
    except Exception as e:
        logging.error(f"Error in nlp processing: {e}")

    logging.info(f"nlp processed job {job_id}: {overall_label}")
