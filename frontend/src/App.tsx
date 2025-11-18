import { useEffect, useState } from 'react';
import './globals.css';
import { LandingPage } from './components/LandingPage';
import { LoadingPage } from './components/LoadingPage';
import { Dashboard } from './components/Dashboard';
import { defaultDashboardConfig } from './config/dashboard.config';
import { getBackendData } from './components/fetchApiUrl.ts';
import { jobId$ } from './components/context.ts';
import { useBehaviorSubjectState } from './components/hooks/useBehaviourSubjectState.ts';

type View = 'landing' | 'loading' | 'dashboard';

export const App = () => {
  const [jobId, setJobId] = useBehaviorSubjectState<string>(jobId$);

  const [view, setView] = useState<View>(() => {
    const storedJobId = sessionStorage.getItem('jobId');
    const storedView = sessionStorage.getItem('view') as View | null;
    if (storedJobId && storedView) {
      return storedView;
    }
    return 'landing';
  });

  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [backendData, setBackendData] = useState(defaultDashboardConfig);

  useEffect(() => {
    if (jobId) {
      sessionStorage.setItem('jobId', jobId);
    }
  }, [jobId]);

  useEffect(() => {
    sessionStorage.setItem('view', view);
  }, [view]);

  useEffect(() => {
    if (!isLoaded || !jobId) return;

    getBackendData(jobId).then((data) => {
      setBackendData({ ...defaultDashboardConfig, ...data });
      console.log('Dashboard data loaded:', data);
      setView('dashboard');
    });
  }, [isLoaded, jobId]);

  const handleGenerate = (id: string) => {
    setJobId(id);
    setView('loading');

    const existingJobs = localStorage.getItem('jobs');
    const jobs: string[] = existingJobs ? JSON.parse(existingJobs) : [];

    if (!jobs.includes(id)) {
      jobs.push(id);
      localStorage.setItem('jobs', JSON.stringify(jobs));
    }
  };

  if (view === 'loading') {
    return (
      <LoadingPage
        jobId={jobId}
        delayMs={600_000}
        onDone={() => setIsLoaded(true)}
      />
    );
  } else if (view === 'dashboard') {
    return <Dashboard config={backendData} />;
  } else {
    return <LandingPage onSubmit={handleGenerate} />;
  }
};
