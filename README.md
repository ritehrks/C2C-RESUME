# C2C Resume Platform

A modern, full-stack resume builder with ATS optimization powered by AI.

<p align="center">
  <img src="client/public/logo-v2.png" alt="C2C Logo" width="200">
</p>

## ✨ Features

### 📄 Resume Builder
- Intuitive form-based resume creation
- Real-time LaTeX PDF generation
- Multiple template support
- Auto-save with version tracking

### 📊 ATS Analyzer
- **Simple Analysis**: Keyword matching, action verb detection
- **Deep AI Analysis**: Gemini-powered insights with personalized feedback
- Match percentage scoring
- Actionable improvement suggestions

### 📁 Dashboard
- View all your resumes in one place
- Quick edit and delete
- Template preview
- Last modified tracking

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
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

### Configuration

**Server (`server/.env`):**
```env
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/c2c-resume

# Optional: For AI-powered analysis
GOOGLE_API_KEY=your_gemini_api_key
```

**Client (`client/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Running the Application

```bash
# Terminal 1: Start MongoDB (if local)
mongod

# Terminal 2: Start Backend
cd server
npm run dev

# Terminal 3: Start Frontend
cd client
npm run dev
```

**Access:**
- 🌐 Frontend: http://localhost:3000
- 🔌 API: http://localhost:5000
- ❤️ Health: http://localhost:5000/health

---

## 📁 Project Structure

```
C2C-RESUME/
├── client/                 # Next.js Frontend (Port 3000)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (dashboard)/dashboard/  # Resume dashboard
│   │   │   ├── analyzer/               # ATS analyzer
│   │   │   ├── builder/                # Resume builder
│   │   │   └── page.tsx                # Landing page
│   │   └── lib/
│   │       └── api.ts                  # API service
│   └── public/                         # Static assets
│
├── server/                 # Express Backend (Port 5000)
│   ├── src/
│   │   ├── controllers/                # Request handlers
│   │   ├── models/                     # Mongoose schemas
│   │   ├── routes/                     # API routes
│   │   └── services/
│   │       ├── ai/                     # Gemini integration
│   │       └── latex/                  # PDF generation
│   └── .env                            # Environment config
│
├── IMPLEMENTATION_DOCS.md  # Detailed documentation
└── README.md               # This file
```

---

## 🔌 API Endpoints

### Resumes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resumes` | List all resumes |
| GET | `/api/resumes/:id` | Get single resume |
| POST | `/api/resumes` | Create resume |
| PUT | `/api/resumes/:id` | Update resume |
| DELETE | `/api/resumes/:id` | Delete resume |
| POST | `/api/resumes/generate-pdf` | Generate PDF |

### Analyzer
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze/simple` | Quick keyword analysis |
| POST | `/api/analyze/deep` | AI-powered analysis |

---

## 🤖 AI Features

To enable Gemini AI-powered deep analysis:

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add to `server/.env`:
   ```env
   GOOGLE_API_KEY=your_api_key_here
   ```
3. Restart the server

### What Deep Analysis Provides:
- Overall resume assessment
- Strengths and improvement areas
- Keyword optimization with context tips
- Content suggestions for each section
- Competitive edge insights
- Step-by-step action plan

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS |
| Backend | Express.js, TypeScript, Node.js |
| Database | MongoDB, Mongoose |
| AI | Google Gemini API |
| PDF | LaTeX templates |
| Icons | Material Symbols |

---

## 📝 Usage

### Creating a Resume
1. Go to Dashboard → Click "Create New Resume"
2. Fill in your details in the builder
3. Click "Save New" to save to database
4. Click "Download PDF" to generate your resume

### Analyzing Your Resume
1. Go to ATS Analyzer
2. Paste the target job description
3. Paste your resume text
4. Choose Simple or Deep Analysis
5. Review feedback and improve your resume

---

## 📚 Documentation

For detailed implementation documentation, see:
- [IMPLEMENTATION_DOCS.md](./IMPLEMENTATION_DOCS.md) - Complete technical documentation
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - Project roadmap and phases

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  Made with ❤️ by the C2C Team
</p>
