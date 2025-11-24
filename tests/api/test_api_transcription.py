import requests

def test_video_transcription_pos(base_url, video_url):
    create_job = requests.post(base_url, json={
        "url": video_url
    })
    assert create_job.status_code == 200
    job_id = create_job.json().get("id")
    assert job_id

    response = requests.get(f"{base_url}?action=transcript&id={job_id}")
    assert response.status_code == 200
    body = response.json()

    assert body
    body = body["full-text"]
    assert body
    assert body.get("id") == job_id
    assert len(body.get("transcript")) > 0