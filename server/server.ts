import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { 
  OnboardingSessionModel, 
  ProjectModel, 
  ClientModel, 
  RevisionLogModel 
} from './schemas';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({ origin: '*' }) as any); // Allow all for demo, restrict in prod

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/scopelock')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// --- Auth Middleware (MVP: Mock Implementation) ---
const requireAuth = (req: any, res: any, next: NextFunction) => {
  const token = req.headers.authorization;
  // In production, verify JWT. For demo, we proceed.
  next();
};

// --- CORE APIs ---

// 1. GET /api/onboarding/:projectId
// Retrieve or initialize the onboarding session based on project context
app.get('/api/onboarding/:projectId', async (req: any, res: any) => {
  try {
    const { projectId } = req.params;
    
    // Find existing session and POPULATE project details for the frontend context
    let session = await OnboardingSessionModel.findOne({ project: projectId })
      .populate({
        path: 'project',
        populate: { path: 'client' }
      });

    if (!session) {
      // If no session, ensure project exists and create one
      // Note: In a real app, 'projectId' implies the MongoDB _id. 
      const project = await ProjectModel.findById(projectId);
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      session = new OnboardingSessionModel({
        project: projectId,
        answers: [],
        currentStep: 0,
        isLocked: false
      });
      await session.save();
      
      // Re-fetch to populate
      session = await OnboardingSessionModel.findById(session._id)
        .populate({
          path: 'project',
          populate: { path: 'client' }
        });
    }

    res.json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// 2. PUT /api/onboarding/:projectId/answer
// Update a specific field's answer and responsibility
app.put('/api/onboarding/:projectId/answer', async (req: any, res: any) => {
  try {
    const { projectId } = req.params;
    const { fieldId, value, responsibility } = req.body;

    const session = await OnboardingSessionModel.findOne({ project: projectId });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    if (session.isLocked) {
      return res.status(403).json({ error: 'Session is locked. Request a revision.' });
    }

    // Update or push answer
    const existingIndex = session.answers.findIndex((a: any) => a.fieldId === fieldId);
    if (existingIndex > -1) {
      session.answers[existingIndex] = { fieldId, value, responsibility, lastUpdated: new Date() };
    } else {
      session.answers.push({ fieldId, value, responsibility, lastUpdated: new Date() });
    }

    await session.save();
    res.json({ success: true, answers: session.answers });
  } catch (error) {
    res.status(500).json({ error: 'Update failed' });
  }
});

// 3. POST /api/onboarding/:projectId/lock
// Final submission: Validates completeness and locks the scope
app.post('/api/onboarding/:projectId/lock', async (req: any, res: any) => {
  try {
    const { projectId } = req.params;
    const session = await OnboardingSessionModel.findOne({ project: projectId }).populate('project');
    if (!session) return res.status(404).json({ error: 'Session not found' });

    session.isLocked = true;
    session.lockedAt = new Date();
    await session.save();

    await ProjectModel.findByIdAndUpdate(projectId, { status: 'ACTIVE' });

    res.json({ success: true, isLocked: true });
  } catch (error) {
    res.status(500).json({ error: 'Lock failed' });
  }
});

// --- ADMIN APIs ---

// 4. GET /api/admin/projects
// Dashboard View: List all projects
app.get('/api/admin/projects', async (req: any, res: any) => {
  try {
    const projects = await ProjectModel.find().populate('client');
    
    // For each project, attach session summary
    const summary = await Promise.all(projects.map(async (p: any) => {
      const session = await OnboardingSessionModel.findOne({ project: p._id });
      return {
        _id: p._id,
        name: p.name,
        clientName: p.client?.name || 'Unknown',
        platform: p.platform,
        tier: p.tier,
        status: p.status,
        isLocked: session ? session.isLocked : false,
        lockedAt: session?.lockedAt,
        // Rough progress calculation
        progress: session ? Math.min(100, (session.answers.length / 25) * 100) : 0 
      };
    }));

    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: 'Admin fetch failed' });
  }
});

// 5. GET /api/seed
// Helper to populate DB with dummy data for the dashboard
app.get('/api/seed', async (req: any, res: any) => {
    try {
        await ClientModel.deleteMany({});
        await ProjectModel.deleteMany({});
        await OnboardingSessionModel.deleteMany({});

        const client1 = await ClientModel.create({ name: 'Nexus Innovations', taxId: 'US-123', primaryContact: { name: 'Sarah Connor', email: 'sarah@nexus.com' } });
        const client2 = await ClientModel.create({ name: 'Urban Coffee Co.', taxId: 'US-456', primaryContact: { name: 'John Doe', email: 'john@coffee.com' } });
        const client3 = await ClientModel.create({ name: 'FinTech Global', taxId: 'US-789', primaryContact: { name: 'Mike Ross', email: 'm.ross@fintech.com' } });

        // Project 1 (The Demo One)
        const p1 = await ProjectModel.create({
            _id: 'WEB-2024-001', // Explicit ID for demo consistency
            client: client1._id,
            name: 'Nexus Main E-com',
            websiteType: 'E-commerce',
            platform: 'Shopify',
            tier: 'Standard',
            status: 'ONBOARDING'
        });

        // Project 2 (Active)
        const p2 = await ProjectModel.create({
            client: client2._id,
            name: 'Urban Coffee Landing',
            websiteType: 'Landing Page',
            platform: 'Webflow',
            tier: 'Basic',
            status: 'ACTIVE'
        });

        // Project 3 (Onboarding)
        const p3 = await ProjectModel.create({
            client: client3._id,
            name: 'FinTech Corporate Portal',
            websiteType: 'Business',
            platform: 'Custom',
            tier: 'Custom',
            status: 'ONBOARDING'
        });
        
        // Create a locked session for Project 2
        await OnboardingSessionModel.create({
            project: p2._id,
            isLocked: true,
            lockedAt: new Date(),
            answers: [{ fieldId: 'website_type', value: 'Landing Page', responsibility: 'CLIENT' }]
        });

        res.json({ message: 'Database seeded! Refresh dashboard.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));