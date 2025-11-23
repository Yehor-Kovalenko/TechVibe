# downloader/strategies.py
from abc import ABC, abstractmethod

import yt_dlp

from ..shared.common import write_blob, enqueue_message, read_job_metadata, write_job_metadata
from ..shared.config import (
    TRANSCRIBED_QUEUE,
    VIDEO_METADATA_FILENAME,
    TRANSCRIPT_FILENAME
)
from ..shared.job_status import JobStatus
from ..shared.logs import logging


class BaseDownloader(ABC):
    """
    Abstract base class for platform-specific downloaders.

    Each platform implements its own download logic but shares
    the common interface for blob storage and queue management.
    """

    def __init__(self, job_id: str, url: str):
        self.job_id = job_id
        self.url = url
        self.job_metadata = None

    def process(self):
        """
        Main entry point. Loads metadata, executes download,
        writes results, and enqueues to appropriate queue.
        """
        try:
            self.job_metadata = read_job_metadata(self.job_id)
            result = self._download()

            if result is None:
                return

            self._save_results(result)
            self._finalize()
            logging.info(f"Downloader processed job {self.job_id}")

        except Exception as e:
            logging.error(f"Error in download processing for job {self.job_id}: {e}")
            raise

    @abstractmethod
    def _download(self) -> dict:
        """
        Platform-specific download implementation.
        Must return a dict with the downloaded content.
        """
        pass

    @abstractmethod
    def _save_results(self, result: dict):
        """
        Platform-specific logic for saving results to blob storage.
        """
        pass

    @abstractmethod
    def _finalize(self):
        """
        Platform-specific finalization: update metadata status
        and enqueue to the appropriate queue.
        """
        pass


class YTDownloader(BaseDownloader):
    """
    YouTube downloader - extracts transcripts directly without downloading audio.
    Skips DOWNLOADED_QUEUE and goes straight to TRANSCRIBED_QUEUE.
    """

    def _download(self) -> dict:
        """
        Download transcript using yt-dlp.
        Returns dict with transcript text and metadata, or None if no speech.
        """
        logging.info(f"Downloading YouTube transcript for job {self.job_id}")

        ydl_opts = {
            'skip_download': True,
            'writesubtitles': True,
            'writeautomaticsub': True,
            'subtitleslangs': ['en'],
            'subtitlesformat': 'json3',
            'quiet': True,
            'no_warnings': True,
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(self.url, download=False)

            subtitles = info.get('subtitles', {})
            auto_captions = info.get('automatic_captions', {})

            transcript_data = None
            subtitle_type = None

            if 'en' in subtitles:
                subtitle_type = 'manual'
                for sub in subtitles['en']:
                    if sub.get('ext') == 'json3':
                        transcript_data = sub
                        break

            if not transcript_data and 'en' in auto_captions:
                subtitle_type = 'auto'
                for sub in auto_captions['en']:
                    if sub.get('ext') == 'json3':
                        transcript_data = sub
                        break

            if not transcript_data:
                logging.info(f"No English subtitles available for job {self.job_id}")
                self.job_metadata["status"] = JobStatus.NO_SPEECH.value
                write_job_metadata(
                    self.job_id,
                    self.job_metadata.get("url"),
                    self.job_metadata.get("status")
                )
                logging.info(f"YTDownloader updated job {self.job_id} metadata to NO_SPEECH")
                return None

            import urllib.request
            with urllib.request.urlopen(transcript_data['url']) as response:
                import json
                subtitle_json = json.loads(response.read().decode('utf-8'))

            transcript_text = self._parse_json3_transcript(subtitle_json)

            video_metadata = {
                'title': info.get('title'),
                'duration': info.get('duration'),
                'uploader': info.get('uploader'),
                'upload_date': info.get('upload_date'),
                'view_count': info.get('view_count'),
                'subtitle_type': subtitle_type,
            }

            return {
                'transcript': transcript_text,
                'video_metadata': video_metadata,
            }

    def _parse_json3_transcript(self, subtitle_json: dict) -> str:
        """
        Parse json3 subtitle format and extract clean text.
        """
        events = subtitle_json.get('events', [])
        transcript_parts = []

        for event in events:
            segs = event.get('segs')
            if segs:
                for seg in segs:
                    text = seg.get('utf8', '').strip()
                    if text:
                        transcript_parts.append(text)

        return ' '.join(transcript_parts)

    def _save_results(self, result: dict):
        """
        Save transcript and video metadata to blob storage.
        """
        write_blob(
            f"results/{self.job_id}/{TRANSCRIPT_FILENAME}",
            {
                "id": self.job_id,
                "transcript": result['transcript'],
            },
        )
        logging.info(f"YTDownloader saved job {self.job_id} transcript to blob")

        write_blob(
            f"results/{self.job_id}/{VIDEO_METADATA_FILENAME}",
            {
                "video-metadata": result['video_metadata']
            },
        )
        logging.info(f"YTDownloader saved job {self.job_id} video metadata to blob")

    def _finalize(self):
        """
        Update status to TRANSCRIBED and enqueue to TRANSCRIBED_QUEUE.
        """
        self.job_metadata["status"] = JobStatus.TRANSCRIBED.value
        write_job_metadata(
            self.job_id,
            self.job_metadata.get("url"),
            self.job_metadata.get("status")
        )
        logging.info(f"YTDownloader updated job {self.job_id} metadata to TRANSCRIBED")

        msg = {"id": self.job_id}
        enqueue_message(msg, queue_name=TRANSCRIBED_QUEUE)
        logging.info(f"YTDownloader queued job {self.job_id} to TRANSCRIBED_QUEUE")
