import React from 'react';
import { FieldDefinition, Responsibility, FieldType, Answer } from '../types';
import { useOnboarding } from '../context/OnboardingContext';

interface Props {
  field: FieldDefinition;
}

export const DecisionField: React.FC<Props> = ({ field }) => {
  const { data, setAnswer, isLocked, errors } = useOnboarding();
  const answer: Answer | undefined = data[field.id];
  const error = errors[field.id];
  
  const currentValue = answer?.value ?? '';
  const currentResp = answer?.responsibility ?? Responsibility.CLIENT; // Default to client

  const handleRespChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newResp = e.target.value as Responsibility;
    setAnswer(field.id, currentValue, newResp);
  };

  const handleValueChange = (val: any) => {
    setAnswer(field.id, val, currentResp);
  };

  const getContainerStyle = () => {
    const base = "mb-6 p-5 rounded-xl border transition-all duration-300 backdrop-blur-sm relative overflow-hidden group ";
    
    if (!answer) {
        // Only show red border if there is an explicit error (user tried to next)
        if (error) return base + "bg-red-900/10 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]";
        return base + "bg-brand-surface/50 border-brand-border hover:bg-brand-surface hover:border-brand-border/50";
    }
    if (field.contextLock) return base + "bg-brand-surface/30 border-brand-border opacity-70"; 
    
    // Status colors
    if (answer.responsibility === Responsibility.AGENCY) return base + "bg-yellow-900/10 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]";
    if (answer.responsibility === Responsibility.NA) return base + "bg-brand-surface/30 border-brand-border opacity-60 grayscale";
    
    // Error state takes precedence
    if (error) return base + "bg-red-900/10 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]";
    
    // Active/Valid state - Green Glow
    return base + "bg-brand-accent/[0.05] border-brand-accent/30 shadow-[0_0_10px_rgba(74,222,128,0.1)]";
  };

  const isValueDisabled = isLocked || currentResp === Responsibility.NA || currentResp === Responsibility.AGENCY;
  const isInputReadOnly = field.contextLock;

  // Common input classes
  const inputClasses = `w-full bg-black/40 border rounded-lg p-3 text-sm text-white focus:outline-none focus:ring-1 disabled:opacity-30 disabled:cursor-not-allowed placeholder-slate-600 transition-all font-light tracking-wide
    ${error 
        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
        : 'border-brand-border focus:border-brand-accent focus:ring-brand-accent hover:border-brand-border/80'
    }
  `;

  return (
    <div className={getContainerStyle()}>
      {/* Decorative gradient corner */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-brand-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="flex flex-col sm:flex-row justify-between mb-3 relative z-10">
        <label className={`text-sm font-medium mb-2 sm:mb-0 flex items-center font-display tracking-wide ${error ? 'text-red-400' : 'text-slate-200'}`}>
          {field.label} 
          {field.required && !field.contextLock && <span className="text-brand-accent ml-1 text-xs align-top">★</span>}
          {field.contextLock && (
             <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-surface text-slate-400 border border-brand-border uppercase tracking-wider">
               System
             </span>
          )}
        </label>
        
        {/* Responsibility Selector */}
        {!field.contextLock && (
          <div className="relative group/resp">
             <select
               disabled={isLocked || isInputReadOnly}
               value={currentResp}
               onChange={handleRespChange}
               className="bg-black/40 text-[11px] text-slate-300 border border-brand-border rounded px-2 py-1 pr-7 focus:border-brand-accent outline-none hover:bg-black/60 transition-colors cursor-pointer appearance-none text-right w-full min-w-[100px]"
             >
               <option value={Responsibility.CLIENT}>I'll do it</option>
               <option value={Responsibility.AGENCY}>Agency (+$$)</option>
               <option value={Responsibility.NA}>Skip / NA</option>
             </select>
             {/* Custom Dropdown Arrow for Responsibility */}
             <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover/resp:text-brand-accent transition-colors">
               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
             </div>
          </div>
        )}
      </div>
      
      {field.description && <p className="text-xs text-slate-500 mb-4 font-light max-w-xl">{field.description}</p>}

      {/* Input Rendering based on Type */}
      <div className="relative z-10">
        {/* Agency Overlay */}
        {currentResp === Responsibility.AGENCY && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
             <div className="bg-brand-dark/90 border border-yellow-500/30 px-3 py-1.5 rounded shadow-lg backdrop-blur-md">
               <span className="text-xs font-bold text-yellow-400 font-mono">AGENCY SCOPE ADDED</span>
             </div>
          </div>
        )}

        {field.type === FieldType.TEXT && (
          <input
            type="text"
            disabled={isValueDisabled || isInputReadOnly}
            value={currentValue}
            onChange={(e) => handleValueChange(e.target.value)}
            className={inputClasses}
            placeholder={field.required ? "Required input..." : "Optional..."}
          />
        )}

        {field.type === FieldType.TEXTAREA && (
          <textarea
            rows={3}
            disabled={isValueDisabled || isInputReadOnly}
            value={currentValue}
            onChange={(e) => handleValueChange(e.target.value)}
            className={inputClasses}
            placeholder="Type details here..."
          />
        )}

        {field.type === FieldType.SELECT && (
          <div className="relative group/input">
            <select
                disabled={isValueDisabled || isInputReadOnly}
                value={currentValue}
                onChange={(e) => handleValueChange(e.target.value)}
                className={`${inputClasses} appearance-none pr-10`}
            >
                <option value="" className="bg-brand-dark text-slate-500">Select option...</option>
                {field.options?.map(opt => (
                <option key={opt} value={opt} className="bg-brand-dark text-white">{opt}</option>
                ))}
            </select>
            {/* Custom Dropdown Arrow for Main Input */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover/input:text-brand-accent transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        )}

        {field.type === FieldType.BOOLEAN && (
          <div className="flex space-x-2">
            <button
              disabled={isValueDisabled || isInputReadOnly}
              onClick={() => handleValueChange(true)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border
                ${currentValue === true 
                    ? 'bg-brand-accent text-brand-dark border-brand-accent shadow-[0_0_10px_rgba(74,222,128,0.3)]' 
                    : 'bg-black/40 text-slate-500 border-brand-border hover:bg-brand-surface'
                }`}
            >
              Yes
            </button>
            <button
              disabled={isValueDisabled || isInputReadOnly}
              onClick={() => handleValueChange(false)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border
                ${currentValue === false 
                    ? 'bg-slate-700 text-white border-slate-600' 
                    : 'bg-black/40 text-slate-500 border-brand-border hover:bg-brand-surface'
                }`}
            >
              No
            </button>
          </div>
        )}
        
        {field.type === FieldType.FILE_UPLOAD && (
           <div 
             onClick={() => !isValueDisabled && handleValueChange('mock.pdf')}
             className={`border border-dashed border-brand-border rounded-lg p-6 text-center transition-all group-hover:border-brand-accent/40
               ${isValueDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-brand-surface cursor-pointer'}
             `}>
              <div className="text-2xl mb-2 text-slate-600 group-hover:text-brand-accent transition-colors">📂</div>
              <span className="text-xs text-slate-400 font-mono">
                {currentValue ? 'FILE_UPLOADED_SUCCESS.PDF' : 'DRAG_DROP_OR_CLICK'}
              </span>
           </div>
        )}
        
        {field.type === FieldType.DATE && (
          <input
            type="date"
            disabled={isValueDisabled || isInputReadOnly}
            value={currentValue}
            onChange={(e) => handleValueChange(e.target.value)}
            className={`${inputClasses} [color-scheme:dark]`}
          />
        )}
      </div>

      {/* Real-time Error Message */}
      {error && (
        <div className="flex items-center mt-2 text-red-400 animate-[shake_0.5s_ease-in-out]">
            <svg className="w-3 h-3 mr-1.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium">{error}</span>
        </div>
      )}
    </div>
  );
};