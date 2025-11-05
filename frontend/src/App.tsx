import { useState } from 'react';
import './globals.css';
import LandingPage from './components/LandingPage';
import LoadingPage from './components/LoadingPage';
import Dashboard from './components/Dashboard';
import { defaultDashboardConfig } from './config/dashboard.config';
import {getJobSummary} from "./components/fetchApiUrl.ts";
import type {DashboardConfig} from "./types/widget.types.ts";

type View = 'landing' | 'loading' | 'dashboard';

function App() {
  const [view, setView] = useState<View>('landing');
  const [jobId, setJobId] = useState<string>('');

  const handleGenerate = (id: string) => {
    setJobId(id);
    setView('loading');
  };

  if (view === 'loading') {
    return <LoadingPage jobId={jobId} delayMs={10_000} onDone={() => setView('dashboard')} />;
  }
  if (view === 'dashboard') {
    // load dashboard config (summary)
    let backend_config = defaultDashboardConfig;
    getJobSummary(jobId).then((r) => {
      backend_config.summary = r;
    });
    return <Dashboard config={backend_config} />; //TODO set config from the backend
  }
  return <LandingPage onSubmit={handleGenerate} />;
}

export default App;