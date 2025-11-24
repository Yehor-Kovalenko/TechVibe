import { jobId$ } from '../context';
import { useBehaviorSubjectState } from './useBehaviorSubjectState.ts';
import { useEffect } from 'react';
import { useJobs } from './useJobs';

export const useJob = () => {
  const [jobId, setJobId] = useBehaviorSubjectState<string>(jobId$);
  const { addJob } = useJobs();

  useEffect(() => {
    if (jobId) {
      sessionStorage.setItem('jobId', jobId);
      addJob(jobId);
    }
  }, [addJob, jobId]);

  return { jobId, setJobId };
};
