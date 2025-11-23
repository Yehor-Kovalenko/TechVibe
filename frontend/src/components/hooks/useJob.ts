import { jobId$ } from '../context';
import { useBehaviorSubjectState } from './useBehaviourSubjectState';
import { useEffect } from 'react';

export const useJob = () => {
  const [jobId, setJobId] = useBehaviorSubjectState(jobId$);

  useEffect(() => {
    sessionStorage.setItem('jobId', jobId);
  }, [jobId]);

  return { jobId, setJobId };
};
