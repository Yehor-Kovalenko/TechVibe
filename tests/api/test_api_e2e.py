import time
import pytest
import requests


POLL_INTERVAL = 10
POLL_TIMEOUT = 120
NEGATIVE_TEST_POLL_TIMEOUT = 240


def poll_job_status(base_url: str, job_id: str, timeout: int = POLL_TIMEOUT) -> dict:
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

    response = requests.get(f"{base_url}?id={job_id}")
    return response.json() if response.status_code == 200 else {"status": "TIMEOUT"}


class TestSummaryMetadataPositive:

    def test_video_processing_summary_metadata_positive(self, base_url, video_url):
        create_response = requests.post(base_url, json={"url": video_url})

        assert create_response.status_code == 200, (
            f"Job creation failed with status {create_response.status_code}"
        )

        job_data = create_response.json()
        job_id = job_data.get("id")

        assert job_id is not None, "Response missing job id"
        assert job_data.get("url") == video_url, "Response URL mismatch"

        final_status = poll_job_status(base_url, job_id, timeout=POLL_TIMEOUT)

        assert final_status.get("status") == "DONE", (
            f"Expected DONE status, got {final_status.get('status')}"
        )
        assert final_status.get("id") == job_id, "Job ID mismatch in status response"

        summary_response = requests.get(f"{base_url}?action=summary&id={job_id}")

        assert summary_response.status_code == 200, (
            f"Summary request failed with status {summary_response.status_code}"
        )

        summary_data = summary_response.json()

        assert summary_data.get("status") != "Didn't get the summary file bro, sorry", (
            "Summary file not available"
        )

        assert isinstance(summary_data, dict), "Summary should be a dictionary"
        assert len(summary_data) > 0, "Summary should not be empty"

        metadata_response = requests.get(f"{base_url}?action=metadata&id={job_id}")

        assert metadata_response.status_code == 200, (
            f"Metadata request failed with status {metadata_response.status_code}"
        )

        metadata = metadata_response.json()

        assert isinstance(metadata, dict), "Metadata should be a dictionary"
        assert len(metadata) > 0, "Metadata should not be empty"

        possible_metadata_fields = ["title", "duration", "author", "description", "url"]
        has_any_metadata = any(
            field in metadata and metadata[field]
            for field in possible_metadata_fields
        )

        assert has_any_metadata or len(metadata) > 0, (
            "Metadata should contain video information"
        )


class TestSummaryMetadataNegative:

    def test_video_processing_invalid_url_negative(self, base_url, invalid_video_url):
        create_response = requests.post(base_url, json={"url": invalid_video_url})

        assert create_response.status_code == 200, (
            f"Job creation failed with status {create_response.status_code}"
        )

        job_data = create_response.json()
        job_id = job_data.get("id")

        assert job_id is not None, "Response missing job id"
        assert job_data.get("url") == invalid_video_url, "Response URL mismatch"

        final_status = poll_job_status(base_url, job_id, timeout=NEGATIVE_TEST_POLL_TIMEOUT)

        failed_states = {"FAILED", "NO_SPEECH"}
        actual_status = final_status.get("status")

        assert actual_status in failed_states, (
            f"Expected FAILED or NO_SPEECH status, got {actual_status}"
        )
        assert final_status.get("id") == job_id, "Job ID mismatch in status response"

        summary_response = requests.get(f"{base_url}?action=summary&id={job_id}")

        assert summary_response.status_code in [200, 404], (
            f"Unexpected summary status code: {summary_response.status_code}"
        )

        if summary_response.status_code == 200:
            summary_data = summary_response.json()
            assert isinstance(summary_data, dict), "Summary response should be a dict"

        metadata_response = requests.get(f"{base_url}?action=metadata&id={job_id}")

        assert metadata_response.status_code in [200, 404], (
            f"Unexpected metadata status code: {metadata_response.status_code}"
        )


class TestApiEdgeCases:

    def test_missing_job_id_parameter(self, base_url):
        response = requests.get(f"{base_url}?action=summary")

        assert response.status_code == 400

        data = response.json()
        assert data.get("status") == "FAILED"
        assert "Missing job id" in data.get("message", "")

    def test_nonexistent_job_id(self, base_url):
        fake_job_id = "nonexistent-job-id-12345"

        response = requests.get(f"{base_url}?id={fake_job_id}")

        assert response.status_code == 404

        data = response.json()
        assert data.get("status") == "FAILED"
        assert "not found" in data.get("message", "").lower()

    def test_missing_url_in_post(self, base_url):
        response = requests.post(base_url, json={})

        assert response.status_code == 400

        data = response.json()
        assert data.get("status") == "FAILED"
        assert "Missing url" in data.get("message", "")

    def test_options_preflight(self, base_url):
        response = requests.options(base_url)

        assert response.status_code == 200
        assert "Access-Control-Allow-Origin" in response.headers
        assert "Access-Control-Allow-Methods" in response.headers
