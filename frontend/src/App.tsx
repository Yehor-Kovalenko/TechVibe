import { useState } from 'react';
import './globals.css';
import LandingPage from './components/LandingPage';
import LoadingPage from './components/LoadingPage';
import Dashboard from './components/Dashboard';
import { defaultDashboardConfig } from './config/dashboard.config';

type View = 'landing' | 'loading' | 'dashboard';

function App() {
  const [view, setView] = useState<View>('landing');
  const [jobId, setJobId] = useState<string>('');

  // const handleGenerate = (id: string) => {
  //   setJobId(id);
  //   setView('loading');
  // };

  // if (view === 'loading') {
    // return <LoadingPage jobId={jobId} delayMs={10_000} onDone={() => setView('dashboard')} />;
  // }
  // if (view === 'dashboard') {
    return <Dashboard config={defaultDashboardConfig} />;
  // }
  // return <LandingPage onSubmit={handleGenerate} />;
}

export default App;