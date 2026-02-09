import React from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { Responsibility, Answer } from '../types';
import { FORM_SECTIONS } from '../constants';

export const SummaryReview = () => {
  const { data, context, getMissingFields, submitForm, isSubmitting } = useOnboarding();
  const missing = getMissingFields();
  const delegatedItems = Object.entries(data).filter(([_, val]: [string, Answer]) => val.responsibility === Responsibility.AGENCY);

  return (
    <div className="max-w-3xl mx-auto py-8 animate-fade-in">
      <div className="bg-brand-surface border border-brand-border rounded-xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Final Review & Scope Lock</h2>
            <div className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-mono border border-yellow-500/20">
              ACTION REQUIRED
            </div>
        </div>

        <p className="text-slate-400 mb-8 leading-relaxed">
          You are about to lock the requirements for <strong>{context.clientName}</strong>. 
          Please review the auto-generated summary below.
        </p>

        {/* Dynamic Warning Section */}
        {missing.length > 0 ? (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <h3 className="text-red-400 font-semibold mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Missing Requirements ({missing.length})
            </h3>
            <ul className="list-disc list-inside text-sm text-red-300">
              {missing.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
            <p className="mt-4 text-xs text-red-400 font-bold uppercase tracking-wide">Submission Disabled until resolved.</p>
          </div>
        ) : (
          <div className="bg-brand-accent/10 border border-brand-accent/20 rounded-lg p-4 mb-6 flex items-center shadow-[0_0_15px_rgba(74,222,128,0.1)]">
             <svg className="w-6 h-6 text-brand-accent mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
             </svg>
             <span className="text-brand-accent text-sm font-medium tracking-wide">All Requirements Met. Ready to Lock.</span>
          </div>
        )}

        {/* Delegation Summary */}
        <div className="mb-8">
          <h3 className="text-slate-300 font-semibold mb-4 border-b border-brand-border pb-2">Scope Delegation Summary</h3>
          {delegatedItems.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No items delegated to agency. Standard scope applies.</p>
          ) : (
            <div className="space-y-2">
              {delegatedItems.map(([key, val]) => {
                // Find label
                let label = key;
                FORM_SECTIONS.forEach(s => s.fields.forEach(f => { if(f.id === key) label = f.label }));
                return (
                  <div key={key} className="flex justify-between items-center text-sm p-2 bg-brand-dark rounded border border-brand-border">
                    <span className="text-slate-300">{label}</span>
                    <span className="text-yellow-500 text-xs font-mono px-2">AGENCY</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Lock Action */}
        <div className="flex flex-col items-center pt-4 border-t border-brand-border">
          <div className="mb-4 text-center">
             <label className="flex items-start justify-center space-x-3 text-slate-300 cursor-pointer group">
               <input type="checkbox" className="mt-1 w-4 h-4 rounded border-slate-600 text-primary-600 focus:ring-primary-500 bg-brand-dark cursor-pointer" id="final_confirm" />
               <span className="text-sm max-w-md text-left group-hover:text-white transition-colors">
                 I confirm this information is complete. Any change after submission is a revision and may affect cost or timeline.
               </span>
             </label>
          </div>

          <button
            onClick={() => {
                const cb = document.getElementById('final_confirm') as HTMLInputElement;
                if(cb?.checked) submitForm();
                else alert("You must confirm that changes after submission are billable revisions.");
            }}
            disabled={missing.length > 0 || isSubmitting}
            className={`w-full py-4 rounded-lg font-bold text-lg tracking-wide transition-all shadow-lg flex items-center justify-center
              ${missing.length > 0 
                ? 'bg-brand-surface text-slate-500 cursor-not-allowed border border-brand-border' 
                : 'bg-brand-accent hover:bg-white hover:text-brand-dark text-brand-dark shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:shadow-[0_0_30px_rgba(74,222,128,0.5)] hover:-translate-y-0.5'
              }
            `}
          >
            {isSubmitting ? 'Locking Scope...' : (
              <>
                LOCK SCOPE & SUBMIT
                {!isSubmitting && missing.length === 0 && (
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
              </>
            )}
          </button>
          <p className="mt-3 text-xs text-slate-500 text-center uppercase tracking-widest font-bold">
            Form locks immediately after submission
          </p>
        </div>
      </div>
    </div>
  );
};