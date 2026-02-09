import React from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { FORM_SECTIONS } from '../constants';
import { DecisionField } from './DecisionField';
import { SummaryReview } from './SummaryReview';

export const OnboardingLayout = () => {
  const { currentStep, nextStep, prevStep, context, isLocked, data } = useOnboarding();
  const currentSection = FORM_SECTIONS[currentStep];

  // Success Screen
  if (currentStep > FORM_SECTIONS.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-brand-dark p-4 text-center animate-fade-in overflow-hidden z-10 relative">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(74,222,128,0.3)] bg-gradient-to-br from-brand-accent/20 to-brand-secondary/20 border border-brand-accent/50">
          <svg className="w-10 h-10 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4 font-display tracking-tight neon-text">Onboarding Locked</h1>
        <p className="text-slate-400 max-w-md text-lg font-light">
          Your project brief has been securely generated. <br/>
          <span className="text-brand-accent font-medium">Our team is analyzing the scope.</span>
        </p>
      </div>
    );
  }

  // Calculate progress percentage
  const totalSteps = FORM_SECTIONS.length + 1;
  const progressPercent = Math.min(100, ((currentStep + 1) / totalSteps) * 100);

  // Summary Screen
  if (currentStep === FORM_SECTIONS.length) {
    return (
      <div className="h-screen flex flex-col bg-transparent overflow-hidden relative z-10">
        <div className="h-1 w-full bg-brand-border/30 shrink-0">
          <div 
            className="h-full bg-brand-accent shadow-[0_0_15px_rgba(74,222,128,0.8)] transition-all duration-700 ease-in-out"
            style={{ width: '100%' }}
          />
        </div>

        <header className="h-20 border-b border-brand-border flex items-center px-8 bg-brand-dark/50 backdrop-blur-md shrink-0 z-20">
          <div className="font-display font-bold text-2xl tracking-tight text-white mr-4">ScopeLock</div>
          <div className="text-sm text-slate-400 border-l border-brand-border pl-4 font-light">{context.clientName}</div>
        </header>
        
        <main className="flex-1 overflow-y-auto pt-8 px-4 pb-12 relative z-10 scroll-smooth">
           <button onClick={prevStep} className="mb-6 text-slate-400 hover:text-brand-accent flex items-center text-sm font-medium mx-auto max-w-3xl w-full transition-colors group">
             <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
             </svg>
             Back to Edit
           </button>
           <SummaryReview />
        </main>
      </div>
    );
  }

  // Get dynamic website type, Platform, and Tier from form data
  const activeWebsiteType = data['website_type']?.value || context.websiteType;
  const activePlatform = data['project_platform']?.value || context.platform;
  const activeTier = data['project_tier']?.value || context.tier;

  // Main Edit Screen
  return (
    <div className="flex h-screen w-full bg-transparent overflow-hidden relative z-10">
      {/* Sidebar - Flex Item */}
      <aside className="hidden lg:flex flex-col w-80 border-r border-brand-border bg-brand-surface/50 backdrop-blur-xl shrink-0 z-30">
        <div className="h-20 flex items-center px-8 border-b border-brand-border shrink-0">
          <span className="font-display font-bold text-2xl tracking-tight text-white">ScopeLock</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-8 px-6 space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6 px-2">Progress</div>
          {FORM_SECTIONS.map((section, idx) => {
             // Pass context to condition
             if (section.condition && !section.condition(data, context)) return null;
             
             const isActive = idx === currentStep;
             const isCompleted = idx < currentStep;
             
             return (
               <div 
                 key={section.id} 
                 className={`flex items-center px-4 py-3 rounded-xl text-sm transition-all duration-300 mb-1
                   ${isActive ? 'bg-brand-accent/10 text-brand-accent border border-brand-accent/20 shadow-[0_0_15px_rgba(74,222,128,0.1)]' : 'border border-transparent hover:bg-white/5'}
                   ${isCompleted ? 'text-slate-400' : ''}
                   ${!isActive && !isCompleted ? 'text-slate-500' : ''}
                 `}
               >
                 <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold mr-3 transition-colors
                    ${isActive ? 'bg-brand-accent text-brand-dark shadow-[0_0_10px_rgba(74,222,128,0.5)]' : ''}
                    ${isCompleted ? 'bg-brand-border text-slate-500' : ''}
                    ${!isActive && !isCompleted ? 'bg-brand-surface text-slate-600' : ''}
                 `}>
                   {isCompleted ? '✓' : idx + 1}
                 </div>
                 <span className={isActive ? 'font-medium' : 'font-light'}>{section.title}</span>
               </div>
             )
          })}
        </div>

        {/* Dynamic Context - Visual Update */}
        <div className="p-6 border-t border-brand-border shrink-0 bg-brand-surface">
          <div className="pt-0">
            <div className="text-[10px] text-slate-500 mb-2 uppercase tracking-wider font-bold">Project Context</div>
            <div className="bg-brand-dark rounded-lg p-3 border border-brand-border backdrop-blur-sm">
                <div className="text-sm font-display font-semibold text-white mb-1 transition-all">{activeWebsiteType}</div>
                <div className="text-xs text-brand-accent/80 font-mono">{activePlatform} • {activeTier}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Column */}
      <main className="flex-1 flex flex-col min-w-0 relative z-0">
        {/* Dynamic Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] z-50 bg-brand-border/30">
          <div 
            className="h-full bg-brand-accent shadow-[0_0_15px_rgba(74,222,128,1)] transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden h-16 border-b border-brand-border flex items-center px-4 justify-between bg-brand-dark shrink-0 z-40 backdrop-blur-md bg-opacity-80">
           <div className="flex flex-col">
              <span className="font-display font-bold text-lg text-white">ScopeLock</span>
           </div>
           <span className="text-xs font-mono text-slate-400">Step {currentStep + 1}/{FORM_SECTIONS.length}</span>
        </div>

        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto scroll-smooth">
            <div className="max-w-3xl w-full mx-auto p-6 md:p-12 pt-12 lg:pt-20 pb-12">
              <div className="mb-10 animate-fade-in-up">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 tracking-tight drop-shadow-xl">{currentSection.title}</h1>
                <p className="text-slate-400 text-lg leading-relaxed font-light border-l-2 border-brand-accent/30 pl-4">{currentSection.description}</p>
              </div>

              <div className="space-y-6">
                {currentSection.fields.map(field => {
                    // Pass context to condition
                    if (field.condition && !field.condition(data, context)) return null;
                    return <DecisionField key={field.id} field={field} />;
                })}
              </div>
            </div>
        </div>

        {/* Footer Navigation */}
        <div className="shrink-0 bg-brand-dark/80 backdrop-blur-md border-t border-brand-border p-6 z-40">
          <div className="max-w-3xl mx-auto flex justify-between items-center group">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-6 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-0 disabled:pointer-events-none transition-all flex items-center"
            >
              <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Previous
            </button>
            <button
              onClick={nextStep}
              className="px-10 py-3 bg-brand-accent hover:bg-white hover:text-brand-dark text-brand-dark rounded-lg text-sm font-bold shadow-[0_0_20px_rgba(74,222,128,0.4)] hover:shadow-[0_0_30px_rgba(74,222,128,0.6)] transition-all hover:-translate-y-0.5 active:translate-y-0 font-display tracking-wide flex items-center group/btn"
            >
              Next Step
              <svg className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};