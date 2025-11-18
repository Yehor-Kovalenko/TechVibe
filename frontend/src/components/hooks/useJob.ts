import { jobId$ } from '../context.ts';
import { useBehaviorSubjectState } from './useBehaviourSubjectState.ts';
import { useEffect } from 'react';

export const useJob = () => {
  const [jobId, setJobId] = useBehaviorSubjectState(jobId$);

  useEffect(() => {
    sessionStorage.setItem('jobId', jobId);
  }, [jobId]);

  return { jobId, setJobId };
};
