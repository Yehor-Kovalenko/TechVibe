import { useBehaviorSubjectState } from './useBehaviourSubjectState';
import { jobs$ } from '../context';

export const useJobs = () => {
  const [jobs] = useBehaviorSubjectState(jobs$);

  const addJob = (jobId: string) => {
    if (!jobs.includes(jobId)) {
      const updatedJobs = [jobId, ...jobs];
      jobs$.next(updatedJobs);
      localStorage.setItem('jobs', JSON.stringify(updatedJobs));
    }
  };

  return { jobs, addJob };
};
