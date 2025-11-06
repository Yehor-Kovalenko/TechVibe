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
  sentiment_series: [],
  overall_score: number,
  overall_label: string
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

// GET to retrieve summary.json
export async function getJobSummary(jobId: string): Promise<JobSummaryResponse | undefined> {
  try {const response = await fetch(`http://localhost:7071/api/api/summary?id=${jobId}`, {
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

export async function fetchMetadata(): Promise<Array<{label:string,value:string}>> {
  const response = await fetch('/api/metadata');
  const data = await response.json();
  // Transform keys to fields array suitable for MetadataWidget
  return Object.entries(data).map(([key, value]) => ({
    label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: String(value)
  }));
}