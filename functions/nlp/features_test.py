import logging
import json
from pathlib import Path
from transformers import pipeline
import torch


# -----------------------------
# 0. GPU / CPU AUTO-DETECT
# -----------------------------
if torch.cuda.is_available():
    DEVICE = 0
    device_name = torch.cuda.get_device_name(0)
    logging.info(f"CUDA available – using GPU: {device_name}")
else:
    DEVICE = -1
    logging.info("CUDA not available – using CPU")


# -----------------------------
# 1. LOAD KEYWORDS JSON
# -----------------------------
keywords_path = Path(__file__).parent / "key-words.json"

try:
    with open(keywords_path, "r", encoding="utf-8") as f:
        device_data = json.load(f)
    logging.info(f"[DEBUG] Loaded device_data: {device_data}")
except Exception as e:
    logging.error(f"[DEBUG] Could not read key-words.json: {e}")
    device_data = []

try:
    smartphone = device_data[0]
    features = smartphone.get("features", [])
    device = smartphone.get("device")
except Exception as e:
    logging.error(f"[DEBUG] Could not parse device_data: {e}")
    features = []
    device = "smartphone"

logging.info(f"[DEBUG] Device parsed: {device}")
logging.info(f"[DEBUG] Features parsed: {features}")


# -----------------------------
# 2. INITIALIZE MODELS (with checks)
# -----------------------------
sentiment_model = None
feature_classifier = None

try:
    sentiment_model = pipeline(
        "sentiment-analysis",
        model="distilbert/distilbert-base-uncased-finetuned-sst-2-english",
        device=DEVICE
    )
    logging.info("[OK] Sentiment model initialized successfully.")
    logging.info(f"Sentiment model device: {'GPU' if DEVICE == 0 else 'CPU'}")
except Exception as e:
    logging.error(f"[ERROR] Failed to initialize sentiment model: {e}")

try:
    feature_classifier = pipeline(
        "zero-shot-classification",
        model="facebook/bart-large-mnli",
        device=DEVICE
    )
    logging.info("[OK] Zero-shot classifier initialized successfully.")
    logging.info(f"Zero-shot classifier device: {'GPU' if DEVICE == 0 else 'CPU'}")
except Exception as e:
    logging.error(f"[ERROR] Failed to initialize zero-shot classifier: {e}")


# Optional: hard fail if models aren't loaded
if sentiment_model is None or feature_classifier is None:
    raise RuntimeError("One or more NLP models failed to initialize – stopping execution.")

# -----------------------------
# 3. ASSURE TRANSCRIPT EXISTS
# -----------------------------

transcript = """
I’ve been testing this smartphone for almost two weeks now, and overall the experience has been pretty solid. 
Starting with the battery life, I’m genuinely impressed. On most days I end with around 25–30% battery left, 
even with heavy use that includes streaming, GPS navigation, and social media. Charging is fast too — 
I can get from 10% to 70% in about half an hour, which is super convenient.

It handles answering incoming calls, bluetooth use and internet connection just excelent. The entire device looks pretty
solid with sleek and elegant design.

The camera setup is where my feelings are mixed. In daylight the photos look sharp, vibrant, and full of detail. 
Portrait mode has good edge detection, although it struggles sometimes with hair. But low-light performance is 
disappointing. The images become grainy, autofocus hunts around, and colors look mushy. Video stabilization works 
decently during the day, but at night there's jitter and noise.

Performance is great overall. Apps open instantly, multitasking is smooth, and I haven’t seen any noticeable lag. 
Gaming performance is surprisingly stable — even heavier games run well on medium to high settings. 
The phone does get warm after about 20 minutes, but not dangerously hot.

The screen is definitely one of the highlights. It's bright enough to see outdoors, colors are punchy without looking 
oversaturated, and scrolling feels really fluid thanks to the high refresh rate. The only annoyance is the 
automatic brightness control — it sometimes dims the screen too aggressively indoors, and I have to adjust it manually.

As for the speakers, they're just okay. The sound is clear but lacks bass, and at maximum volume there's a slight 
distortion. Headphone output via USB-C is surprisingly good though, with nice clarity.

The software is clean, and I appreciate that there isn’t much bloatware. Updates seem consistent so far. 
However, a couple of system animations feel slightly slower than expected, which is odd given the strong performance.

Overall, this smartphone offers great value. It’s not perfect — especially if camera performance at night is 
important to you — but for the price, it delivers a strong combination of battery life, display quality, 
and everyday performance.

"""


# -----------------------------
# 4. PROCESS SENTENCES
# -----------------------------

sentences = [s.strip() for s in transcript.split(".") if s.strip()]


feature_sentiments = {f: [] for f in features}

print("SENTENCE ANALYSIS\n")

for s in sentences:
    # --- sentiment ---
    try:
        result = sentiment_model(s)[0]
        score = result["score"]
        if result["label"].upper() == "NEGATIVE":
            score = -score

        print("------------------------")
        print(f"Sentence: '{s}'")
        print(f"Sentiment: {result['label']}, Score: {score}")

    except Exception as e:
        print(f"Sentiment analysis failed for: '{s}' -> {e}")
        continue

    # --- zero-shot feature classification ---
    try:
        cls = feature_classifier(s, candidate_labels=features)
        top_feature, confidence = cls["labels"][0], cls["scores"][0]

        print(f"  Classified as feature: '{top_feature}', conf={confidence:.2f}")

        if confidence > 0.3:
            feature_sentiments[top_feature].append(score)

    except Exception as e:
        print(f"Feature classification failed for: '{s}' -> {e}")
        continue


# -----------------------------
# 5. AGGREGATE RESULTS
# -----------------------------
formatted = {}

print("\nAggregating scores per feature:")
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
        formatted[f] = {"score": score_10, "label": label}
        print(f"{f}: scores={scores}, avg={avg:.2f}, 10-score={score_10}, label={label}")

    else:
        formatted[f] = {"score": 5.0, "label": "NEUTRAL"}
        print(f"{f}: no matched sentences -> default score=5.0")


final = {"sentiment-by-part": formatted}

print("\n------------------------")
print("FINAL CLASSIFICATION:")
print(final)