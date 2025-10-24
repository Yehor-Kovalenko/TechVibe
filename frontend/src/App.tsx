import React, { useState, useEffect } from "react";
import logo from "@/assets/logo.svg";
import { Dashboard } from './components/Dashboard';
import { defaultDashboardConfig } from './config/dashboard.config';
import '@/globals.css';

function App() {
  return (
    <div className="App">
      <Dashboard config={defaultDashboardConfig} />
    </div>
  );
}

export default App;
