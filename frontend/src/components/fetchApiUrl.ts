// fetchApiUrl.ts

interface ApiResponse {
  id: string;
  url: string;
}

interface JobStatusResponse {
  id: string;
  url: string;
  status: string;
}

interface JobSummaryResponse {
  id: string,
  sentiment_series: number[],
  overall_score: number,
  overall_label: string
}

interface VideoMetadataResponse {
  label: string;
  value: string;
}

interface JobAllDataResponse {
  summary?: JobSummaryResponse
  metadata?: VideoMetadataResponse
}

// POST request to create a new job
export async function createJob(url: string): Promise<ApiResponse> {
  try {
    const response = await fetch('http://localhost:7071/api/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
}

// GET request to check job status
export async function checkJobStatus(jobId: string): Promise<JobStatusResponse> {
  try {
    const response = await fetch(`http://localhost:7071/api/api?id=${jobId}`, {
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
export async function getBackendData(jobId: string): Promise<JobAllDataResponse | undefined> {
  const [summary] = await Promise.all([
      getJobSummary(jobId),
      fetchVideoMetadata(jobId),
      //add metadata call there
  ]);
  return {summary};
}

// GET to retrieve summary.json
async function getJobSummary(jobId: string): Promise<JobSummaryResponse | undefined> {
  try {const response = await fetch(`http://localhost:7071/api/api?action=summary&id=${jobId}`, {
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

export async function fetchVideoMetadata(jobId: string): Promise<VideoMetadataResponse | undefined> {
  try {const response = await fetch(`http://localhost:7071/api/api?action=metadata&id=${jobId}`, {
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