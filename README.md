# ScopeLock Onboarding System

## 1. System Architecture Overview

### Frontend Structure
- **Core Framework**: React 18 with Context API for state management.
- **Styling**: TailwindCSS for premium, scalable design tokens.
- **State Pattern**: `OnboardingContext` acts as the single source of truth, managing:
  - Form Data (Answers + Responsibility)
  - Navigation State (Steps)
  - Validation Logic
  - Context Injection (Project Metadata)

### Backend Structure
- **Runtime**: Node.js + Express.
- **Database**: MongoDB with Mongoose ODM.
- **Architecture**: RESTful API structure with resource-based routing.
- **Data Integrity**: 
  - `OnboardingSession` tracks the live state.
  - `RevisionLog` provides an immutable audit trail for post-lock changes.

### Data Flow
1. **Initialization**: Frontend fetches `ProjectContext` (Tier, Platform) to pre-fill locked fields.
2. **Interaction**: User explicitly selects `Responsibility` (Client vs Agency) for every field.
3. **Validation**: Frontend prevents "Next" navigation until explicit choices are made.
4. **Submission**: Backend verifies completeness -> Locks Session -> Generates JSON Brief -> Updates Project Status.

---

## 2. UX Principles implemented

1. **Explicit Decision Making**: No field can be left blank. Users must explicitly choose "Not Applicable" or "Delegate to Agency". This eliminates "I didn't know I had to provide that" friction later.
2. **Context-Aware**: The form adapts based on the `ProjectContext`. E.g., if `migration_needed` is false, `customer_count` is hidden.
3. **Scope Visibility**: Visual indicators (Gold borders/badges) highlight items delegated to the agency, reinforcing that this adds to the budget/scope.
4. **Frictionless Progress**: Sidebar navigation updates in real-time. Validation errors are localized and immediate.

---

## 3. MVP vs Full Version Strategy

### Current MVP Features
- [x] Dynamic JSON-schema driven form generation.
- [x] Explicit Responsibility selection (Client/Agency/NA).
- [x] Context injection (Pre-filled project data).
- [x] Validation engine.
- [x] Summary & Locking mechanism.
- [x] Basic MongoDB Schema & API structure.

### Full Version Roadmap
- **Auth**: Integration with Auth0 or proprietary Agency SSO.
- **File Uploads**: Integration with S3/GCS for actual asset storage (currently mocked).
- **Email Notifications**: Send PDF briefs via SendGrid upon locking.
- **Admin Dashboard**: Interface for Project Managers to view briefs and approve Revision Requests.
- **Collaboration**: Real-time multiplayer editing (sockets) for client teams.

---

## 4. How to Run

1. **Frontend**:
   ```bash
   npm install
   npm start
   ```

2. **Backend**:
   ```bash
   cd server
   npm install express mongoose cors
   ts-node server.ts
   ```
