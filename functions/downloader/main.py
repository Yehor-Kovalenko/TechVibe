# downloader/__init__.py
from azure.functions import QueueMessage
from ..shared.common import read_blob, read_job_metadata, write_job_metadata
from ..shared.logs import logging
from .strategies import YTDownloader


def main(msg: QueueMessage):
    try:
        body = msg.get_json()
    except Exception as e:
        logging.error(f"Failed to parse message: {e}")
        return
    
    logging.info('DOWNLOADER function received a message from NEW queue: %s', body)
    
    job_id = body["id"]
    
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
        logging.error(f"Error processing job {job_id}: {e}")
        raise