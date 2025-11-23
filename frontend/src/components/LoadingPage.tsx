import React, { useEffect, useState } from 'react';
import { checkJobStatus } from './fetchApiUrl';
import { JobStatus } from '../config/JobStatus';

const STATUS_MESSAGES: Record<string, string> = {
  CREATED: 'Collecting video reviews...',
  DOWNLOADED: 'Processing video content...',
  TRANSCRIBED: 'Analyzing reviews...',
  DONE: 'Complete!',
  FAILED: 'Something went wrong',
  NO_SPEECH: 'No speech detected',
};

type LoadingPageProps = {
  jobId: string;
  onDone?: () => void;
  delayMs?: number;
};

export const LoadingPage: React.FC<LoadingPageProps> = ({
  jobId,
  onDone,
  delayMs = 60_000,
}) => {
  const [message, setMessage] = useState<string>('Initializing...');
  const [error, setError] = useState<string | null>(null);
  const [noSpeech, setNoSpeech] = useState<boolean>(false);

  useEffect(() => {
    let pollInterval: number | null = null;
    let timeoutId: number | null = null;
    let isMounted = true;

    timeoutId = window.setTimeout(() => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
      onDone?.();
    }, delayMs);

    window.setTimeout(() => {
      pollInterval = window.setInterval(async () => {
        if (!isMounted) {
          if (pollInterval) clearInterval(pollInterval);
          return;
        }

        try {
          const statusResponse = await checkJobStatus(jobId);

          if (!isMounted) {
            if (pollInterval) clearInterval(pollInterval);
            return;
          }

          if (statusResponse.status === JobStatus.FAILED) {
            isMounted = false;
            if (pollInterval) clearInterval(pollInterval);
            if (timeoutId) clearTimeout(timeoutId);
            setError(statusResponse.message || 'An unknown error occurred');
            return;
          }

          if (statusResponse.status === JobStatus.NO_SPEECH) {
            isMounted = false;
            if (pollInterval) clearInterval(pollInterval);
            if (timeoutId) clearTimeout(timeoutId);
            setNoSpeech(true);
            return;
          }

          const statusMsg = STATUS_MESSAGES[statusResponse.status] || 'Processing...';
          setMessage(statusMsg);

          if (statusResponse.status === JobStatus.DONE) {
            isMounted = false;
            if (pollInterval) clearInterval(pollInterval);
            if (timeoutId) clearTimeout(timeoutId);
            onDone?.();
          }
        } catch (error) {
          if (!isMounted) return;
          console.error('Error polling job status:', error);
          setMessage('Connection issue, retrying...');
        }
      }, 3000);
    }, 3000);

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [jobId, onDone, delayMs]);

  if (noSpeech) {
    return (
      <main className="min-h-screen grid place-items-center px-6 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-xl w-full text-center space-y-8">
          <h1 className="text-4xl font-bold tracking-tight mb-12">
            TechVibe: Review Summaries
          </h1>

          <div className="relative">
            <div className="mx-auto h-20 w-20 rounded-full bg-amber-500/10 grid place-items-center">
              <svg
                className="h-10 w-10 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight text-amber-500">
              No speech detected
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              The video you provided does not contain any spoken content or subtitles we can analyze.
            </p>
          </div>

          <div className="pt-4">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Your request ID
              </span>
              <span className="text-sm font-mono text-foreground">
                {jobId.slice(0, 8)}...
              </span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen grid place-items-center px-6 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-xl w-full text-center space-y-8">
          <h1 className="text-4xl font-bold tracking-tight mb-12">
            TechVibe: Review Summaries
          </h1>

          <div className="relative">
            <div className="mx-auto h-20 w-20 rounded-full bg-destructive/10 grid place-items-center">
              <svg
                className="h-10 w-10 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight text-destructive">
              Processing failed
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              {error}
            </p>
          </div>

          <div className="pt-4">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
              <div className="h-2 w-2 rounded-full bg-destructive" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Your request ID
              </span>
              <span className="text-sm font-mono text-foreground">
                {jobId.slice(0, 8)}...
              </span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen grid place-items-center px-6 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-xl w-full text-center space-y-8">
        <h1 className="text-4xl font-bold tracking-tight mb-12">
          TechVibe: Review Summaries
        </h1>

        <div className="relative">
          <div
            className="mx-auto h-20 w-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin"
            role="status"
            aria-label="Loading"
          />
          <div className="absolute inset-0 mx-auto h-20 w-20 rounded-full bg-primary/5 blur-xl" />
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-semibold tracking-tight">
            Aggregating reviews
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            {message}
          </p>
        </div>

        <div className="pt-4">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Your request ID
            </span>
            <span className="text-sm font-mono text-foreground">
              {jobId.slice(0, 8)}...
            </span>
          </div>
        </div>
      </div>
    </main>
  );
};
