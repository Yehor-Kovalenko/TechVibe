import { useEffect, useState } from 'react';
import './globals.css';
import { LandingPage } from './components/LandingPage';
import { LoadingPage } from './components/LoadingPage';
import { Dashboard } from './components/Dashboard';
import { defaultDashboardConfig } from './config/dashboard.config';
import { getBackendData } from './components/fetchApiUrl';
import { useJobs } from './components/hooks/useJobs';
import { useJob } from './components/hooks/useJob';
import { useView } from './components/hooks/useView';

export const App = () => {
  const { jobId, setJobId } = useJob();
  const { view, setView } = useView();
  const { addJob } = useJobs();

  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [backendData, setBackendData] = useState(defaultDashboardConfig);

  useEffect(() => {
    if (!isLoaded || !jobId) return;

    getBackendData(jobId).then((data) => {
      setBackendData({ ...defaultDashboardConfig, ...data });
      console.log('Dashboard data loaded:', data);
      setView('dashboard');
    });
  }, [isLoaded, jobId, setView]);

  const handleGenerate = (id: string) => {
    setJobId(id);
    setView('loading');
    addJob(id);
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
