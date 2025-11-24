import { jobId$ } from '../context';
import { useBehaviorSubjectState } from './useBehaviourSubjectState';
import { useEffect } from 'react';
import { useJobs } from './useJobs';

export const useJob = () => {
  const [jobId, setJobId] = useBehaviorSubjectState(jobId$);
  const { addJob } = useJobs();

  useEffect(() => {
    sessionStorage.setItem('jobId', jobId);
    addJob(jobId);
  }, [addJob, jobId]);

  return { jobId, setJobId };
};
