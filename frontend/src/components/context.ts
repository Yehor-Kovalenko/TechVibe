import * as rxjs from 'rxjs';

export type View = 'landing' | 'loading' | 'dashboard';

const getInitialJobs = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem('jobs') || '[]');
  } catch (e) {
    console.error('Failed to parse jobs from localStorage:', e);
    return [];
  }
};

export const jobId$ = new rxjs.BehaviorSubject<string>(
  sessionStorage.getItem('jobId') || ''
);
export const view$ = new rxjs.BehaviorSubject<View>(
  (sessionStorage.getItem('view') || 'landing') as View
);

export const jobs$ = new rxjs.BehaviorSubject<string[]>(getInitialJobs());
