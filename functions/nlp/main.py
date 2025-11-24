import json
from pathlib import Path
import torch

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


def analyze_sentiment(sentences, sentiment_model, feature_classifier, features):
    sentiment_series = []
    feature_sentiments = {f: [] for f in features}

    for s in sentences:
        result = sentiment_model(s)[0]
        score = round(result["score"], 2)
        if result["label"].upper() == "NEGATIVE":
            score = -score
        sentiment_series.append({"label": result["label"], "score": score})

        # Feature classification
        if feature_classifier and features:
            try:
                cls = feature_classifier(s, candidate_labels=features)
                top_feature, confidence = cls["labels"][0], cls["scores"][0]
                if confidence > 0.3:
                    feature_sentiments[top_feature].append(score)
            except Exception:
                continue

    # 3. Aggregate & format sentiment by part
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

    return sentiment_series, sentiment_by_part


def calculate_overall_sentiment(sentiment_series):
    # overall sentiment
    overall_score = round(sum([x["score"] for x in sentiment_series]) / len(sentiment_series), 2)
    overall_label = "NEUTRAL"
    if overall_score > 0.5:
        overall_label = "POSITIVE"
    elif overall_score < -0.5:
        overall_label = "NEGATIVE"

    return overall_score, overall_label

def save_results(job_id, overall_score, overall_label, sentiment_series, sentiment_by_part, device):
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


def update_job_metadata(job_id):
    try:
        logging.info(f"nlp saved job {job_id} summary to blob")
        url = read_job_metadata(job_id).get("url")
        write_job_metadata(job_id, url, JobStatus.DONE.value)
        logging.info(f"nlp updated job {job_id} metadata to blob")
    except Exception as e:
        logging.error(f"Error in metadata update: {e}")

def read_keywords():
    keywords_path = Path(__file__).parent / "key-words.json"
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

    return device, features

def main(msg: QueueMessage):
    job_id = parse_id(msg)
    try:
        transcript = read_blob(f"results/{job_id}/{TRANSCRIPT_FILENAME}")
        device, features = read_keywords()

        if torch.cuda.is_available():
            model_device = 0  # GPU
            logging.info("CUDA available – using GPU for NLP models")
        else:
            model_device = -1  # CPU
            logging.info("CUDA not available – using CPU for NLP models")

        try:
            sentiment_model = pipeline(
                "sentiment-analysis",
                model="distilbert/distilbert-base-uncased-finetuned-sst-2-english",
                device=model_device
            )
            logging.info(f"Sentiment model initialized on {'GPU' if model_device == 0 else 'CPU'}")
        except Exception as e:
            logging.error(f"Failed to initialize sentiment model: {e}")
            raise

        try:
            feature_classifier = pipeline(
                "zero-shot-classification",
                model="facebook/bart-large-mnli",
                device=model_device
            )
            logging.info(f"Zero-shot classifier initialized on {'GPU' if model_device == 0 else 'CPU'}")
        except Exception as e:
            logging.error(f"Failed to initialize zero-shot classifier: {e}")
            raise

        sentences = extract_sentences(transcript)

        sentiment_series, sentiment_by_part = analyze_sentiment(sentences, sentiment_model, feature_classifier, features)
        overall_score, overall_label = calculate_overall_sentiment(sentiment_series)
        logging.info(f"Sentiment was estimated. Sentiment overall label: {overall_label}. Sentiment by part: {sentiment_by_part}")
        save_results(job_id, overall_score, overall_label, sentiment_series, sentiment_by_part, device)
        update_job_metadata(job_id)

        logging.info(f"nlp processed job {job_id}: {overall_label}")
    except Exception as e:
        logging.error(f"Error in nlp job {job_id}: {e}")

        if msg.dequeue_count >= MAX_DEQUEUE_COUNT:
            write_failed_job_metadata(job_id)
            logging.error(f"Failed to nlp job {job_id}")

        raise
