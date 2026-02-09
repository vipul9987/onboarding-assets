import React, { useEffect, useState } from 'react';
import { AdminProjectSummary } from '../types';

interface Props {
  onSelectProject: (projectId: string) => void;
}

// Mock Data for Demo Mode (when backend is offline)
const MOCK_PROJECTS: AdminProjectSummary[] = [
    {
        _id: 'WEB-2024-001',
        name: 'Nexus Main E-com',
        clientName: 'Nexus Innovations',
        platform: 'Shopify',
        tier: 'Standard',
        status: 'ONBOARDING',
        isLocked: false,
        progress: 65
    },
    {
        _id: 'WEB-2024-002',
        name: 'Urban Coffee Landing',
        clientName: 'Urban Coffee Co.',
        platform: 'Webflow',
        tier: 'Basic',
        status: 'ACTIVE',
        isLocked: true,
        lockedAt: '2023-11-15T10:00:00Z',
        progress: 100
    },
    {
        _id: 'WEB-2024-003',
        name: 'FinTech Corporate Portal',
        clientName: 'FinTech Global',
        platform: 'Custom',
        tier: 'Custom',
        status: 'ONBOARDING',
        isLocked: false,
        progress: 12
    }
];

export const AdminDashboard: React.FC<Props> = ({ onSelectProject }) => {
  const [projects, setProjects] = useState<AdminProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/projects')
      .then(res => {
          if(!res.ok) throw new Error("Backend Error");
          return res.json();
      })
      .then(data => {
        setProjects(data);
        setLoading(false);
      })
      .catch(err => {
        console.warn('Backend unavailable, switching to Demo Mode.', err);
        setProjects(MOCK_PROJECTS);
        setIsOffline(true);
        setLoading(false);
      });
  }, []);

  const handleSeed = async () => {
    setLoading(true);
    try {
        await fetch('http://localhost:5000/api/seed');
        window.location.reload();
    } catch (e) {
        // Simulate seed in offline mode
        setTimeout(() => {
            setProjects(MOCK_PROJECTS);
            setLoading(false);
            alert("Backend offline: Demo data reset.");
        }, 800);
    }
  };

  const openClientForm = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    window.location.hash = `#/project/${projectId}`;
  };

  if (loading) {
    return (
        <div className="flex h-screen items-center justify-center bg-brand-dark text-brand-accent animate-pulse">
            Loading Command Center...
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark p-8">
      <header className="flex justify-between items-center mb-12 border-b border-brand-border pb-6">
        <div>
            <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-display font-bold text-white tracking-tight">Agency Command Center</h1>
                {isOffline && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-900/30 text-red-400 border border-red-500/30 uppercase tracking-wide">
                        Offline / Demo Mode
                    </span>
                )}
            </div>
            <p className="text-slate-400 font-light mt-1">Manage all client onboarding pipelines from one place.</p>
        </div>
        <div className="flex space-x-4">
            <a href="#/" className="px-4 py-2 text-xs font-mono text-slate-500 border border-brand-border rounded hover:text-white hover:border-white transition-colors flex items-center">
                ← Back to Demo
            </a>
            <button 
                onClick={handleSeed}
                className="px-4 py-2 text-xs font-mono text-slate-500 border border-brand-border rounded hover:text-white hover:border-white transition-colors"
            >
                Reset & Seed DB
            </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => (
            <div 
                key={proj._id} 
                onClick={() => onSelectProject(proj._id)}
                className="group relative bg-brand-surface border border-brand-border rounded-xl p-6 hover:border-brand-accent/50 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(74,222,128,0.1)] overflow-hidden"
            >
                {/* Status Indicator */}
                <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-wider border-l border-b
                    ${proj.isLocked 
                        ? 'bg-brand-accent text-brand-dark border-brand-accent' 
                        : 'bg-yellow-500/10 text-yellow-500 border-brand-border'
                    }
                `}>
                    {proj.isLocked ? 'LOCKED & ACTIVE' : 'IN PROGRESS'}
                </div>

                <div className="mb-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-brand-accent transition-colors mb-1">{proj.clientName}</h3>
                    <div className="text-sm text-slate-400">{proj.name}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                    <div>
                        <div className="text-[10px] uppercase text-slate-600 font-bold mb-1">Platform</div>
                        <div className="text-slate-300 font-mono">{proj.platform}</div>
                    </div>
                    <div>
                        <div className="text-[10px] uppercase text-slate-600 font-bold mb-1">Service Tier</div>
                        <div className="text-slate-300 font-mono">{proj.tier}</div>
                    </div>
                </div>

                <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden flex items-center">
                    <div 
                        className={`h-full ${proj.isLocked ? 'bg-brand-accent' : 'bg-yellow-500'}`} 
                        style={{ width: `${proj.isLocked ? 100 : proj.progress}%` }} 
                    />
                </div>
                
                <div className="flex justify-between mt-4 pt-4 border-t border-brand-border/50">
                     <button 
                        onClick={(e) => openClientForm(e, proj._id)}
                        className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-white flex items-center transition-colors"
                     >
                        Live Client View <span className="ml-1">↗</span>
                     </button>
                    <div className="text-[10px] text-slate-500 font-mono">
                        {proj.isLocked ? '100%' : `${Math.round(proj.progress)}%`}
                    </div>
                </div>
            </div>
        ))}

        {/* New Project Placeholder */}
        <div className="border border-dashed border-brand-border rounded-xl p-6 flex flex-col items-center justify-center text-slate-600 hover:text-slate-400 hover:border-slate-500 transition-colors cursor-pointer min-h-[250px]">
            <div className="text-4xl mb-4 font-light">+</div>
            <span className="text-sm font-medium">Create New Project Link</span>
        </div>
      </div>
    </div>
  );
};