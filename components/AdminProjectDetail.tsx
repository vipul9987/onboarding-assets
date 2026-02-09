import React, { useEffect, useState } from 'react';
import { FORM_SECTIONS } from '../constants';
import { Answer, Responsibility } from '../types';

export const AdminProjectDetailWrapper = ({ projectId, onBack }: { projectId: string, onBack: () => void }) => {
    return <ProjectDetailView projectId={projectId} onBack={onBack} />;
};

const ProjectDetailView = ({ projectId, onBack }: { projectId: string, onBack: () => void }) => {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showRaw, setShowRaw] = useState(false);
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        fetch(`http://localhost:5000/api/onboarding/${projectId}`)
            .then(res => {
                if(!res.ok) throw new Error("Backend down");
                return res.json();
            })
            .then(data => {
                setSession(data);
                setLoading(false);
            })
            .catch(() => {
                // Fallback Mock Data Generator
                setIsOffline(true);
                const isLocked = projectId === 'WEB-2024-002';
                const mockSession = {
                    project: {
                        _id: projectId,
                        name: projectId === 'WEB-2024-002' ? 'Urban Coffee Landing' : 'Nexus Main E-com',
                        client: { name: projectId === 'WEB-2024-002' ? 'Urban Coffee Co.' : 'Nexus Innovations' },
                        platform: 'Shopify',
                        tier: 'Standard'
                    },
                    isLocked: isLocked,
                    answers: [
                        { fieldId: 'website_type', value: 'Landing Page', responsibility: 'CLIENT' },
                        { fieldId: 'has_domain', value: true, responsibility: 'CLIENT' },
                        { fieldId: 'domain_name', value: 'urbancoffee.co', responsibility: 'CLIENT' },
                        { fieldId: 'needs_booking', value: false, responsibility: 'NA' },
                        { fieldId: 'logo_status', value: 'Agency to create', responsibility: 'AGENCY' }
                    ]
                };
                setTimeout(() => {
                    setSession(mockSession);
                    setLoading(false);
                }, 500);
            });
    }, [projectId]);

    if (loading || !session) return <div className="p-8 text-brand-accent animate-pulse">Loading Project Data...</div>;

    const getAnswer = (fieldId: string) => {
        return session.answers?.find((a: any) => a.fieldId === fieldId);
    };

    return (
        <div className="min-h-screen bg-brand-dark flex flex-col">
            {/* Header */}
            <header className="h-20 border-b border-brand-border bg-brand-surface/50 backdrop-blur-md sticky top-0 z-50 px-8 flex items-center justify-between">
                <div className="flex items-center">
                    <button onClick={onBack} className="mr-6 p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400">
                        ←
                    </button>
                    <div>
                        <div className="flex items-center space-x-2">
                             <h1 className="text-xl font-bold text-white font-display">{session.project?.client?.name || 'Client'}</h1>
                             {isOffline && <span className="text-[9px] bg-red-900/40 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20">OFFLINE VIEW</span>}
                        </div>
                        <div className="text-xs text-brand-accent font-mono">{session.project?.name} • {session.isLocked ? 'LOCKED' : 'DRAFT'}</div>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <button 
                        onClick={() => setShowRaw(!showRaw)}
                        className={`px-4 py-2 text-xs font-bold border rounded transition-colors ${showRaw ? 'bg-white text-black border-white' : 'bg-transparent text-slate-400 border-brand-border hover:text-white'}`}
                    >
                        {showRaw ? 'VIEW UI' : 'VIEW RAW JSON'}
                    </button>
                    <button className="px-4 py-2 text-xs font-bold bg-brand-accent text-brand-dark rounded hover:bg-white transition-colors">
                        EXPORT PDF
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full">
                {showRaw ? (
                    <div className="animate-fade-in bg-black rounded-lg border border-brand-border p-6 overflow-x-auto shadow-2xl">
                        <div className="text-xs text-slate-500 font-mono mb-2 uppercase tracking-widest border-b border-brand-border pb-2">Backend Response Object {isOffline ? '(Generated locally)' : ''}</div>
                        <pre className="text-xs font-mono text-green-400 leading-relaxed">
                            {JSON.stringify(session, null, 2)}
                        </pre>
                    </div>
                ) : (
                    <>
                        {FORM_SECTIONS.map((section, idx) => {
                            // Simple logic to show active sections even if mock data is sparse
                            const hasAnswers = section.fields.some(f => getAnswer(f.id));
                            if (!hasAnswers && isOffline) return null; // In offline detail view, hide empty sections

                            return (
                                <div key={section.id} className="mb-12 animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                                    <h2 className="text-2xl font-bold text-white mb-2 border-b border-brand-border pb-2 flex items-center">
                                        <span className="text-brand-accent mr-3 opacity-50 text-lg">0{idx + 1}</span>
                                        {section.title}
                                    </h2>
                                    <p className="text-slate-500 text-sm mb-6">{section.description}</p>

                                    <div className="grid gap-4">
                                        {section.fields.map(field => {
                                            const answer = getAnswer(field.id);
                                            if (!answer) return null; 

                                            return (
                                                <div key={field.id} className="bg-brand-surface border border-brand-border p-4 rounded-lg flex flex-col md:flex-row md:items-start justify-between">
                                                    <div className="mb-2 md:mb-0 md:mr-4 flex-1">
                                                        <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">{field.label}</div>
                                                        <div className="text-slate-200 text-sm font-light">
                                                            {field.type === 'boolean' 
                                                                ? (answer.value ? 'YES' : 'NO') 
                                                                : (answer.value || '-')
                                                            }
                                                        </div>
                                                    </div>

                                                    <div className="shrink-0 mt-2 md:mt-0">
                                                        {answer.responsibility === Responsibility.AGENCY && (
                                                            <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded text-[10px] font-bold font-mono">
                                                                AGENCY SCOPE
                                                            </span>
                                                        )}
                                                        {answer.responsibility === Responsibility.CLIENT && (
                                                            <span className="px-2 py-1 bg-slate-800 text-slate-500 border border-slate-700 rounded text-[10px] font-bold font-mono">
                                                                CLIENT PROVIDED
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                        {isOffline && (
                             <div className="text-center p-8 border border-dashed border-brand-border rounded-lg text-slate-500 text-sm">
                                Backend is unreachable. Partial mock data shown.
                             </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};