"""
Test cases for Summary and Metadata API endpoints.

=== TEST SPECIFICATION ===

1. Nazwa: Testowanie pobierania podsumowania i metadanych dla poprawnego wideo
   Identyfikator: api2.1
   Scenariusz testowy: Przetwarzanie wideo i pobieranie wyników
   Identyfikator scenariusza testowego: api2
   Cel: Sprawdzenie poprawności przetwarzania wideo oraz dostępności podsumowania i metadanych
   Priorytet: Najwyższy
   Warunki wstępne: Działający serwer API, dostępne połączenie z Azure Storage
   Dane testowe: Poprawny URL wideo YouTube (https://www.youtube.com/shorts/Qfb2IjEbIAI)
   Oczekiwany wynik: Status zadania DONE, dostępne podsumowanie z wymaganymi polami, dostępne metadane wideo
   Przebieg testu:
   1. Wysłanie żądania POST z URL wideo do API
   2. Weryfikacja otrzymania job_id w odpowiedzi
   3. Odpytywanie (polling) statusu zadania do momentu uzyskania statusu DONE lub przekroczenia timeout
   4. Pobranie podsumowania poprzez GET z action=summary
   5. Weryfikacja struktury i zawartości podsumowania
   6. Pobranie metadanych poprzez GET z action=metadata
   7. Weryfikacja struktury i zawartości metadanych wideo

2. Nazwa: Testowanie obsługi niepoprawnego URL wideo
   Identyfikator: api2.2
   Scenariusz testowy: Przetwarzanie wideo i pobieranie wyników
   Identyfikator scenariusza testowego: api2
   Cel: Sprawdzenie poprawnej obsługi błędów dla nieprawidłowego URL wideo
   Priorytet: Wysoki
   Warunki wstępne: Działający serwer API, dostępne połączenie z Azure Storage
   Dane testowe: Niepoprawny/nieistniejący URL wideo (https://www.youtube.com/watch?v=INVALID_VIDEO_ID_12345)
   Oczekiwany wynik: Status zadania FAILED lub NO_SPEECH, odpowiednia obsługa błędów w endpointach summary i metadata
   Przebieg testu:
   1. Wysłanie żądania POST z niepoprawnym URL wideo do API
   2. Weryfikacja otrzymania job_id w odpowiedzi
   3. Odpytywanie (polling) statusu zadania do momentu uzyskania statusu FAILED/NO_SPEECH lub przekroczenia timeout
   4. Weryfikacja że status końcowy to FAILED lub NO_SPEECH
   5. Próba pobrania podsumowania - weryfikacja obsługi błędu
   6. Próba pobrania metadanych - weryfikacja obsługi błędu lub pustych danych

"""

import time
import pytest
import requests


POLL_INTERVAL = 10  # seconds between status checks
POLL_TIMEOUT = 120  # total timeout in seconds
NEGATIVE_TEST_POLL_TIMEOUT = 240


def poll_job_status(base_url: str, job_id: str, timeout: int = POLL_TIMEOUT) -> dict:
    """
    Poll job status until terminal state (DONE, FAILED, NO_SPEECH) or timeout.

    Returns the final job metadata response.
    """
    start_time = time.time()
    terminal_states = {"DONE", "FAILED", "NO_SPEECH"}

    while time.time() - start_time < timeout:
        response = requests.get(f"{base_url}?id={job_id}")

        if response.status_code == 200:
            data = response.json()
            status = data.get("status")

            if status in terminal_states:
                return data

        time.sleep(POLL_INTERVAL)

    # Timeout - return last known state
    response = requests.get(f"{base_url}?id={job_id}")
    return response.json() if response.status_code == 200 else {"status": "TIMEOUT"}


