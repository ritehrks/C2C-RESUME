# 🎓 C2C Resume Platform - Master Project Blueprint

> **Official Placement Tool for MNIT Jaipur**  
> A Vertical SaaS platform that standardizes and optimizes student resumes through a powerful LaTeX engine.

---

## 📋 Table of Contents

1. [Product Identity](#1-product-identity)
2. [Problem Statement & Solution](#2-problem-statement--solution)
3. [Core Architecture](#3-core-architecture)
4. [Detailed Feature Breakdown](#4-detailed-feature-breakdown)
5. [Technical Stack](#5-technical-stack)
6. [Database Schema](#6-database-schema)
7. [API Design](#7-api-design)
8. [User Flows](#8-user-flows)
9. [Security Considerations](#9-security-considerations)
10. [Deployment Strategy](#10-deployment-strategy)
11. [Future Roadmap](#11-future-roadmap)
12. [Success Metrics](#12-success-metrics)

---

## 1. Product Identity

### Project Name
**C2C Resume Builder** — *Official Placement Tool*

### Type
**Vertical SaaS (Software as a Service)** — A compliance tool specifically tailored for MNIT Jaipur's Placement Cell requirements.

### Target Audience
| Segment | Description |
|---------|-------------|
| **Primary** | 2nd, 3rd, 4th year students preparing for internships/placements |
| **Secondary** | Placement Cell coordinators for bulk verification |
| **Tertiary** | Faculty advisors reviewing student profiles |

### Visual Aesthetic: "Clean Academic Tech"

```
┌─────────────────────────────────────────────────────────┐
│  COLOR PALETTE                                          │
├─────────────────────────────────────────────────────────┤
│  Primary:    #1E3A5F (Deep Navy Blue)                   │
│  Secondary:  #3B82F6 (Bright Blue - CTAs)               │
│  Background: #F8FAFC (Off-White)                        │
│  Text:       #1F2937 (Dark Gray)                        │
│  Accent:     #10B981 (Success Green)                    │
│  Warning:    #F59E0B (Amber)                            │
│  Error:      #EF4444 (Red)                              │
└─────────────────────────────────────────────────────────┘
```

### Design Principles
- ✅ **Minimalist** — No clutter, every element has purpose
- ✅ **Professional** — Trust-building visual hierarchy
- ✅ **Fast** — Perceived speed through skeleton loaders
- ✅ **Accessible** — WCAG 2.1 AA compliant
- ❌ **No gradients** — Clean flat design only
- ❌ **No animations** — Except essential micro-interactions

---

## 2. Problem Statement & Solution

### The Problem

```
❌ Students use Word/Google Docs → Inconsistent margins, fonts, alignment
❌ ATS systems reject poorly formatted resumes
❌ Placement Cell spends hours reviewing non-compliant resumes
❌ Students don't know what keywords to include for specific roles
❌ No version control — Students lose track of resume iterations
```

### The Solution

```
✅ LaTeX-powered backend → Pixel-perfect, standardized output
✅ ATS-friendly templates → 100% parsing success rate
✅ One-click compliance → Every resume meets Placement Cell standards
✅ AI-powered keyword analysis → Match resumes to JDs
✅ Cloud-based version control → Access any resume version instantly
```

### Value Proposition Matrix

| Stakeholder | Pain Point | Our Solution | Value Delivered |
|-------------|------------|--------------|-----------------|
| **Students** | Formatting headaches | Form-based input | 10x faster resume creation |
| **Placement Cell** | Non-standard resumes | Enforced templates | 100% compliance rate |
| **Recruiters** | ATS parsing failures | LaTeX output | Clean data extraction |

---

## 3. Core Architecture

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Next.js)                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │
│  │  Landing │  │  Builder │  │ Analyzer │  │      Dashboard       │ │
│  │   Page   │  │   Page   │  │   Page   │  │   (My Resumes)       │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────────┬───────────┘ │
└───────┼─────────────┼─────────────┼────────────────────┼────────────┘
        │             │             │                    │
        ▼             ▼             ▼                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY (Node.js/Express)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │
│  │   Auth   │  │  Resume  │  │ Analyzer │  │     User Profile     │ │
│  │  Routes  │  │  Routes  │  │  Routes  │  │       Routes         │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────────┬───────────┘ │
└───────┼─────────────┼─────────────┼────────────────────┼────────────┘
        │             │             │                    │
        ▼             ▼             ▼                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         SERVICES LAYER                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────┐ │
│  │  LaTeX Engine  │  │  PDF Parser    │  │   Keyword Analyzer     │ │
│  │   (pdflatex)   │  │  (pdf-parse)   │  │   (NLP/Matching)       │ │
│  └────────────────┘  └────────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
        │             │             │                    │
        ▼             ▼             ▼                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────┐ │
│  │    MongoDB     │  │  Redis Cache   │  │   File Storage (S3)   │ │
│  │   (User Data)  │  │  (Sessions)    │  │   (Generated PDFs)    │ │
│  └────────────────┘  └────────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### The LaTeX Engine Pipeline

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   User   │───▶│  Form    │───▶│  Server  │───▶│  LaTeX   │───▶│   PDF    │
│  Inputs  │    │  Data    │    │  Injects │    │ Compiles │    │  Output  │
│   Data   │    │  (JSON)  │    │  to .tex │    │  (PDF)   │    │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     │                                                               │
     │              ⏱️ Total Time: ~3-5 seconds                      │
     └───────────────────────────────────────────────────────────────┘
```

---

## 4. Detailed Feature Breakdown

### Page 1: Landing Page (The Hook)

**Goal:** Establish authority and drive immediate action.

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo]                                    [Login] [Get Started]    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────────────────┐    ┌────────────────────────────────┐ │
│   │                         │    │                                │ │
│   │  "Craft Your Official   │    │    [ANIMATION]                 │ │
│   │   C2C Resume"           │    │    Resume unfolding/           │ │
│   │                         │    │    printing itself             │ │
│   │  One tool. Every rule.  │    │                                │ │
│   │  Zero formatting stress.│    │                                │ │
│   │                         │    │                                │ │
│   │  [Create New Resume]    │    │                                │ │
│   │  [Analyze Existing]     │    │                                │ │
│   │                         │    │                                │ │
│   └─────────────────────────┘    └────────────────────────────────┘ │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │ 📄 ATS-     │  │ ⚡ Generate │  │ 🎯 100%     │                 │
│  │ Friendly    │  │ in <5 sec   │  │ Compliant   │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
└─────────────────────────────────────────────────────────────────────┘
```

#### Key Elements
- **Hero Animation:** Lottie/CSS animation of resume "materializing"
- **Trust Badges:** "Official C2C Tool", "500+ Resumes Generated"
- **No Clutter:** No pricing, testimonials, or unnecessary sections

---

### Page 2: Builder Page (The Workspace)

**Goal:** Frictionless data entry with real-time preview.

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────────────┐
│  [← Back]           Resume Builder              [Save Draft] [↓ PDF]│
├─────────────────────────────────┬───────────────────────────────────┤
│                                 │                                   │
│  ┌───────────────────────────┐  │  ┌─────────────────────────────┐  │
│  │ ▼ Personal Information    │  │  │                             │  │
│  │   Name: [_______________] │  │  │    LIVE PREVIEW             │  │
│  │   Email: [______________] │  │  │                             │  │
│  │   Phone: [______________] │  │  │    ┌─────────────────────┐  │  │
│  │   LinkedIn: [___________] │  │  │    │  JOHN DOE           │  │  │
│  │   GitHub: [_____________] │  │  │    │  ───────────────    │  │  │
│  │                           │  │  │    │  Education          │  │  │
│  ├───────────────────────────┤  │  │    │  • MNIT Jaipur      │  │  │
│  │ ▶ Education               │  │  │    │                     │  │  │
│  ├───────────────────────────┤  │  │    │  Projects           │  │  │
│  │ ▶ Experience              │  │  │    │  • Project 1        │  │  │
│  ├───────────────────────────┤  │  │    │  • Project 2        │  │  │
│  │ ▶ Projects                │  │  │    │                     │  │  │
│  │   [+ Add Project]         │  │  │    │  Skills             │  │  │
│  ├───────────────────────────┤  │  │    │  Python, JS, C++    │  │  │
│  │ ▶ Skills                  │  │  │    └─────────────────────┘  │  │
│  ├───────────────────────────┤  │  │                             │  │
│  │ ▶ Achievements            │  │  │                             │  │
│  └───────────────────────────┘  │  └─────────────────────────────┘  │
│                                 │                                   │
└─────────────────────────────────┴───────────────────────────────────┘
```

#### Form Sections (Accordion Style)

| Section | Fields | Validation |
|---------|--------|------------|
| **Personal Info** | Name, Email, Phone, LinkedIn, GitHub, Portfolio, Codeforces | Email format, URL format |
| **Education** | Institution, Branch, Semester, CGPA, Start/End Year | CGPA 0-10 range |
| **Experience** | Company, Role, Duration, Bullets (dynamic) | Min 1 bullet point |
| **Projects** | Title, Tech Stack, Description, Bullets, Links | Min 2 bullets |
| **Skills** | Languages, Frameworks, Tools, Soft Skills | Tag-based input |
| **Achievements** | Title, Description, Date | Optional section |
| **Certifications** | Name, Issuer, Date, Link | Optional section |
| **PORs** | Position, Organization, Duration, Description | Optional section |

#### Smart Preview Features
- **Instant HTML Skeleton:** Renders immediately (no server call)
- **Debounced Updates:** 300ms delay to reduce re-renders
- **PDF Generation:** Only on explicit "Download" click

---

### Page 3: Analyzer Page (The Optimizer)

**Goal:** AI-powered resume optimization with cost-effective two-tier analysis system.

#### 🎯 Core Innovation: Two-Tier Analysis System

We use a **Role-First** approach with two analysis modes:

| Mode | Processing | Speed | Cost | Usage Limit |
|------|------------|-------|------|-------------|
| **⚡ Simple Analysis** | Server-side local ML | 1-2 sec | $0 | ♾️ Unlimited |
| **🔮 Deep Analysis** | Gemini API | 5-10 sec | ~$0.01 | 3/day free |

#### Step 1: Role Selection (Before Analysis)

```
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 1: SELECT YOUR TARGET ROLE                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  What role is this resume for?                                      │
│                                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ 💻 SDE      │ │ 📊 Data     │ │ 🎨 Frontend │ │ ⚙️ DevOps   │   │
│  │             │ │ Scientist   │ │ Developer   │ │             │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ 📱 App Dev  │ │ 🤖 ML       │ │ 📋 Product  │ │ 🔧 Other    │   │
│  │             │ │ Engineer    │ │ Manager     │ │ (Custom JD) │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                                     │
│  OR paste a custom Job Description: [___________________________]   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Step 2: Upload Resume + Choose Analysis Type

```
┌─────────────────────────────────────────────────────────────────────┐
│  [← Back]           Resume Analyzer             [New Analysis]      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Selected Role: 💻 Software Development Engineer                    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  📄 Upload Your Resume                                          ││
│  │  [Upload PDF] or drag & drop                                    ││
│  │                                                                 ││
│  │  Or select from saved: ○ SDE_Resume_v2.pdf                      ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌────────────────────────────┐  ┌────────────────────────────────┐│
│  │  ⚡ SIMPLE ANALYSIS        │  │  🔮 DEEP ANALYSIS              ││
│  │  ─────────────────────────  │  │  ─────────────────────────────  ││
│  │                            │  │                                ││
│  │  ✓ Keyword Match Score     │  │  ✓ Everything in Simple        ││
│  │  ✓ Missing Skills          │  │  ✓ AI-Powered Suggestions      ││
│  │  ✓ Section Detection       │  │  ✓ Sentence Rewrites           ││
│  │  ✓ Action Verb Check       │  │  ✓ Personalized Tips           ││
│  │  ✓ Similarity Score        │  │  ✓ Grammar & Tone Analysis     ││
│  │                            │  │                                ││
│  │  🚀 Instant (1-2 sec)      │  │  ⏱️ Takes 5-10 seconds         ││
│  │  ♾️ Unlimited Forever       │  │  📊 3 free/day (or premium)    ││
│  │                            │  │                                ││
│  │     [Run Simple]           │  │     [Run Deep Analysis]        ││
│  └────────────────────────────┘  └────────────────────────────────┘│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Step 3: Analysis Results

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ANALYSIS REPORT                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌──────────────┐   ┌─────────────────────────────────────────────┐│
│   │              │   │ KEYWORD GAPS                                ││
│   │    85%       │   │ ❌ Docker    ❌ Kubernetes   ❌ Redis       ││
│   │   [████████] │   │ ❌ CI/CD     ❌ AWS                         ││
│   │              │   │                                             ││
│   │  Match Score │   │ ✅ MATCHED KEYWORDS                         ││
│   │              │   │ Python, JavaScript, React, Node.js, SQL     ││
│   └──────────────┘   └─────────────────────────────────────────────┘│
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────────┐│
│   │ ACTION VERB ANALYSIS                                           ││
│   │ ⚠️ Weak: "Made", "Did", "Worked on"                            ││
│   │ ✅ Strong: "Architected", "Implemented", "Optimized"            ││
│   └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────────┐│
│   │  🔮 WANT MORE INSIGHTS?                                        ││
│   │  [Get AI-Powered Deep Analysis] (2/3 free today)               ││
│   └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Analyzer Architecture: Technical Deep Dive

#### Why Two Tiers?

```
┌─────────────────────────────────────────────────────────────────────┐
│  THE PROBLEM WITH AI-ONLY ANALYSIS                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Every analysis = 1 API call = 💰 cost                              │
│  200 users × 5 analyses each = 1000 API calls/month                 │
│  At $0.01/call = $10/month (and growing!)                           │
│                                                                     │
│  OUR SOLUTION: Use AI only when necessary                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Architecture: Server-Side Local Embeddings

**Key Point:** "Local" means our own server, NOT the user's browser.

```
┌────────────────────┐         ┌─────────────────────────────────────┐
│  USER'S DEVICE     │         │  OUR SERVER (Railway/Render)        │
├────────────────────┤         ├─────────────────────────────────────┤
│                    │         │                                     │
│   Browser sends    │  HTTP   │   ┌─────────────────────────────┐   │
│   resume text  ────┼────────▶│   │  Node.js Server             │   │
│                    │         │   │  ┌─────────────────────────┐ │   │
│   Gets results ◀───┼─────────│   │  │ ML Model (MiniLM-L6-v2) │ │   │
│   instantly        │         │   │  │ Loaded once at startup  │ │   │
│                    │         │   │  └─────────────────────────┘ │   │
│   Works on any     │         │   │                             │   │
│   device/phone     │         │   │  No external API calls!     │   │
│                    │         │   └─────────────────────────────┘   │
│                    │         │                                     │
└────────────────────┘         └─────────────────────────────────────┘
```

#### Simple Analysis: What Runs Locally (0 API Calls)

| Component | Technology | What It Does |
|-----------|------------|--------------|
| **PDF Parsing** | `pdf-parse` | Extract text from uploaded PDF |
| **Embeddings** | `@xenova/transformers` | Generate 384-dim vectors locally |
| **Keyword Match** | String comparison | Match resume vs role keywords |
| **Verb Analysis** | `compromise` (NLP) | Detect weak/strong action verbs |
| **Similarity** | Cosine similarity | Compare resume to ideal role profile |

#### Pre-Computed Role Profiles (Stored in JSON)

```javascript
// roles_embeddings.json - Generated once, shipped with app
{
  "sde": {
    "name": "Software Development Engineer",
    "keywords": ["algorithms", "data structures", "API", "microservices", 
                 "SQL", "NoSQL", "Git", "CI/CD", "testing", "system design"],
    "mustHave": ["programming language", "problem solving", "projects"],
    "goodToHave": ["open source", "hackathons", "competitive programming"],
    "embedding": [0.023, -0.456, 0.789, ...] // 384 dimensions
  },
  "data_scientist": {
    "name": "Data Scientist",
    "keywords": ["Python", "pandas", "scikit-learn", "TensorFlow", "PyTorch",
                 "statistics", "SQL", "visualization", "Tableau", "A/B testing"],
    "embedding": [0.567, 0.234, -0.123, ...]
  },
  // ... 8 total roles
}
```

#### Simple Analysis Implementation

```javascript
// server/services/simpleAnalyzer.js

import { pipeline } from '@xenova/transformers';
import ROLE_PROFILES from './roles_embeddings.json';

let embedder = null;

// Load model ONCE when server starts (~10 sec first time, cached after)
export async function initializeEmbedder() {
  console.log('Loading embedding model...');
  embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  console.log('Model ready!');
}

// Main analysis function - NO external API calls
export async function runSimpleAnalysis(resumeText, selectedRole) {
  const roleProfile = ROLE_PROFILES[selectedRole];
  
  // 1. EMBEDDING SIMILARITY (Local ML)
  const resumeEmbedding = await getLocalEmbedding(resumeText);
  const similarityScore = cosineSimilarity(resumeEmbedding, roleProfile.embedding) * 100;
  
  // 2. KEYWORD MATCHING (String comparison)
  const resumeLower = resumeText.toLowerCase();
  const matchedKeywords = roleProfile.keywords.filter(k => 
    resumeLower.includes(k.toLowerCase())
  );
  const missingKeywords = roleProfile.keywords.filter(k => 
    !resumeLower.includes(k.toLowerCase())
  );
  const keywordScore = (matchedKeywords.length / roleProfile.keywords.length) * 100;
  
  // 3. SECTION DETECTION (Regex)
  const sections = {
    hasEducation: /education|academic|university/i.test(resumeText),
    hasExperience: /experience|work|internship/i.test(resumeText),
    hasProjects: /projects|portfolio/i.test(resumeText),
    hasSkills: /skills|technologies/i.test(resumeText),
  };
  
  // 4. ACTION VERB ANALYSIS (Local NLP)
  const weakVerbs = ['made', 'did', 'worked', 'helped', 'was', 'used'];
  const strongVerbs = ['built', 'designed', 'developed', 'implemented', 
                       'architected', 'optimized', 'led', 'created'];
  const foundWeak = weakVerbs.filter(v => resumeLower.includes(v));
  const foundStrong = strongVerbs.filter(v => resumeLower.includes(v));
  
  // 5. QUANTIFICATION CHECK (Regex)
  const hasNumbers = /\d+%|\d+\+|\$\d+|\d+ users|\d+x/gi.test(resumeText);
  
  // CALCULATE FINAL SCORE
  const overallScore = (similarityScore * 0.4) + (keywordScore * 0.4) + 
                       (foundStrong.length > foundWeak.length ? 20 : 10);
  
  return {
    overallScore: Math.min(100, Math.round(overallScore)),
    similarityScore: Math.round(similarityScore),
    keywordScore: Math.round(keywordScore),
    matchedKeywords,
    missingKeywords,
    sections,
    actionVerbs: { strong: foundStrong, weak: foundWeak },
    hasQuantification: hasNumbers,
    analysisType: 'simple'
  };
}

// Helper: Generate embedding locally
async function getLocalEmbedding(text) {
  const output = await embedder(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

// Helper: Cosine similarity
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

#### Deep Analysis: When to Use Gemini API

Only called when user explicitly clicks "Deep Analysis":

```javascript
// server/services/deepAnalyzer.js

import { GoogleGenerativeAI } from "@google/generative-ai";
import { runSimpleAnalysis } from './simpleAnalyzer.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function runDeepAnalysis(resumeText, selectedRole, userId) {
  
  // 1. Check rate limit (3 per day free)
  const usageToday = await redis.get(`deep_analysis:${userId}:${today}`);
  if (usageToday >= 3) {
    return { error: "Daily limit reached. Try again tomorrow!" };
  }
  
  // 2. First, run simple analysis
  const simpleResults = await runSimpleAnalysis(resumeText, selectedRole);
  
  // 3. Call Gemini for AI-powered insights
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `
You are a resume expert. Analyze this ${selectedRole} resume and provide:
1. 3 specific suggestions to improve it
2. 2 bullet points that could be rewritten better (provide the rewrite)
3. Any grammar or tone issues
4. What's missing for this role

Resume:
${resumeText}

Return as JSON:
{
  "suggestions": ["...", "...", "..."],
  "rewrites": [{"original": "...", "improved": "..."}, ...],
  "grammarIssues": ["..."],
  "missingElements": ["..."]
}`;

  const result = await model.generateContent(prompt);
  const aiResponse = JSON.parse(result.response.text());
  
  // 4. Increment usage counter
  await redis.incr(`deep_analysis:${userId}:${today}`);
  await redis.expire(`deep_analysis:${userId}:${today}`, 86400);
  
  return {
    ...simpleResults,
    aiSuggestions: aiResponse.suggestions,
    aiRewrites: aiResponse.rewrites,
    grammarIssues: aiResponse.grammarIssues,
    missingElements: aiResponse.missingElements,
    analysisType: 'deep',
    remainingDeepAnalyses: 3 - (usageToday + 1)
  };
}
```

#### Complete Analysis Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  USER: Selects Role + Uploads Resume                                │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  SIMPLE ANALYSIS (Always Runs First - FREE)                         │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  1. PDF → Text (pdf-parse)                                      ││
│  │  2. Local Embedding (@xenova/transformers) ← NO API             ││
│  │  3. Keyword Match (string match)                                ││
│  │  4. Verb Analysis (compromise.js)                               ││
│  │  5. Cosine Similarity (pure math)                               ││
│  └─────────────────────────────────────────────────────────────────┘│
│                              │                                      │
│                              ▼                                      │
│           ┌────────────────────────────────┐                       │
│           │    SHOW SIMPLE RESULTS         │                       │
│           │    Score: 82% | Missing: 3     │                       │
│           └────────────────────────────────┘                       │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  [🔮 Get AI-Powered Deep Analysis]                              ││
│  │  (2/3 free analyses remaining today)                            ││
│  └─────────────────────────────────────────────────────────────────┘│
│                              │                                      │
│                              ▼ (only if user clicks)                │
│  DEEP ANALYSIS (OPTIONAL - Uses Gemini API)                         │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  • Simple Results + Gemini API call                             ││
│  │  • AI Suggestions, Rewrites, Grammar Check                      ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

#### Cost Comparison

| Approach | API Calls/Analysis | Monthly Cost (200 users × 5 each) |
|----------|-------------------|-----------------------------------|
| **All AI (Naive)** | 1 LLM call | $10-25 |
| **Our Hybrid** | 0.3 LLM calls (avg) | $3 |
| **Simple Only** | 0 | $0 |

#### Supported Roles (Initial Launch)

| Role | Keywords Count | Pre-computed |
|------|---------------|--------------|
| 💻 SDE | 15 keywords | ✅ |
| 📊 Data Scientist | 15 keywords | ✅ |
| 🤖 ML Engineer | 15 keywords | ✅ |
| 🎨 Frontend Developer | 12 keywords | ✅ |
| ⚙️ Backend Developer | 12 keywords | ✅ |
| 📱 App Developer | 12 keywords | ✅ |
| 🛠️ DevOps Engineer | 14 keywords | ✅ |
| 📋 Product Manager | 10 keywords | ✅ |
| 🔧 Other (Custom JD) | User-provided | Computed on-the-fly |

---

### Page 4: Dashboard (My Resumes)

**Goal:** Central hub for resume management.

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo]    My Resumes    [Profile ▼]                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Hello, Ritesh! 👋                        [+ Create New Resume]     │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │ 📄              │  │ 📄              │  │ 📄              │     │
│  │ SDE Resume      │  │ Data Science    │  │ Product Mgmt    │     │
│  │                 │  │ Resume          │  │ Resume          │     │
│  │ Last edited:    │  │ Last edited:    │  │ Last edited:    │     │
│  │ 2 days ago      │  │ 1 week ago      │  │ 3 weeks ago     │     │
│  │                 │  │                 │  │                 │     │
│  │ [Edit] [↓] [🗑️]│  │ [Edit] [↓] [🗑️]│  │ [Edit] [↓] [🗑️]│     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. Technical Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with SSR/SSG |
| **TypeScript** | Type safety |
| **TailwindCSS** | Utility-first styling |
| **Zustand** | Lightweight state management |
| **React Hook Form** | Form handling |
| **Zod** | Schema validation |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js + Express** | API server |
| **TypeScript** | Type safety |
| **LaTeX (pdflatex)** | PDF generation |
| **pdf-parse** | PDF text extraction |
| **@xenova/transformers** | Local ML embeddings (Simple Analysis) |
| **compromise** | Local NLP for verb analysis |
| **Gemini API** | AI-powered suggestions (Deep Analysis) |

### Database & Storage
| Technology | Purpose |
|------------|---------|
| **MongoDB** | User data, resume data |
| **Redis** | Session caching, rate limiting |
| **AWS S3 / Cloudinary** | PDF storage |

### DevOps
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **GitHub Actions** | CI/CD |
| **Vercel** | Frontend hosting |
| **Railway / Render** | Backend hosting |

---

## 6. Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String,                    // College email
  name: String,
  profileImage: String,
  authProvider: "google",
  createdAt: Date,
  updatedAt: Date,
  
  // Master Profile (pre-filled data)
  masterProfile: {
    personalInfo: {
      phone: String,
      linkedin: String,
      github: String,
      portfolio: String,
      codeforces: String
    },
    education: [{
      institution: String,
      branch: String,
      cgpa: Number,
      startYear: Number,
      endYear: Number
    }],
    skills: {
      languages: [String],
      frameworks: [String],
      tools: [String],
      databases: [String]
    }
  }
}
```

### Resumes Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,                 // Reference to user
  name: String,                     // "SDE Resume", "DS Resume"
  version: Number,
  
  content: {
    personalInfo: {...},
    education: [...],
    experience: [...],
    projects: [...],
    skills: {...},
    achievements: [...],
    certifications: [...],
    pors: [...]
  },
  
  pdfUrl: String,                   // S3 URL to generated PDF
  templateId: String,               // Which LaTeX template used
  
  createdAt: Date,
  updatedAt: Date
}
```

### AnalysisReports Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  resumeId: ObjectId,
  jobDescription: String,
  
  results: {
    overallScore: Number,           // 0-100
    keywordScore: Number,
    matchedKeywords: [String],
    missingKeywords: [String],
    actionVerbScore: Number,
    weakVerbs: [String],
    strongVerbs: [String],
    suggestions: [String]
  },
  
  createdAt: Date
}
```

---

## 7. API Design

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/google` | GET | Initiate Google OAuth |
| `/api/auth/callback` | GET | OAuth callback |
| `/api/auth/logout` | POST | Logout user |
| `/api/auth/me` | GET | Get current user |

### Resumes
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/resumes` | GET | Get all user resumes |
| `/api/resumes` | POST | Create new resume |
| `/api/resumes/:id` | GET | Get single resume |
| `/api/resumes/:id` | PUT | Update resume |
| `/api/resumes/:id` | DELETE | Delete resume |
| `/api/resumes/:id/generate-pdf` | POST | Generate PDF |
| `/api/resumes/:id/download` | GET | Download PDF |

### Analyzer
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze/simple` | POST | Simple analysis (free, unlimited) |
| `/api/analyze/deep` | POST | Deep AI analysis (3/day free) |
| `/api/analyze/parse-pdf` | POST | Extract text from PDF |
| `/api/analyze/history` | GET | Get analysis history |
| `/api/analyze/usage` | GET | Check remaining deep analyses |
| `/api/roles` | GET | Get all supported roles with keywords |

### Master Profile
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/profile` | GET | Get master profile |
| `/api/profile` | PUT | Update master profile |

---

## 8. User Flows

### Flow 1: First-Time User
```
Landing Page → Google Login → Dashboard (Empty) → Create New →
Builder Page → Fill Form → Preview → Download PDF → Dashboard (1 Resume)
```

### Flow 2: Returning User
```
Landing Page → Google Login → Dashboard → Select Resume →
Builder Page → Edit → Download Updated PDF
```

### Flow 3: Analyzer Flow
```
Landing Page → Analyzer Page → Paste JD + Upload Resume →
View Report → Get Suggestions → Go to Builder → Make Changes
```

---

## 9. Security Considerations

### Authentication
- ✅ Google OAuth 2.0 (college email enforcement)
- ✅ JWT tokens with short expiry (15 min access, 7 day refresh)
- ✅ Secure HTTP-only cookies

### Data Protection
- ✅ HTTPS everywhere
- ✅ Input sanitization (prevent XSS)
- ✅ Rate limiting (prevent abuse)
- ✅ PDF files auto-delete after 24 hours

### Access Control
- ✅ Users can only access their own resumes
- ✅ Admin panel for Placement Cell (future)

---

## 10. Deployment Strategy

### Phase 1: Development (Week 1-2)
- Local development with Docker
- MongoDB Atlas (free tier)
- Cloudinary (free tier for PDFs)

### Phase 2: Staging (Week 3)
- Deploy backend to Railway
- Deploy frontend to Vercel
- Integration testing

### Phase 3: Production (Week 4)
- Custom domain (c2cresume.mnit.ac.in)
- SSL certificate
- Monitoring with Sentry

---

## 11. Future Roadmap

### Phase 2 Features
- [ ] **Multiple Templates** — Different designs for different industries
- [ ] **Resume Versioning** — Git-like version history
- [ ] **Bulk Export** — Placement Cell can export all resumes as ZIP
- [ ] **Analytics Dashboard** — Track resume downloads, views

### Phase 3 Features
- [ ] **AI Cover Letter** — Auto-generate cover letters
- [ ] **LinkedIn Import** — One-click import from LinkedIn
- [ ] **Interview Prep** — Common questions based on resume
- [ ] **Peer Review** — Students review each other's resumes

---

## 12. Success Metrics

### KPIs to Track
| Metric | Target | How to Measure |
|--------|--------|----------------|
| **User Signups** | 200+ in first month | Auth logs |
| **Resumes Generated** | 500+ in first month | Database count |
| **PDF Downloads** | 80% of created resumes | Download logs |
| **Analysis Usage** | 50% of users try analyzer | API logs |
| **Return Users** | 60% come back within a week | Session tracking |

### Technical KPIs
| Metric | Target |
|--------|--------|
| **PDF Generation Time** | < 5 seconds |
| **Page Load Time** | < 2 seconds |
| **Uptime** | 99.5% |
| **API Response Time** | < 200ms (avg) |

---

## 📝 Notes for Further Development

> **Add your inputs below this section. Mark items with [TODO] that need discussion.**

### Open Questions
- [ ] Should we support Hindi resumes?
- [ ] Integration with LinkedIn for auto-fill?
- [ ] Should Placement Cell have admin access?
- [ ] Mobile app needed or PWA sufficient?

---

*Last Updated: January 2026*  
*Version: 1.0.0*  
*Maintained by: C2C Club, MNIT Jaipur*
