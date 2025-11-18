# downloader/__init__.py
from azure.functions import QueueMessage

from .strategies import YTDownloader
from ..shared.common import read_job_metadata, write_failed_job_metadata
from ..shared.config import MAX_DEQUEUE_COUNT
from ..shared.logs import logging


def parse_id(msg: QueueMessage):
    try:
        body = msg.get_json()
        logging.info(f"Received body: ${body}")
        return body["id"]
    except Exception as e:
        logging.error(f"Failed to parse message: {e}")
        return e


def main(msg: QueueMessage):
    job_id = parse_id(msg)
    try:
        # Read job metadata to get URL and determine platform
        job_metadata = read_job_metadata(job_id)
        url = job_metadata.get("url")

        if not url:
            raise ValueError("No URL found in job metadata")

        # Determine which downloader to use based on URL
        if "youtube.com" in url or "youtu.be" in url:
            downloader = YTDownloader(job_id, url)
        else:
            raise ValueError(f"Unsupported platform for URL: {url}")

        # Execute the download strategy
        downloader.process()

    except Exception as e:
        logging.error(f"Error in downloading job {job_id}: {e}")

        if msg.dequeue_count >= MAX_DEQUEUE_COUNT:
            logging.error(f"Failed to download {job_id}: {e}")
            write_failed_job_metadata(job_id)

        raise
