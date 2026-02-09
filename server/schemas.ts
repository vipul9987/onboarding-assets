// This file represents the backend logic requested in the prompts.
// In a full environment, these would run on the Node.js Express server.

import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// --- 1. Client Schema ---
const ClientSchema = new Schema({
  name: { type: String, required: true },
  taxId: String,
  primaryContact: {
    name: String,
    email: String,
    phone: String
  },
  createdAt: { type: Date, default: Date.now }
});

// --- 2. Project Schema ---
const ProjectSchema = new Schema({
  client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  name: { type: String, required: true },
  
  // Specific Agency Fields
  websiteType: { type: String, enum: ['Business', 'E-commerce', 'Landing Page', 'Portfolio'] },
  platform: { type: String, enum: ['WordPress', 'Shopify', 'Custom'] },
  tier: { type: String, enum: ['Basic', 'Standard', 'Custom'] },
  
  status: { type: String, enum: ['ONBOARDING', 'ACTIVE', 'COMPLETED'], default: 'ONBOARDING' }
});

// --- 3. Onboarding Form (The Core Decision Engine) ---
// We use a flexible schema for answers because fields vary by project type.
const AnswerSchema = new Schema({
  fieldId: { type: String, required: true },
  value: Schema.Types.Mixed, // Can be string, boolean, array, etc.
  responsibility: { 
    type: String, 
    enum: ['CLIENT', 'AGENCY', 'NA'], 
    required: true 
  },
  lastUpdated: { type: Date, default: Date.now }
}, { _id: false });

const OnboardingSessionSchema = new Schema({
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, unique: true },
  isLocked: { type: Boolean, default: false },
  lockedAt: Date,
  answers: [AnswerSchema], // Array of answers
  currentStep: { type: Number, default: 0 },
  version: { type: Number, default: 1 }
});

// --- 4. Revision Log (Audit Trail) ---
// If a locked form is edited, we create a revision record.
const RevisionLogSchema = new Schema({
  onboardingSession: { type: Schema.Types.ObjectId, ref: 'OnboardingSession' },
  fieldId: String,
  oldValue: Schema.Types.Mixed,
  newValue: Schema.Types.Mixed,
  oldResponsibility: String,
  newResponsibility: String,
  requestedBy: String, // 'CLIENT' or 'AGENCY'
  timestamp: { type: Date, default: Date.now },
  reason: String
});

// Exports (Simulated for this file)
export const ClientModel = mongoose.models.Client || mongoose.model('Client', ClientSchema);
export const ProjectModel = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
export const OnboardingSessionModel = mongoose.models.OnboardingSession || mongoose.model('OnboardingSession', OnboardingSessionSchema);
export const RevisionLogModel = mongoose.models.RevisionLog || mongoose.model('RevisionLog', RevisionLogSchema);