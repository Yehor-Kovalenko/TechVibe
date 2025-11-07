import {useEffect, useState} from 'react';
import './globals.css';
import LandingPage from './components/LandingPage';
import LoadingPage from './components/LoadingPage';
import Dashboard from './components/Dashboard';
import { defaultDashboardConfig } from './config/dashboard.config';
import {getBackendData} from "./components/fetchApiUrl.ts";

type View = 'landing' | 'loading' | 'dashboard';

function App() {
  const [view, setView] = useState<View>('landing');
  const [jobId, setJobId] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [backendData, setBackendData] = useState(defaultDashboardConfig);

  useEffect(() => {
    if (!isLoaded || !jobId) return;

    getBackendData(jobId).then((data) => {
      setBackendData({...defaultDashboardConfig, ...data});
      console.log(data);
      console.log(backendData);
      setView("dashboard");
    });
  }, [isLoaded, jobId]);
  const handleGenerate = (id: string) => {
    setJobId(id);
    setView('loading');
  };

  if (view === 'loading') {
    return <LoadingPage jobId={jobId} delayMs={10_000} onDone={() => setIsLoaded(true)} />;
  }
  if (view === 'dashboard') {
    // load dashboard config (summary)
    return <Dashboard config={backendData} />;
  }
  return <LandingPage onSubmit={handleGenerate} />;
}

export default App;