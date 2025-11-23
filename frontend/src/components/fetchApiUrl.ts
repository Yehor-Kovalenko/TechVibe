// fetchApiUrl.ts

interface ApiResponse {
  id: string;
  url: string;
}

interface JobStatusResponse {
  id: string;
  url: string;
  status: string;
  message?: string;
}

interface JobSummaryResponse {
  verdict: {
    score: number;
    label: string;
  };
  sentiment_series_chart: {
    y: number[];
    labels: string[];
  }
  sentiment_by_part: {
  [key: string]: {
    score: number;
    label: string;
  }
}
}

interface TranscriptResponse {
  "full-text": string;
}

interface VideoMetadataResponse {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  "video-metadata": any
}

interface JobAllDataResponse {
  summary: object;
}

const URL = 'http://localhost:7071/api/api';

// POST request to create a new job
export async function createJob(url: string): Promise<ApiResponse> {
  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
}

// GET request to check job status
export async function checkJobStatus(
  jobId: string
): Promise<JobStatusResponse> {
  try {
    const response = await fetch(`${URL}?id=${jobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking job status:', error);
    throw error;
  }
}

//  External method to retrieve all data from the backend
export async function getBackendData(
  jobId: string
): Promise<JobAllDataResponse> {
  const [summary, metadata, transcript, sentimentByPart] = await Promise.all([
    getJobSummary(jobId),
    fetchVideoMetadata(jobId),
    fetchTranscript(jobId),
    fetchSentimentByPart(jobId),
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  ]) as [JobSummaryResponse | undefined, VideoMetadataResponse | undefined, TranscriptResponse | undefined, any];

  return {
    summary: {
      ...(summary || {}),
      ...(metadata || {}),
      ...(transcript || {}),
      ...(sentimentByPart || {}),
    },
  };
}

// GET to retrieve summary.json
async function getJobSummary(
  jobId: string
): Promise<JobSummaryResponse | undefined> {
  try {
    const response = await fetch(
      `${URL}?action=summary&id=${jobId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return undefined;
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking job status:', error);
    return undefined;
  }
}

export async function fetchVideoMetadata(jobId: string): Promise<VideoMetadataResponse | undefined> {
  try {const response = await fetch(`${URL}?action=metadata&id=${jobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });


    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return undefined;
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking job status:', error);
    return undefined;
  }
}

async function fetchTranscript(
  jobId: string
): Promise<TranscriptResponse | undefined> {
  try {
    const response = await fetch(
      `${URL}?action=transcript&id=${jobId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return undefined;
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return undefined;
  }
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export async function fetchSentimentByPart(jobId: string): Promise<any> {
  try {
    const response = await fetch(
      `${URL}?action=sentiment-by-part&id=${jobId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return undefined;
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching sentiment by part:', error);
    return undefined;
  }
}
