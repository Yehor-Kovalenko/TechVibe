import json
from pathlib import Path


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

    # Feature analysis

    # 0. Model

    feature_classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

    # 1. Split transcript into sentences
    sentences = [s.strip() for s in transcript.split(".") if s.strip()]

    # 2. Process sentences
    feature_sentiments = {f: [] for f in features}
    sentiment_series = []

    for s in sentences:
        # Sentiment
        try:
            result = sentiment_model(s)[0]
            score = result["score"]
            if result["label"].upper() == "NEGATIVE":
                score = -score
            sentiment_series.append({"label": result["label"], "score": score})
        except Exception:
            continue

        # Feature classification
        if feature_classifier and features:
            try:
                cls = feature_classifier(s, candidate_labels=features)
                top_feature, confidence = cls["labels"][0], cls["scores"][0]
                if confidence > 0.3:
                    feature_sentiments[top_feature].append(score)
            except Exception:
                continue

    # 3. Aggregate & format
    sentiment_by_part = {}
    for f, scores in feature_sentiments.items():
        if scores:
            avg = sum(scores) / len(scores)
            score_10 = round((avg + 1) * 5, 1)
            if avg <= -0.5:
                label = "NEGATIVE"
            elif -0.5 < avg < 0.5:
                label = "NEUTRAL"
            else:
                label = "POSITIVE"
            sentiment_by_part[f] = {"score": score_10, "label": label}
        else:
            sentiment_by_part[f] = {"score": 5.0, "label": "NEUTRAL"}

    # Overall sentiment
    if sentiment_series:
        overall_score = round(sum([x["score"] for x in sentiment_series]) / len(sentiment_series), 2)
    else:
        overall_score = 0.0

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
