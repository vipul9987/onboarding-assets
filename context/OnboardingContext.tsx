import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { OnboardingState, MOCK_CONTEXT, Answer, Responsibility, FieldDefinition, ProjectContext } from '../types';
import { FORM_SECTIONS } from '../constants';

// --- CONFIGURATION ---
const API_BASE_URL = 'http://localhost:5000/api';
const DEFAULT_PROJECT_ID = 'WEB-2024-001'; // Default for demo

interface OnboardingContextType extends OnboardingState {
  setAnswer: (fieldId: string, value: any, responsibility: Responsibility) => void;
  nextStep: () => void;
  prevStep: () => void;
  submitForm: () => Promise<void>;
  validateStep: (stepIndex: number) => boolean;
  getMissingFields: () => string[];
  isLoading: boolean;
  clearDraft: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children, projectId }: { children?: ReactNode, projectId?: string }) => {
  // Determine active project
  const activeProjectId = projectId || DEFAULT_PROJECT_ID;
  const storageKey = `scopelock_draft_${activeProjectId}`;

  // Initial State
  const [state, setState] = useState<OnboardingState>({
    currentStep: 0,
    isLocked: false,
    isSubmitting: false,
    context: MOCK_CONTEXT, 
    data: {},
    errors: {}
  });

  const [isLoading, setIsLoading] = useState(true);
  const isFirstLoad = useRef(true);

  // --- API INTEGRATION ---

  const mapBackendToFrontend = (backendSession: any) => {
    const mappedData: Record<string, Answer> = {};
    if (backendSession.answers && Array.isArray(backendSession.answers)) {
      backendSession.answers.forEach((ans: any) => {
        mappedData[ans.fieldId] = {
          value: ans.value,
          responsibility: ans.responsibility,
          lastUpdated: ans.lastUpdated
        };
      });
    }

    let context = MOCK_CONTEXT;
    if (backendSession.project) {
        context = {
            projectId: backendSession.project._id || activeProjectId,
            clientName: backendSession.project.client?.name || 'Unknown Client',
            websiteType: backendSession.project.websiteType || 'Business',
            platform: backendSession.project.platform || 'Custom',
            tier: backendSession.project.tier || 'Standard'
        };
    }

    // Default Pre-fills
    if (!mappedData['website_type']) {
        let defaultType = 'Business/Service';
        if (context.websiteType === 'E-commerce') defaultType = 'E-commerce';
        if (context.websiteType === 'Portfolio') defaultType = 'Portfolio';
        if (context.websiteType === 'Landing Page') defaultType = 'Landing Page';

        mappedData['website_type'] = {
            value: defaultType,
            responsibility: Responsibility.CLIENT,
            lastUpdated: new Date().toISOString()
        };
    }

    if (!mappedData['project_platform']) {
        mappedData['project_platform'] = {
            value: context.platform || 'WordPress',
            responsibility: Responsibility.CLIENT,
            lastUpdated: new Date().toISOString()
        };
    }

    if (!mappedData['project_tier']) {
        let defaultTier = 'Standard (Customized)';
        if (context.tier === 'Basic') defaultTier = 'Basic (Template)';
        if (context.tier === 'Custom') defaultTier = 'Premium (Fully Custom)';

        mappedData['project_tier'] = {
            value: defaultTier,
            responsibility: Responsibility.CLIENT,
            lastUpdated: new Date().toISOString()
        };
    }

    return {
      data: mappedData,
      isLocked: backendSession.isLocked || false,
      currentStep: backendSession.isLocked ? FORM_SECTIONS.length + 1 : (backendSession.currentStep || 0),
      context
    };
  };

  // 1. Fetch Session on Mount
  useEffect(() => {
    // Reset state when project ID changes
    setIsLoading(true);
    isFirstLoad.current = true;

    const fetchSession = async () => {
      try {
        console.log(`Fetching session for project: ${activeProjectId}...`);
        const res = await fetch(`${API_BASE_URL}/onboarding/${activeProjectId}`);
        
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        
        const sessionData = await res.json();
        const mapped = mapBackendToFrontend(sessionData);
        
        setState(prev => ({
          ...prev,
          data: mapped.data,
          isLocked: mapped.isLocked,
          currentStep: mapped.currentStep,
          context: mapped.context
        }));
      } catch (err) {
        console.warn('⚠️ Backend not reachable. Checking LocalStorage...');
        
        const localDraft = localStorage.getItem(storageKey);
        if (localDraft) {
            const parsed = JSON.parse(localDraft);
            setState(parsed);
        } else {
             setState(prev => {
                 const initialData = { ...prev.data };
                 // Defaults for offline mode
                 if (!initialData['website_type']) initialData['website_type'] = { value: 'Business/Service', responsibility: Responsibility.CLIENT, lastUpdated: new Date().toISOString() };
                 return { ...prev, data: initialData };
             });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [activeProjectId]);

  // 2. Persist to LocalStorage
  useEffect(() => {
    if (isFirstLoad.current) {
        isFirstLoad.current = false;
        return;
    }
    if (!state.isLocked) {
        localStorage.setItem(storageKey, JSON.stringify(state));
    }
  }, [state, storageKey]);

  // 3. Submit Answer
  const syncAnswerToBackend = async (fieldId: string, value: any, responsibility: Responsibility) => {
    try {
      await fetch(`${API_BASE_URL}/onboarding/${state.context.projectId}/answer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fieldId, value, responsibility })
      });
    } catch (err) {}
  };

  // 4. Lock Form
  const submitForm = async () => {
    const missing = getMissingFields();
    if (missing.length > 0) return;

    setState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      const res = await fetch(`${API_BASE_URL}/onboarding/${state.context.projectId}/lock`, {
        method: 'POST'
      });
      
      if (!res.ok) throw new Error('Failed to lock');

      localStorage.removeItem(storageKey); 
      setState(prev => ({ 
        ...prev, 
        isSubmitting: false, 
        isLocked: true,
        currentStep: FORM_SECTIONS.length + 1 
      }));
    } catch (err) {
       console.warn('Backend lock failed (likely demo mode). Simulating success.');
       setTimeout(() => {
         localStorage.removeItem(storageKey); 
         setState(prev => ({ 
           ...prev, 
           isSubmitting: false, 
           isLocked: true,
           currentStep: FORM_SECTIONS.length + 1 
         }));
       }, 1500);
    }
  };

  const clearDraft = () => {
      localStorage.removeItem(storageKey);
      window.location.reload();
  };

  // --- VALIDATION LOGIC ---
  const getFieldDef = (fieldId: string): FieldDefinition | undefined => {
    for (const section of FORM_SECTIONS) {
      const found = section.fields.find(f => f.id === fieldId);
      if (found) return found;
    }
    return undefined;
  };

  const validateFieldLogic = (field: FieldDefinition, data: Record<string, Answer>, context: ProjectContext): string | null => {
    if (field.condition && !field.condition(data, context)) return null;

    const answer = data[field.id];
    const responsibility = answer?.responsibility ?? Responsibility.CLIENT;
    const value = answer?.value;

    if (field.required) {
       if (responsibility === Responsibility.NA) return null;
       if (responsibility === Responsibility.AGENCY) return null;
       if (value === '' || value === null || value === undefined) return "This field is required.";
       if (Array.isArray(value) && value.length === 0) return "Please make a selection.";
    }
    return null;
  };

  const setAnswer = (fieldId: string, value: any, responsibility: Responsibility) => {
    if (state.isLocked) return;
    
    setState(prev => {
      const newData = {
        ...prev.data,
        [fieldId]: { value, responsibility, lastUpdated: new Date().toISOString() }
      };

      const fieldDef = getFieldDef(fieldId);
      const newErrors = { ...prev.errors };
      
      if (fieldDef) {
        const error = validateFieldLogic(fieldDef, newData, prev.context);
        if (error) newErrors[fieldId] = error;
        else delete newErrors[fieldId];
      }

      return { ...prev, data: newData, errors: newErrors };
    });

    syncAnswerToBackend(fieldId, value, responsibility);
  };

  const validateStep = (stepIndex: number): boolean => {
    const section = FORM_SECTIONS[stepIndex];
    if (!section) return true;
    if (section.condition && !section.condition(state.data, state.context)) return true;

    const stepErrors: Record<string, string> = {};
    let isValid = true;

    section.fields.forEach(field => {
      const error = validateFieldLogic(field, state.data, state.context);
      if (error) {
        stepErrors[field.id] = error;
        isValid = false;
      }
    });

    if (!isValid) setState(prev => ({ ...prev, errors: { ...prev.errors, ...stepErrors } }));
    return isValid;
  };

  const nextStep = () => {
    if (validateStep(state.currentStep)) {
      setState(prev => ({ ...prev, currentStep: Math.min(prev.currentStep + 1, FORM_SECTIONS.length) }));
    }
  };

  const prevStep = () => {
    setState(prev => ({ ...prev, currentStep: Math.max(prev.currentStep - 1, 0) }));
  };

  const getMissingFields = (): string[] => {
    const missing: string[] = [];
    FORM_SECTIONS.forEach(section => {
      if (section.condition && !section.condition(state.data, state.context)) return;
      section.fields.forEach(field => {
        const error = validateFieldLogic(field, state.data, state.context);
        if (error) missing.push(field.label);
      });
    });
    return missing;
  };

  return (
    <OnboardingContext.Provider value={{ 
      ...state, 
      setAnswer, 
      nextStep, 
      prevStep, 
      submitForm, 
      validateStep, 
      getMissingFields, 
      isLoading,
      clearDraft
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used within OnboardingProvider');
  return context;
};