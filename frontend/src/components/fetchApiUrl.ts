// fetchApiUrl.ts
// Standalone function to fetch URL from your API
export async function fetchApiUrl(bodyData: Record<string, unknown>): Promise<string> {
  try {
    const response = await fetch('http://localhost:7071/api/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.url; // Returns just the URL string
  } catch (error) {
    console.error('Error fetching URL:', error);
    throw error; // Re-throw so caller can handle it
  }
}