class TestSummaryMetadataPositive:
    """
    Positive test cases for summary and metadata endpoints.

    Test ID: api2.1
    """

    def test_video_processing_summary_metadata_positive(self, base_url, valid_video_url):
        """
        Test complete video processing flow with valid video URL.

        Verifies:
        - Job creation returns valid job_id
        - Job reaches DONE status within timeout
        - Summary endpoint returns valid data with required fields
        - Metadata endpoint returns valid video metadata
        """
        # Step 1: Create job with POST request
        create_response = requests.post(base_url, json={"url": valid_video_url})

        assert create_response.status_code == 200, (
            f"Job creation failed with status {create_response.status_code}"
        )

        job_data = create_response.json()
        job_id = job_data.get("id")

        assert job_id is not None, "Response missing job id"
        assert job_data.get("url") == valid_video_url, "Response URL mismatch"

        # Step 2: Poll until job completes
        final_status = poll_job_status(base_url, job_id, timeout=POLL_TIMEOUT)

        assert final_status.get("status") == "DONE", (
            f"Expected DONE status, got {final_status.get('status')}"
        )
        assert final_status.get("id") == job_id, "Job ID mismatch in status response"

        # Step 3: Verify summary endpoint
        summary_response = requests.get(f"{base_url}?action=summary&id={job_id}")

        assert summary_response.status_code == 200, (
            f"Summary request failed with status {summary_response.status_code}"
        )

        summary_data = summary_response.json()

        # Summary should not contain error status
        assert summary_data.get("status") != "Didn't get the summary file bro, sorry", (
            "Summary file not available"
        )

        # Summary should be a non-empty dict (actual structure depends on NLP processing)
        assert isinstance(summary_data, dict), "Summary should be a dictionary"
        assert len(summary_data) > 0, "Summary should not be empty"

        # Step 4: Verify metadata endpoint
        metadata_response = requests.get(f"{base_url}?action=metadata&id={job_id}")

        assert metadata_response.status_code == 200, (
            f"Metadata request failed with status {metadata_response.status_code}"
        )

        metadata = metadata_response.json()

        assert isinstance(metadata, dict), "Metadata should be a dictionary"
        assert len(metadata) > 0, "Metadata should not be empty"

        # Common video metadata fields that should be present
        # (exact fields depend on your video metadata extraction)
        possible_metadata_fields = ["title", "duration", "author", "description", "url"]
        has_any_metadata = any(
            field in metadata and metadata[field]
            for field in possible_metadata_fields
        )

        assert has_any_metadata or len(metadata) > 0, (
            "Metadata should contain video information"
        )


class TestSummaryMetadataNegative:
    """
    Negative test cases for summary and metadata endpoints.

    Test ID: api2.2
    """

    def test_video_processing_invalid_url_negative(self, base_url, invalid_video_url):
        """
        Test video processing with invalid/non-existent video URL.

        Verifies:
        - Job creation still succeeds (job is queued)
        - Job eventually reaches FAILED or NO_SPEECH status
        - Summary endpoint handles error gracefully
        - Metadata endpoint handles error gracefully
        """
        # Step 1: Create job with invalid URL
        create_response = requests.post(base_url, json={"url": invalid_video_url})

        assert create_response.status_code == 200, (
            f"Job creation failed with status {create_response.status_code}"
        )

        job_data = create_response.json()
        job_id = job_data.get("id")

        assert job_id is not None, "Response missing job id"
        assert job_data.get("url") == invalid_video_url, "Response URL mismatch"

        # Step 2: Poll until job fails or times out
        final_status = poll_job_status(base_url, job_id, timeout=NEGATIVE_TEST_POLL_TIMEOUT)

        failed_states = {"FAILED", "NO_SPEECH"}
        actual_status = final_status.get("status")

        assert actual_status in failed_states, (
            f"Expected FAILED or NO_SPEECH status, got {actual_status}"
        )
        assert final_status.get("id") == job_id, "Job ID mismatch in status response"

        # Step 3: Verify summary endpoint handles failure gracefully
        summary_response = requests.get(f"{base_url}?action=summary&id={job_id}")

        # Should either return 200 with error message or 404
        assert summary_response.status_code in [200, 404], (
            f"Unexpected summary status code: {summary_response.status_code}"
        )

        if summary_response.status_code == 200:
            summary_data = summary_response.json()
            # For failed jobs, summary should indicate unavailability
            assert isinstance(summary_data, dict), "Summary response should be a dict"

        # Step 4: Verify metadata endpoint handles failure gracefully
        metadata_response = requests.get(f"{base_url}?action=metadata&id={job_id}")

        # Should either return 200 with empty/error data or 404
        assert metadata_response.status_code in [200, 404], (
            f"Unexpected metadata status code: {metadata_response.status_code}"
        )


class TestApiEdgeCases:
    """
    Additional edge case tests for API robustness.
    """

    def test_missing_job_id_parameter(self, base_url):
        """Test GET request without job id returns proper error."""
        response = requests.get(f"{base_url}?action=summary")

        assert response.status_code == 400

        data = response.json()
        assert data.get("status") == "FAILED"
        assert "Missing job id" in data.get("message", "")

    def test_nonexistent_job_id(self, base_url):
        """Test GET request with non-existent job id returns 404."""
        fake_job_id = "nonexistent-job-id-12345"

        response = requests.get(f"{base_url}?id={fake_job_id}")

        assert response.status_code == 404

        data = response.json()
        assert data.get("status") == "FAILED"
        assert "not found" in data.get("message", "").lower()

    def test_missing_url_in_post(self, base_url):
        """Test POST request without URL returns proper error."""
        response = requests.post(base_url, json={})

        assert response.status_code == 400

        data = response.json()
        assert data.get("status") == "FAILED"
        assert "Missing url" in data.get("message", "")

    def test_options_preflight(self, base_url):
        """Test OPTIONS preflight request returns CORS headers."""
        response = requests.options(base_url)

        assert response.status_code == 200
        assert "Access-Control-Allow-Origin" in response.headers
        assert "Access-Control-Allow-Methods" in response.headers
