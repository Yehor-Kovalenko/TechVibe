import React, { useEffect, useState } from 'react';
import { checkJobStatus } from './fetchApiUrl';
import { JobStatus } from '../config/JobStatus';

type LoadingPageProps = { jobId: string; onDone?: () => void; delayMs?: number };

const LoadingPage: React.FC<LoadingPageProps> = ({ jobId, onDone, delayMs = 60_000 }) => {
  const [status, setStatus] = useState<string>('Waiting for processing...');

  useEffect(() => {
    let pollInterval: number | null = null;
    let timeoutId: number | null = null;
    let isMounted = true;

    timeoutId = window.setTimeout(() => {
      isMounted = false;  // ← Set flag first
      if (pollInterval) clearInterval(pollInterval);
      onDone?.();
    }, delayMs);

    window.setTimeout(() => {
      pollInterval = window.setInterval(async () => {
        if (!isMounted) {
          if (pollInterval) clearInterval(pollInterval);  // ← Stop itself
          return;
        }
        
        try {
          const statusResponse = await checkJobStatus(jobId);
          
          if (!isMounted) {
            if (pollInterval) clearInterval(pollInterval);  // ← Stop after async
            return;
          }
          
          console.log('Job status:', statusResponse);
          setStatus(`Status: ${statusResponse.status}`);

          if (statusResponse.status === JobStatus.DONE) {
            isMounted = false;  // ← Prevent further polls
            if (pollInterval) clearInterval(pollInterval);
            if (timeoutId) clearTimeout(timeoutId);
            console.log('Job completed! Proceeding to dashboard...');
            onDone?.();
          }
        } catch (error) {
          if (!isMounted) return;
          console.error('Error polling job status:', error);
        }
      }, 3000);
    }, 3000);

    return () => {
      console.log('🧹 LoadingPage cleanup running - component unmounting');
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [jobId, onDone, delayMs]);

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
        <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Job ID: {jobId}
          </p>
          {status && (
            <p className="text-sm text-blue-600 dark:text-blue-300 mt-2">
              {status}
            </p>
          )}
        </div>
      </div>
    </main>
  );
};

export default LoadingPage;