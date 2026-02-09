import React, { useState, useEffect } from 'react';
import { OnboardingLayout } from './components/OnboardingLayout';
import { OnboardingProvider } from './context/OnboardingContext';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminProjectDetailWrapper } from './components/AdminProjectDetail';

// Simple Router Hook
const useRouter = () => {
  const [route, setRoute] = useState(window.location.hash || '#/');
  
  useEffect(() => {
    const handler = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  return route;
};

export default function App() {
  const route = useRouter();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // --- ROUTING LOGIC ---
  
  // 1. Admin Dashboard Route
  if (route.startsWith('#/admin')) {
    if (selectedProjectId) {
        return (
            <AdminProjectDetailWrapper 
                projectId={selectedProjectId} 
                onBack={() => setSelectedProjectId(null)} 
            />
        );
    }
    return <AdminDashboard onSelectProject={setSelectedProjectId} />;
  }

  // 2. Specific Project Form Route (e.g., #/project/WEB-123)
  let activeProjectId = undefined;
  if (route.startsWith('#/project/')) {
      activeProjectId = route.replace('#/project/', '');
  }

  // 3. Client Form Route (Default)
  return (
    <OnboardingProvider projectId={activeProjectId}>
      <div className="min-h-screen bg-brand-dark text-slate-100 selection:bg-brand-accent selection:text-brand-dark overflow-hidden relative">
        {/* Background Ambient Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-secondary/30 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-accent/5 rounded-full blur-[120px] pointer-events-none" />
        
        <OnboardingLayout />

        {/* Agency Portal Button */}
        <div className="fixed top-6 right-6 z-50">
            <a href="#/admin" className="flex items-center space-x-2 px-4 py-2 bg-black/60 backdrop-blur-md border border-brand-border rounded-full hover:border-brand-accent hover:text-brand-accent transition-all group shadow-lg">
                <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></div>
                <span className="text-xs font-bold font-mono text-slate-300 group-hover:text-white uppercase tracking-wider">
                   Agency Portal
                </span>
            </a>
        </div>
      </div>
    </OnboardingProvider>
  );
}