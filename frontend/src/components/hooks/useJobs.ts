import { useBehaviorSubjectState } from './useBehaviorSubjectState.ts';
import { jobs$ } from '../context';
import { useCallback } from 'react';

export const useJobs = () => {
  const [jobs] = useBehaviorSubjectState(jobs$);

  const addJob = useCallback(
    (jobId: string) => {
      if (!jobs.includes(jobId)) {
        const updatedJobs = [jobId, ...jobs];
        jobs$.next(updatedJobs);
        localStorage.setItem('jobs', JSON.stringify(updatedJobs));
      }
    },
    [jobs]
  );

  return { jobs, addJob };
};
