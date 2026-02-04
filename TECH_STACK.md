# C2C Resume Platform - Tech Stack Documentation

A comprehensive overview of all technologies, frameworks, and libraries used in this project.

---

## 📁 Project Architecture

```
C2C-RESUME/
├── client/          # Next.js Frontend (React 19)
├── server/          # Express.js Backend (Node.js)
└── [shared assets]  # Logos, templates, documentation
```

---

## 🎨 Frontend (Client)

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.6 | React framework with SSR, routing, and optimization |
| **React** | 19.2.3 | UI library for building component-based interfaces |
| **React DOM** | 19.2.3 | React rendering for web browsers |
| **TypeScript** | ^5.x | Static type checking |

### Styling
| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | ^4.x | Utility-first CSS framework |
| **@tailwindcss/forms** | ^0.5.11 | Form element styling |
| **@tailwindcss/typography** | ^0.5.19 | Prose/content styling |
| **@tailwindcss/container-queries** | ^0.1.1 | Container-based responsive design |
| **Material Symbols** | (CDN) | Google's icon library |

### PDF Generation
| Technology | Version | Purpose |
|------------|---------|---------|
| **jsPDF** | ^4.1.0 | Client-side PDF generation |
| **html2canvas** | ^1.4.1 | HTML to canvas screenshot (PDF fallback) |

### Development Tools
| Technology | Version | Purpose |
|------------|---------|---------|
| **ESLint** | ^9.x | Code linting |
| **eslint-config-next** | 16.1.6 | Next.js ESLint rules |
| **@types/react** | ^19.x | TypeScript definitions for React |

---

## 🔧 Backend (Server)

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **Express.js** | ^4.18.2 | Web framework for REST APIs |
| **TypeScript** | ^5.3.0 | Static type checking |
| **tsx** | ^4.6.0 | TypeScript execution (dev mode) |

### Database & Caching
| Technology | Version | Purpose |
|------------|---------|---------|
| **MongoDB** | (via Mongoose) | NoSQL document database |
| **Mongoose** | ^8.0.0 | MongoDB ODM (Object Document Mapper) |
| **Redis** | (via ioredis) | In-memory caching & sessions |
| **ioredis** | ^5.3.2 | Redis client for Node.js |

### Authentication & Security
| Technology | Version | Purpose |
|------------|---------|---------|
| **jsonwebtoken** | ^9.0.3 | JWT token generation & verification |
| **bcryptjs** | ^2.4.3 | Password hashing |
| **CORS** | ^2.8.5 | Cross-Origin Resource Sharing |

### AI & Machine Learning
| Technology | Version | Purpose |
|------------|---------|---------|
| **@google/generative-ai** | ^0.24.1 | Google Gemini AI for resume analysis |
| **@xenova/transformers** | ^2.17.2 | ML embeddings for semantic similarity |
| **compromise** | ^14.10.0 | Natural Language Processing (NLP) |

### File Processing
| Technology | Version | Purpose |
|------------|---------|---------|
| **multer** | ^1.4.5-lts.1 | File upload handling (multipart/form-data) |
| **pdf-parse** | ^1.1.1 | PDF text extraction |
| **mustache** | ^4.2.0 | LaTeX template rendering |

### PDF Generation (Server)
| Technology | Version | Purpose |
|------------|---------|---------|
| **LaTeX** | (External) | High-quality PDF generation |
| **Overleaf API** | (External) | LaTeX compilation service |

### Utilities
| Technology | Version | Purpose |
|------------|---------|---------|
| **uuid** | ^9.0.0 | Unique ID generation |
| **dotenv** | ^16.3.1 | Environment variable management |

### Testing & Development
| Technology | Version | Purpose |
|------------|---------|---------|
| **Jest** | ^30.2.0 | Testing framework |
| **ts-jest** | ^29.4.6 | TypeScript Jest transformer |
| **supertest** | ^7.2.2 | API endpoint testing |
| **ESLint** | ^8.55.0 | Code linting |

---

## 🗄️ Database Schema (MongoDB)

### Collections
| Collection | Purpose |
|------------|---------|
| **users** | User accounts and profiles |
| **resumes** | Resume documents and versions |
| **analysisreports** | ATS analysis results |
| **analytics** | Usage tracking and stats |

---

## 🔐 Authentication Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Client     │────▶│   Express    │────▶│   MongoDB    │
│  (Next.js)   │     │   (JWT)      │     │   (Users)    │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │
       │              ┌─────▼─────┐
       └──────────────│   Redis   │
                      │  (Cache)  │
                      └───────────┘
```

- **Email/Password**: bcrypt hashing + JWT tokens
- **Google OAuth**: OAuth 2.0 flow (optional)
- **Session**: JWT stored in localStorage, verified on each request

---

## 📊 Resume Analysis Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    RESUME ANALYSIS                           │
├─────────────────────────────────────────────────────────────┤
│  1. PDF Upload ──▶ multer (file handling)                   │
│  2. Text Extraction ──▶ pdf-parse                           │
│  3. NLP Processing ──▶ compromise (tokenization)            │
│  4. Embedding Generation ──▶ @xenova/transformers           │
│  5. Similarity Matching ──▶ Cosine similarity               │
│  6. AI Analysis ──▶ Google Gemini (deep insights)           │
│  7. Score Calculation ──▶ Weighted algorithm                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Design System

### Colors (Tailwind Custom)
| Variable | Value | Usage |
|----------|-------|-------|
| `app-primary` | `#4f5fff` | Primary brand color |
| `app-primary-light` | `#6b7fff` | Hover states |
| `app-primary-dark` | `#3d4ecc` | Active states |

### Typography
| Font | Usage |
|------|-------|
| **Inter** | UI elements, buttons |
| **System fonts** | Fallback stack |

### Icons
| Library | Usage |
|---------|-------|
| **Material Symbols Outlined** | Navigation, actions |
| **Custom SVGs** | Brand assets |

---

## 🚀 Deployment Requirements

### Environment Variables

**Client (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Server (.env)**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/c2c-resume
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### System Requirements
- Node.js 18+
- MongoDB 6+
- Redis 7+
- LaTeX distribution (for PDF generation)

---

## 📦 Scripts

### Client
```bash
npm run dev      # Development server (hot reload)
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

### Server
```bash
npm run dev      # Development with tsx watch
npm run build    # Compile TypeScript
npm start        # Run compiled JavaScript
npm run lint     # Run ESLint
```

---

## 🔗 API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| GET | `/api/resumes` | Get user's resumes |
| POST | `/api/resumes` | Create/save resume |
| POST | `/api/analyze/simple` | Quick ATS analysis |
| POST | `/api/analyze/deep` | AI-powered deep analysis |
| POST | `/api/pdf/generate` | Generate PDF from resume |
| GET | `/api/stats` | Admin analytics |

---

*Last Updated: February 2026*
*Author: C2C Club MNIT*
