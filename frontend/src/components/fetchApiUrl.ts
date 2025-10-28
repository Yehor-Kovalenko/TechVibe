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

    const data: JobStatusResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking job status:', error);
    throw error;
  }
}