
export enum Responsibility {
  CLIENT = 'CLIENT', // Client provides input
  AGENCY = 'AGENCY', // Client pays agency to do it
  NA = 'NA' // Not applicable
}

export enum FieldType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  BOOLEAN = 'boolean',
  FILE_UPLOAD = 'file',
  DATE = 'date'
}

export enum ServiceType {
  WEBSITE = 'WEBSITE',
  SEO = 'SEO',
  BOTH = 'BOTH'
}

export interface FieldDefinition {
  id: string;
  label: string;
  description?: string;
  type: FieldType;
  options?: string[]; // For select inputs
  required: boolean;
  contextLock?: boolean; // If true, locked by pre-filled backend context
  condition?: (formData: any, context: ProjectContext) => boolean; // Dynamic visibility
}

export interface SectionDefinition {
  id: string;
  title: string;
  description: string;
  fields: FieldDefinition[];
  condition?: (formData: any, context: ProjectContext) => boolean;
}

export interface Answer {
  value: any;
  responsibility: Responsibility;
  lastUpdated: string;
}

export interface OnboardingState {
  currentStep: number;
  isLocked: boolean;
  isSubmitting: boolean;
  context: ProjectContext;
  data: Record<string, Answer>; // Keyed by Field ID
  errors: Record<string, string>; // Validation error messages keyed by Field ID
}

export interface ProjectContext {
  projectId: string;
  clientName: string;
  serviceType: ServiceType;
  // Specific Agency Fields
  websiteType: 'Business' | 'E-commerce' | 'Landing Page' | 'Portfolio';
  platform: 'WordPress' | 'Shopify' | 'Custom';
  tier: 'Basic' | 'Standard' | 'Custom';
}

// --- NEW ADMIN TYPES ---
export interface AdminProjectSummary {
  _id: string;
  name: string;
  clientName: string;
  serviceType: ServiceType;
  platform: string;
  tier: string;
  status: string;
  isLocked: boolean;
  lockedAt?: string;
  progress: number; // Percent complete
}

export const MOCK_CONTEXT: ProjectContext = {
  projectId: 'WEB-2024-001',
  clientName: 'Nexus Innovations',
  serviceType: ServiceType.WEBSITE,
  websiteType: 'E-commerce', 
  platform: 'Shopify',
  tier: 'Standard'
};
