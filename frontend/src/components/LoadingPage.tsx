import React, { useEffect } from 'react';
import { fetchApiUrl } from './fetchApiUrl.js';

type LoadingPageProps = { onDone?: () => void; delayMs?: number };

const LoadingPage: React.FC<LoadingPageProps> = ({ onDone, delayMs = 10_000 }) => {
  useEffect(() => {
    // Start the timer
    const t = setTimeout(() => onDone?.(), delayMs);
    
    // Start the fetch at the same time
    fetchApiUrl({ "url": "http://test.url.hannower.edu" })
      .then(url => {
        console.log('Received URL:', url);
      })
      .catch(error => {
        console.error('Error fetching URL:', error);
      });
    
    return () => clearTimeout(t);
  }, [onDone, delayMs]);

  return (
    <main className="min-h-screen grid place-items-center px-6">
      <div className="max-w-xl w-full text-center space-y-6">
        <div
          className="mx-auto h-16 w-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin"
          role="status"
          aria-label="Loading"
        />
        <h2 className="text-2xl font-medium">Aggregating reviews</h2>
        <p className="text-muted-foreground">
          Collecting video reviews across platforms and synthesizing a concise summary; this takes about 10 seconds.
        </p>
      </div>
    </main>
  );
};

export default LoadingPage;
