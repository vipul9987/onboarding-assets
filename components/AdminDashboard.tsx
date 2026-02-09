import React, { useEffect, useState } from 'react';
import { AdminProjectSummary } from '../types';

interface Props {
  onSelectProject: (projectId: string) => void;
}

// Initial Mock Data
const DEFAULT_MOCK_PROJECTS: AdminProjectSummary[] = [
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
    }
];

export const AdminDashboard: React.FC<Props> = ({ onSelectProject }) => {
  const [projects, setProjects] = useState<AdminProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [newProject, setNewProject] = useState({
    clientName: '',
    projectName: '',
    platform: 'WordPress',
    tier: 'Standard'
  });

  const loadProjects = async () => {
      setLoading(true);
      try {
          const res = await fetch('http://localhost:5000/api/admin/projects');
          if (!res.ok) throw new Error("Backend Error");
          const data = await res.json();
          setProjects(data);
          setIsOffline(false);
      } catch (err) {
          console.warn('Backend unavailable, utilizing Browser Storage (Demo Mode).');
          setIsOffline(true);
          
          // Load from LocalStorage "DB" or default
          const stored = localStorage.getItem('scopelock_db_projects');
          if (stored) {
              setProjects(JSON.parse(stored));
          } else {
              setProjects(DEFAULT_MOCK_PROJECTS);
              localStorage.setItem('scopelock_db_projects', JSON.stringify(DEFAULT_MOCK_PROJECTS));
          }
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async () => {
      if(!newProject.clientName || !newProject.projectName) return;

      const payload = {
          name: newProject.projectName,
          clientName: newProject.clientName,
          platform: newProject.platform,
          tier: newProject.tier,
          websiteType: 'Business' // Default for simplified creation
      };

      try {
          if (isOffline) throw new Error("Offline");

          const res = await fetch('http://localhost:5000/api/admin/projects', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error("Creation Failed");
          
          await loadProjects();
          setShowCreateModal(false);
      } catch (err) {
          // Offline Fallback
          const newId = `WEB-2024-${Math.floor(Math.random() * 1000)}`;
          const mockProject: AdminProjectSummary = {
              _id: newId,
              name: payload.name,
              clientName: payload.clientName,
              platform: payload.platform,
              tier: payload.tier,
              status: 'ONBOARDING',
              isLocked: false,
              progress: 0
          };

          const updatedProjects = [...projects, mockProject];
          setProjects(updatedProjects);
          localStorage.setItem('scopelock_db_projects', JSON.stringify(updatedProjects));
          
          // Also initialize the empty session in our mock DB
          const currentSessions = JSON.parse(localStorage.getItem('scopelock_db_sessions') || '{}');
          currentSessions[newId] = {
              project: { ...mockProject, client: { name: payload.clientName } }, // Store full context
              answers: [],
              isLocked: false
          };
          localStorage.setItem('scopelock_db_sessions', JSON.stringify(currentSessions));

          setShowCreateModal(false);
          setNewProject({ clientName: '', projectName: '', platform: 'WordPress', tier: 'Standard' });
      }
  };

  const handleSeed = async () => {
    setLoading(true);
    try {
        await fetch('http://localhost:5000/api/seed');
        window.location.reload();
    } catch (e) {
        setTimeout(() => {
            localStorage.removeItem('scopelock_db_projects');
            localStorage.removeItem('scopelock_db_sessions');
            loadProjects(); // Will reload defaults
        }, 500);
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
    <div className="min-h-screen bg-brand-dark p-8 relative">
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
                Reset DB
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

        {/* Create New Project Button */}
        <div 
            onClick={() => setShowCreateModal(true)}
            className="border border-dashed border-brand-border rounded-xl p-6 flex flex-col items-center justify-center text-slate-600 hover:text-brand-accent hover:border-brand-accent/50 hover:bg-brand-surface/30 transition-all cursor-pointer min-h-[250px] group"
        >
            <div className="w-12 h-12 rounded-full border border-brand-border flex items-center justify-center mb-4 group-hover:border-brand-accent group-hover:bg-brand-accent/10 transition-all">
                <span className="text-2xl font-light">+</span>
            </div>
            <span className="text-sm font-medium">Create New Project</span>
        </div>
      </div>

      {/* CREATE PROJECT MODAL */}
      {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
              <div className="bg-brand-surface border border-brand-border p-8 rounded-xl w-full max-w-md shadow-2xl relative">
                  <h2 className="text-xl font-bold text-white mb-6">Initialize New Project</h2>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="text-xs uppercase text-slate-500 font-bold block mb-1">Client Name</label>
                          <input 
                            type="text" 
                            className="w-full bg-brand-dark border border-brand-border rounded p-2 text-white focus:border-brand-accent outline-none"
                            placeholder="e.g. Acme Corp"
                            value={newProject.clientName}
                            onChange={(e) => setNewProject({...newProject, clientName: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="text-xs uppercase text-slate-500 font-bold block mb-1">Project Name</label>
                          <input 
                            type="text" 
                            className="w-full bg-brand-dark border border-brand-border rounded p-2 text-white focus:border-brand-accent outline-none"
                            placeholder="e.g. Main Website Redesign"
                            value={newProject.projectName}
                            onChange={(e) => setNewProject({...newProject, projectName: e.target.value})}
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs uppercase text-slate-500 font-bold block mb-1">Platform</label>
                            <select 
                                className="w-full bg-brand-dark border border-brand-border rounded p-2 text-white outline-none"
                                value={newProject.platform}
                                onChange={(e) => setNewProject({...newProject, platform: e.target.value})}
                            >
                                <option>WordPress</option>
                                <option>Shopify</option>
                                <option>Webflow</option>
                                <option>Custom</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs uppercase text-slate-500 font-bold block mb-1">Tier</label>
                            <select 
                                className="w-full bg-brand-dark border border-brand-border rounded p-2 text-white outline-none"
                                value={newProject.tier}
                                onChange={(e) => setNewProject({...newProject, tier: e.target.value})}
                            >
                                <option>Basic</option>
                                <option>Standard</option>
                                <option>Custom</option>
                            </select>
                          </div>
                      </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-8">
                      <button 
                        onClick={() => setShowCreateModal(false)}
                        className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={handleCreate}
                        disabled={!newProject.clientName || !newProject.projectName}
                        className="px-6 py-2 bg-brand-accent text-brand-dark font-bold text-sm rounded hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          Create Project
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};