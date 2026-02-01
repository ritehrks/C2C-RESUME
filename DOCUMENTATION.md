# C2C Resume Platform - Technical Documentation

> **Version:** 1.0.0  
> **Last Updated:** January 30, 2026  
> **Status:** Active Development

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Features Implemented](#features-implemented)
5. [API Documentation](#api-documentation)
6. [Frontend Routes](#frontend-routes)
7. [Database Schema](#database-schema)
8. [Authentication Flow](#authentication-flow)
9. [Environment Variables](#environment-variables)
10. [Development Setup](#development-setup)
11. [Future Roadmap](#future-roadmap)

---

## 🎯 Project Overview

The **C2C Resume Platform** is an official LaTeX-based resume builder designed specifically for MNIT Jaipur students. It provides:

- Professional resume templates (MNIT Official & Generic ATS)
- AI-powered resume analysis (Simple & Deep modes)
- Real-time PDF generation using LaTeX
- User authentication with Google OAuth
- Master profile management for reusable data
- ATS (Applicant Tracking System) compatibility scoring

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Next.js 16)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Landing   │  │  Dashboard  │  │   Builder   │              │
│  │    Page     │  │    Page     │  │    Page     │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│  ┌─────────────┐  ┌─────────────┐                               │
│  │   Profile   │  │  Analyzer   │                               │
│  │    Page     │  │    Page     │                               │
│  └─────────────┘  └─────────────┘                               │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST API
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVER (Express.js)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │    Auth     │  │   Resume    │  │  Analysis   │              │
│  │ Controller  │  │ Controller  │  │ Controller  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│  ┌─────────────┐  ┌─────────────┐                               │
│  │   LaTeX     │  │  Analyzer   │                               │
│  │   Engine    │  │  Service    │                               │
│  └─────────────┘  └─────────────┘                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
           ┌─────────────────┼─────────────────┐
           ▼                 ▼                 ▼
    ┌──────────┐      ┌──────────┐      ┌──────────┐
    │ MongoDB  │      │  Redis   │      │  Gemini  │
    │  Atlas   │      │  Cache   │      │   API    │
    └──────────┘      └──────────┘      └──────────┘
```

---

## 🛠 Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.6 | React framework with App Router |
| React | 19.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Utility-first styling |
| Material Symbols | - | Icon library |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x | Runtime environment |
| Express.js | 4.x | Web framework |
| TypeScript | 5.x | Type safety |
| Mongoose | 8.x | MongoDB ODM |
| jsonwebtoken | 9.x | JWT authentication |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| MongoDB Atlas | Primary database |
| Redis | Rate limiting & caching |
| Gemini API | AI-powered analysis |
| LaTeX (pdflatex) | PDF generation |

---

## ✅ Features Implemented

### 1. Authentication System
- **Google OAuth 2.0** for production
- **Development mode** with mock user (no login required)
- **JWT tokens** for session management
- **Profile management** API endpoints

### 2. Resume Builder
- **Two templates**: MNIT Official & Generic ATS
- **Real-time preview** with visual template rendering
- **PDF generation** using LaTeX engine
- **PDF preview modal** with download option
- **Auto-save** functionality with debouncing
- **Sections supported**:
  - Personal Information
  - Education
  - Experience
  - Projects
  - Skills
  - Achievements

### 3. User Profile
- **Master Profile** with reusable data:
  - Personal Information
  - Education history
  - Technical skills (languages, frameworks, tools, databases)
  - Soft skills
- **Settings tab** (dark mode, notifications)
- **Billing tab** (Free, Pro, Enterprise plans)
- **Premium gradient UI** with stats display

### 4. Resume Analysis
- **Simple Analysis** (Local, instant):
  - Keyword matching
  - Section detection
  - Action verb analysis
  - Semantic similarity using embeddings
- **Deep Analysis** (AI-powered via Gemini):
  - Detailed content suggestions
  - Industry-specific recommendations
  - ATS optimization tips
  - Rate-limited (3/day for free users)

### 5. Dashboard
- **Resume list** with CRUD operations
- **Template filtering**
- **Quick actions** (edit, delete, duplicate)
- **Recent activity tracking**

---

## 📚 API Documentation

### Authentication Endpoints

#### `GET /api/auth/google`
Initiates Google OAuth flow (production) or returns mock token (development).

**Response (Dev Mode):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "dev@c2c.mnit.ac.in",
    "name": "Development User"
  }
}
```

#### `GET /api/auth/callback`
Handles OAuth callback and creates/updates user.

#### `GET /api/auth/me`
Returns current authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://...",
    "masterProfile": { ... }
  }
}
```

#### `PUT /api/auth/profile`
Updates user's master profile.

**Body:**
```json
{
  "personalInfo": { ... },
  "education": [ ... ],
  "skills": { ... }
}
```

---

### Resume Endpoints

#### `GET /api/resumes`
Returns all resumes for authenticated user.

**Response:**
```json
{
  "success": true,
  "resumes": [
    {
      "_id": "...",
      "name": "My Resume",
      "templateId": "mnit_resume",
      "version": 1,
      "updatedAt": "2026-01-30T10:00:00Z"
    }
  ]
}
```

#### `POST /api/resumes`
Creates a new resume.

**Body:**
```json
{
  "name": "New Resume",
  "email": "john@example.com",
  "phone": "+91 9876543210",
  "templateId": "mnit_resume",
  "education": [...],
  "experience": [...],
  "projects": [...],
  "skills": [...],
  "achievements": [...]
}
```

#### `GET /api/resumes/:id`
Returns a specific resume by ID.

#### `PUT /api/resumes/:id`
Updates an existing resume.

#### `DELETE /api/resumes/:id`
Deletes a resume.

#### `POST /api/resumes/generate-pdf`
Generates PDF from resume data.

**Body:** Complete resume object with `templateName`

**Response:** Binary PDF file

---

### Analysis Endpoints

#### `POST /api/analyze/simple`
Performs local, instant analysis.

**Body:**
```json
{
  "resumeText": "Full resume text...",
  "jobDescription": "Target job description..."
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "overallScore": 75,
    "keywordScore": 80,
    "sectionScore": 90,
    "actionVerbScore": 70,
    "semanticScore": 65,
    "analysisType": "simple",
    "suggestions": [...]
  }
}
```

#### `POST /api/analyze/deep`
Performs AI-powered deep analysis (rate-limited).

**Body:** Same as simple analysis

**Response:**
```json
{
  "success": true,
  "result": {
    "overallScore": 82,
    "analysisType": "deep",
    "aiSuggestions": [...],
    "strengths": [...],
    "improvements": [...],
    "industryFit": "..."
  }
}
```

---

## 🗺 Frontend Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `page.tsx` | Landing page with hero & features |
| `/dashboard` | `(dashboard)/dashboard/page.tsx` | Resume list & management |
| `/profile` | `(dashboard)/profile/page.tsx` | User profile & settings |
| `/builder` | `builder/page.tsx` | Resume editor with preview |
| `/analyzer` | `analyzer/page.tsx` | Resume analysis tool |

---

## 🗄 Database Schema

### User Model
```typescript
{
  _id: ObjectId,
  email: string (unique, required),
  name: string (required),
  avatar: string (optional),
  authProvider: 'google' | 'email',
  masterProfile: {
    personalInfo: {
      name: string,
      email: string,
      phone: string,
      linkedin: string,
      github: string,
      portfolio: string
    },
    education: [{
      institution: string,
      degree: string,
      branch: string,
      cgpa: string,
      startYear: string,
      endYear: string
    }],
    skills: {
      languages: string,
      frameworks: string,
      tools: string,
      databases: string,
      softSkills: string
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Resume Model
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  name: string (required),
  email: string,
  phone: string,
  linkedin: string,
  github: string,
  templateId: 'mnit_resume' | 'generic_ats',
  education: [{
    institution: string,
    degree: string,
    branch: string,
    cgpa: string,
    startDate: string,
    endDate: string
  }],
  experience: [{
    company: string,
    title: string,
    location: string,
    startDate: string,
    endDate: string,
    bullets: [string]
  }],
  projects: [{
    name: string,
    technologies: string,
    startDate: string,
    endDate: string,
    bullets: [string]
  }],
  skills: [{
    category: string,
    items: string
  }],
  achievements: [{
    title: string,
    description: string,
    date: string
  }],
  version: number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Authentication Flow

### Production (Google OAuth)
```
1. User clicks "Sign in with Google"
2. Frontend redirects to /api/auth/google
3. Server redirects to Google OAuth consent screen
4. User grants permission
5. Google redirects to /api/auth/callback with code
6. Server exchanges code for tokens
7. Server fetches user info from Google
8. Server creates/updates user in MongoDB
9. Server generates JWT token
10. Server redirects to frontend with token
11. Frontend stores token in localStorage
12. Subsequent requests include token in Authorization header
```

### Development Mode
```
1. Any request to /api/auth/google returns mock token
2. Mock user (dev@c2c.mnit.ac.in) is auto-created
3. No actual OAuth flow required
4. Useful for local development without Google credentials
```

---

## ⚙️ Environment Variables

### Server (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/c2c-resume

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRY=7d
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# External Services
GEMINI_API_KEY=your-gemini-api-key
REDIS_URL=redis://localhost:6379

# URLs
API_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000

# Environment
NODE_ENV=development
PORT=5000
```

### Client (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 🚀 Development Setup

### Prerequisites
- Node.js 20.x
- MongoDB (local or Atlas)
- Redis (optional, for rate limiting)
- LaTeX distribution (pdflatex command available)

### Installation

```bash
# Clone repository
git clone https://github.com/your-repo/c2c-resume.git
cd c2c-resume

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Running Development Servers

```bash
# Terminal 1: Start MongoDB (if local)
mongod

# Terminal 2: Start server
cd server
npm run dev

# Terminal 3: Start client
cd client
npm run dev
```

### Access Points
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000
- **API Health:** http://localhost:5000/health

---

## 🗺 Future Roadmap

### Phase 1 (Current)
- [x] Resume Builder with 2 templates
- [x] PDF generation with LaTeX
- [x] Simple analysis (local)
- [x] Deep analysis (Gemini AI)
- [x] User authentication (Google OAuth)
- [x] Master profile management
- [x] PDF preview modal
- [x] User-resume linking

### Phase 2 (Planned)
- [ ] DOCX export
- [ ] JSON export/import
- [ ] Analysis history & tracking
- [ ] Custom template builder
- [ ] Resume versioning comparison
- [ ] Collaborative editing

### Phase 3 (Future)
- [ ] LinkedIn import
- [ ] Job matching recommendations
- [ ] Interview preparation module
- [ ] Mobile application
- [ ] Enterprise SSO (SAML)

---

## 📝 Contributing

1. Create a feature branch from `dev`
2. Make your changes
3. Write/update tests
4. Submit a pull request

## 📄 License

This project is proprietary software developed for MNIT Jaipur Placement Cell.

---

**Built with ❤️ for MNIT Jaipur**
