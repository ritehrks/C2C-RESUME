# C2C Resume Platform

<p align="center">
  <img src="client/public/logo-v2.png" alt="C2C Logo" width="200">
</p>

<p align="center">
  <strong>Official LaTeX-based Resume Builder for MNIT Jaipur</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#tech-stack">Tech Stack</a>
</p>

---

## ✨ Features

### 📄 Resume Builder
- **Two Professional Templates:**
  - **MNIT Official** - Optimized for MNIT students with college branding
  - **Generic ATS** - Universal format for any industry/institution
- Real-time LaTeX PDF generation
- **PDF Preview Modal** - View PDF before downloading
- Auto-save with version tracking
- Intuitive form-based editing

### 👤 User Profile & Authentication
- **Google OAuth 2.0** authentication
- **Master Profile** - Store reusable data (personal info, education, skills)
- Development mode with mock user (no login required locally)
- JWT-based session management

### 📊 ATS Analyzer
- **Simple Analysis** (Instant, local):
  - Keyword matching
  - Action verb detection
  - Section analysis
  - Semantic similarity scoring
- **Deep AI Analysis** (Gemini-powered):
  - Personalized content suggestions
  - Industry-specific recommendations
  - ATS optimization tips

### 📁 Dashboard
- View all resumes in one place
- Quick edit, delete, and duplicate
- Template badge indicators
- Last modified tracking

---

## 🚀 Quick Start

### Prerequisites
- Node.js v20+
- MongoDB (local or Atlas)
- LaTeX distribution (pdflatex)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd C2C-RESUME

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Environment Setup

**Server (.env):**
```env
MONGODB_URI=mongodb://localhost:27017/c2c-resume
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-key
NODE_ENV=development
PORT=5000
```

**Client (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Run Development Servers

```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

---

## 📚 Documentation

For comprehensive technical documentation, see **[DOCUMENTATION.md](./DOCUMENTATION.md)** which includes:

- 🏗 System Architecture
- 📚 API Documentation
- 🗄 Database Schema
- 🔐 Authentication Flow
- ⚙️ Environment Variables
- 🗺 Future Roadmap

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 16 | React framework with App Router |
| TypeScript | Type safety |
| Tailwind CSS 4 | Utility-first styling |
| React 19 | UI library |

### Backend
| Technology | Purpose |
|------------|---------|
| Express.js | Web framework |
| TypeScript | Type safety |
| Mongoose | MongoDB ODM |
| jsonwebtoken | JWT authentication |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| MongoDB | Primary database |
| Redis | Rate limiting |
| Gemini API | AI analysis |
| LaTeX | PDF generation |

---

## 📂 Project Structure

```
C2C-RESUME/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   │   ├── (dashboard)/ 
│   │   │   │   ├── dashboard/
│   │   │   │   └── profile/
│   │   │   ├── analyzer/
│   │   │   ├── builder/
│   │   │   └── page.tsx   # Landing page
│   │   └── lib/           # API utilities
│   └── public/            # Static assets
│
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API routes
│   │   └── services/      # Business logic
│   │       ├── analyzer/  # Analysis engines
│   │       └── latex/     # PDF generation
│   └── templates/         # LaTeX templates
│
├── DOCUMENTATION.md        # Technical docs
└── README.md              # This file
```

---

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/google` | Initiate OAuth |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| GET | `/api/resumes` | List resumes |
| POST | `/api/resumes` | Create resume |
| PUT | `/api/resumes/:id` | Update resume |
| DELETE | `/api/resumes/:id` | Delete resume |
| POST | `/api/resumes/generate-pdf` | Generate PDF |
| POST | `/api/analyze/simple` | Simple analysis |
| POST | `/api/analyze/deep` | AI analysis |

---

## 🗺 Roadmap

### ✅ Phase 1 (Complete)
- Resume Builder with 2 templates
- PDF generation with LaTeX
- Simple & Deep analysis
- User authentication
- Master profile management
- PDF preview modal

### 🔄 Phase 2 (In Progress)
- [ ] DOCX export
- [ ] JSON export/import
- [ ] Analysis history
- [ ] Resume versioning

### 📋 Phase 3 (Planned)
- [ ] LinkedIn import
- [ ] Job matching
- [ ] Mobile app

---

## 📝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary software developed for MNIT Jaipur Placement Cell.

---

<p align="center">
  <strong>Built with ❤️ for MNIT Jaipur</strong>
</p>
