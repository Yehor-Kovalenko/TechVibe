import pytest
from transformers import pipeline

from functions.nlp.main import (
    extract_sentences,
    analyze_sentiment,
    calculate_overall_sentiment
)


# ------------------------------------------------------
# MODEL FIXTURES (provided)
# ------------------------------------------------------
@pytest.fixture(scope="session")
def sentiment_model():
    return pipeline(
        "sentiment-analysis",
        model="distilbert/distilbert-base-uncased-finetuned-sst-2-english",
        device=-1,
    )


@pytest.fixture(scope="session")
def feature_classifier():
    return pipeline(
        "zero-shot-classification",
        model="facebook/bart-large-mnli",
        device=-1,
    )


# ------------------------------------------------------
# TRANSCRIPTS (provided)
# ------------------------------------------------------
@pytest.fixture
def full_transcript():
    return {
        "transcript": """
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
    }


@pytest.fixture
def medium_transcript():
    return {
        "transcript": """
        I’ve been testing this smartphone for two weeks, and overall the experience has been solid. 
        The battery life is impressive, usually ending the day with 25–30% left. Charging is fast — 10% to 70% in half an hour.

        It handles calls, Bluetooth, and internet well. The device looks sleek and elegant.

        The camera is mixed. Daylight photos are sharp and vibrant. Low-light performance is disappointing with grainy images and autofocus issues. Video stabilization is decent during the day but struggles at night.

        Performance is great. Apps open quickly, multitasking is smooth, and gaming runs well. 

        The screen is bright and colors are punchy. Automatic brightness sometimes dims too aggressively indoors.

        Speakers are okay, clear but lacking bass. Headphone output is good.

        The software is clean with minimal bloatware. Updates are consistent. A few system animations feel slightly slow. The phone sometimes up after 20 minutes, but not dangerously.

        Overall, the smartphone offers good value. Not perfect — especially camera at night — but very strongstrong in battery, display, and performance.
        """
    }


@pytest.fixture
def short_transcript():
    return {
        "transcript": """
        The battery life is amazing and lasts whole day.
        The camera at night is bad and produces noisy images.
        The display is bright and sharp.
        Performance is smooth and fast.
        Speakers are slightly bellow average.
        """
    }


# ------------------------------------------------------
# FEATURE SET
# ------------------------------------------------------
@pytest.fixture
def features():
    return [
        "battery",
        "camera",
        "display",
        "performance",
        "speakers",
        "software"
    ]


# ------------------------------------------------------
# TESTS
# ------------------------------------------------------
class TestExtractSentences:

    def test_extract_sentences_full(self, full_transcript):
        sentences = extract_sentences(full_transcript)
        assert isinstance(sentences, list)
        assert len(sentences) == 27              # full transcript has many sentences
        assert all(isinstance(s, str) for s in sentences)

    def test_extract_sentences_medium(self, medium_transcript):
        sentences = extract_sentences(medium_transcript)
        assert isinstance(sentences, list)
        assert 12 <= len(sentences) == 21       # medium length
        assert all(len(s) > 5 for s in sentences)

    def test_extract_sentences_short(self, short_transcript):
        sentences = extract_sentences(short_transcript)
        assert len(sentences) == 5
        expected = [
            "The battery life is amazing and lasts whole day",
            "The camera at night is bad and produces noisy images",
            "The display is bright and sharp",
            "Performance is smooth and fast",
            "Speakers are slightly bellow average"
        ]
        assert sentences == expected


class TestAnalyzeSentiment:

    def test_feature_sentiments_short(
        self, short_transcript, sentiment_model, feature_classifier, features
    ):
        sentences = extract_sentences(short_transcript)

        sentiment_series, sentiment_by_feature = analyze_sentiment(
            sentences,
            sentiment_model,
            feature_classifier,
            features
        )

        # Validate output structure
        assert isinstance(sentiment_series, list)
        assert isinstance(sentiment_by_feature, dict)
        assert set(sentiment_by_feature.keys()) == set(features)

        # Feature-level expectations
        # battery: positive sentence
        assert sentiment_by_feature["battery"]["score"] >= 6.0
        assert sentiment_by_feature["battery"]["label"] == "POSITIVE"

        # camera: negative sentence
        assert sentiment_by_feature["camera"]["score"] <= 4.0
        assert sentiment_by_feature["camera"]["label"] == "NEGATIVE"

        # display: positive
        assert sentiment_by_feature["display"]["label"] == "POSITIVE"

        # performance: positive
        assert sentiment_by_feature["performance"]["label"] == "POSITIVE"

        # speakers: neutral/weak positive
        assert sentiment_by_feature["speakers"]["label"] in ["NEUTRAL", "NEGATIVE"]

    def test_feature_sentiments_medium(
            self, medium_transcript, sentiment_model, feature_classifier, features
    ):
        sentences = extract_sentences(medium_transcript)
        _, sentiment_by_feature = analyze_sentiment(
            sentences, sentiment_model, feature_classifier, features
        )

        # A lot of positive, some negative camera
        assert sentiment_by_feature["battery"]["label"] == "POSITIVE"
        assert sentiment_by_feature["camera"]["label"] in ["NEGATIVE", "NEUTRAL"]
        assert sentiment_by_feature["display"]["label"] == "NEUTRAL"
        assert sentiment_by_feature["performance"]["label"] == "POSITIVE"
        assert sentiment_by_feature["speakers"]["label"] in ["NEUTRAL", "POSITIVE"]
        assert sentiment_by_feature["software"]["label"] in ["NEUTRAL", "POSITIVE"]

        # ---------- FULL ----------

    def test_feature_sentiments_full(
            self, full_transcript, sentiment_model, feature_classifier, features
    ):
        sentences = extract_sentences(full_transcript)
        _, sentiment_by_feature = analyze_sentiment(
            sentences, sentiment_model, feature_classifier, features
        )

        # full transcript has more detailed polarity variation
        assert sentiment_by_feature["battery"]["label"] == "POSITIVE"
        assert sentiment_by_feature["camera"]["label"] in ["NEGATIVE", "NEUTRAL"]
        assert sentiment_by_feature["display"]["label"] == "POSITIVE"
        assert sentiment_by_feature["performance"]["label"] == "POSITIVE"
        assert sentiment_by_feature["speakers"]["label"] in ["NEUTRAL", "POSITIVE"]
        assert sentiment_by_feature["software"]["label"] in ["NEUTRAL", "POSITIVE"]



    def test_sentiment_series_structure(
        self, medium_transcript, sentiment_model, feature_classifier, features
    ):
        sentences = extract_sentences(medium_transcript)
        sentiment_series, _ = analyze_sentiment(
            sentences,
            sentiment_model,
            feature_classifier,
            features
        )

        assert len(sentiment_series) == len(sentences)
        for entry in sentiment_series:
            assert "label" in entry
            assert "score" in entry
            assert isinstance(entry["score"], float)


class TestOverallSentiment:

    def test_overall_sentiment_short(self, short_transcript, sentiment_model, feature_classifier, features):
        sentences = extract_sentences(short_transcript)
        sentiment_series, _ = analyze_sentiment(
            sentences,
            sentiment_model,
            feature_classifier,
            features
        )

        overall_score, overall_label = calculate_overall_sentiment(sentiment_series)

        assert isinstance(overall_score, float)
        assert overall_label in ["POSITIVE", "NEGATIVE", "NEUTRAL"]

        assert overall_score > 0
        assert overall_label in ["POSITIVE", "NEUTRAL"]

    def test_overall_sentiment_medium(
        self, medium_transcript, sentiment_model, feature_classifier, features
    ):
        sentences = extract_sentences(medium_transcript)
        sentiment_series, _ = analyze_sentiment(
            sentences, sentiment_model, feature_classifier, features
        )
        score, label = calculate_overall_sentiment(sentiment_series)

        # medium transcript is mostly positive → should be positive or strong neutral
        assert label in ["POSITIVE", "NEUTRAL"]
        assert score > -0.2

    def test_overall_sentiment_full(
        self, full_transcript, sentiment_model, feature_classifier, features
    ):
        sentences = extract_sentences(full_transcript)
        sentiment_series, _ = analyze_sentiment(
            sentences, sentiment_model, feature_classifier, features
        )
        score, label = calculate_overall_sentiment(sentiment_series)

        # full transcript is strongly positive except for camera low-light issues
        assert label in ["POSITIVE", "NEUTRAL"]
        assert score > 0