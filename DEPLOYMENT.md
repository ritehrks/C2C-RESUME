# C2C Resume Platform - Deployment Guide

Step-by-step guide to deploy the C2C Resume Platform to production.

---

## 📋 Prerequisites

- **Node.js** 18+ installed
- **MongoDB Atlas** account (free tier works)
- **Google Cloud Console** project (for Gemini API & OAuth)
- **Hosting accounts:**
  - Frontend: [Vercel](https://vercel.com) (recommended) or Netlify
  - Backend: [Render](https://render.com) (recommended), Railway, or Heroku

---

## 🗄️ Step 1: Database Setup (MongoDB Atlas)

Your MongoDB is already configured at:
```
mongodb+srv://riteshnew6gemini_db_user:***@cluster0.xmvjqhy.mongodb.net/
```

### If setting up new:
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free cluster
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (allow all for production)
5. Get connection string

---

## 🔧 Step 2: Deploy Backend (Render.com - Recommended)

### 2.1 Push to GitHub
Your code is already at: `github.com/ritehrks/C2C-RESUME`

### 2.2 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### 2.3 Create Web Service
1. Click **"New" → "Web Service"**
2. Connect your GitHub repo
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `c2c-resume-server` |
| **Root Directory** | `server` |
| **Environment** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | Free |

### 2.4 Add Environment Variables
In Render dashboard → Environment → Add these:

```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://riteshnew6gemini_db_user:1Nr6EdMNk3ykqehK@cluster0.xmvjqhy.mongodb.net/?appName=Cluster0
GOOGLE_API_KEY=AIzaSyDDi_svpY4-wqLoCfgp6hzZHbfjsW1byBo
GOOGLE_CLIENT_ID=485473158180-lhaovkgpu1sh3volt5464g13ebm3sm10.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### 2.5 Deploy
Click **"Create Web Service"** - Render will auto-deploy.

Your backend URL will be: `https://c2c-resume-server.onrender.com`

---

## 🎨 Step 3: Deploy Frontend (Vercel - Recommended)

### 3.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### 3.2 Import Project
1. Click **"Add New" → "Project"**
2. Import `ritehrks/C2C-RESUME`
3. Configure:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `client` |
| **Build Command** | `npm run build` |
| **Output Directory** | `.next` |

### 3.3 Add Environment Variables
```
NEXT_PUBLIC_API_URL=https://c2c-resume-server.onrender.com
```

> ⚠️ **Important**: Replace with your actual Render backend URL

### 3.4 Deploy
Click **"Deploy"** - takes ~2 minutes.

Your frontend URL will be: `https://c2c-resume.vercel.app`

---

## 🔐 Step 4: Update OAuth Redirect URLs

After deployment, update Google OAuth settings:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services → Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add **Authorized redirect URIs**:
   ```
   https://c2c-resume.vercel.app/auth/callback
   https://c2c-resume-server.onrender.com/api/auth/google/callback
   ```
5. Add **Authorized JavaScript origins**:
   ```
   https://c2c-resume.vercel.app
   ```

---

## 🔗 Step 5: Update Backend CORS

Update your server to allow the new frontend URL:

In `server/src/index.ts`, ensure CORS includes:
```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://c2c-resume.vercel.app'  // Add your Vercel URL
  ],
  credentials: true
}));
```

Also update `CLIENT_URL` in Render environment:
```
CLIENT_URL=https://c2c-resume.vercel.app
API_URL=https://c2c-resume-server.onrender.com
```

---

## ✅ Step 6: Verify Deployment

### Test Checklist:
- [ ] Frontend loads at Vercel URL
- [ ] Can register/login
- [ ] Dashboard shows user data
- [ ] Resume builder works
- [ ] ATS analyzer works
- [ ] PDF download works
- [ ] Google OAuth works

---

## 🔄 Continuous Deployment

Both Vercel and Render auto-deploy on `git push`:

```bash
# Push changes to deploy
git add -A
git commit -m "Update feature"
git push origin main
```

- **Render**: Rebuilds backend automatically
- **Vercel**: Rebuilds frontend automatically

---

## 📊 Monitoring

### Render Dashboard
- View logs: **Logs** tab
- Check metrics: **Metrics** tab
- Manual redeploy: **Manual Deploy** button

### Vercel Dashboard
- View deployments: **Deployments** tab
- Check analytics: **Analytics** tab
- View logs: **Functions** → **Logs**

---

## 🚨 Troubleshooting

### Backend not starting?
1. Check Render logs for errors
2. Verify all environment variables are set
3. Check MongoDB whitelist includes `0.0.0.0/0`

### Frontend API errors?
1. Verify `NEXT_PUBLIC_API_URL` is correct
2. Check backend CORS includes frontend URL
3. Ensure backend is running (check Render status)

### OAuth not working?
1. Verify redirect URIs in Google Console
2. Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
3. Ensure frontend URL is in authorized origins

---

## 💰 Cost Breakdown (Free Tier)

| Service | Plan | Cost |
|---------|------|------|
| MongoDB Atlas | M0 (Free) | $0/month |
| Render.com | Free | $0/month (spins down after 15min inactivity) |
| Vercel | Hobby | $0/month |
| Google Gemini API | Free tier | $0/month (limited requests) |

**Total: $0/month** (for low traffic)

> ⚠️ **Note**: Render free tier spins down after 15 minutes of inactivity. First request after sleep takes ~30 seconds.

---

## 🚀 Production Upgrade Path

When ready for production:

| Service | Paid Plan | Cost |
|---------|-----------|------|
| Render | Starter | $7/month (no sleep) |
| Vercel | Pro | $20/month (more builds) |
| MongoDB | M2 | $9/month (more storage) |

---

## 📝 Quick Commands Reference

```bash
# Local development
cd server && npm run dev    # Backend on :5000
cd client && npm run dev    # Frontend on :3000

# Build for production
cd server && npm run build
cd client && npm run build

# Push to deploy
git add -A && git commit -m "message" && git push
```

---

*Last Updated: February 2026*
