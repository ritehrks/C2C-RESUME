# NIT-Only Google OAuth Authentication System

This document describes the authentication system for the C2C Resume Platform, which **only allows email addresses from National Institutes of Technology (NITs)**.

---

## 📋 Overview

The authentication system uses Google OAuth 2.0 with domain validation to ensure only NIT students and faculty can access the platform.

### Key Features
- ✅ **Google Sign-In Only** - No manual registration
- ✅ **NIT Domain Validation** - Only @mnit.ac.in, @nitj.ac.in, etc.
- ✅ **JWT Tokens** - Secure, stateless authentication
- ✅ **Token-based Flow** - Modern @react-oauth/google integration

---

## 🔧 Configuration

### Backend Environment Variables (`.env`)

```env
# Server Configuration
PORT=5000
NODE_ENV=production
API_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000

# JWT Secret (change this in production!)
JWT_SECRET=your-super-secret-jwt-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# MongoDB
MONGODB_URI=mongodb://localhost:27017/c2c-resume
```

### Frontend Environment Variables (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

## 🏫 Supported NIT Domains

The system supports the following NIT email domains:

| NIT | Domain |
|-----|--------|
| MNIT Jaipur | `@mnit.ac.in` |
| NIT Jalandhar | `@nitj.ac.in` |
| NIT Trichy | `@nitt.edu` |
| NIT Warangal | `@nitw.ac.in` |
| NIT Karnataka | `@nitk.edu.in` |
| NIT Calicut | `@nitc.ac.in` |
| NIT Rourkela | `@nitr.ac.in` |
| NIT Silchar | `@nits.ac.in` |
| NIT Durgapur | `@nitdgp.ac.in` |
| NIT Agartala | `@nita.ac.in` |
| MNNIT Allahabad | `@mnnit.ac.in` |
| SVNIT Surat | `@svnit.ac.in` |
| VNIT Nagpur | `@vnit.ac.in` |
| +20 more NITs | See `authController.ts` |

### Adding New Domains

To add a new NIT domain, edit `server/src/controllers/authController.ts`:

```typescript
const ALLOWED_NIT_DOMAINS = [
    'mnit.ac.in',
    'nitj.ac.in',
    // Add your new domain here
    'newniit.ac.in',
];
```

---

## 🔐 Authentication Flow

### 1. Frontend (Login Page)
```
User clicks "Sign in with Google"
      ↓
Google OAuth popup opens
      ↓
User selects their NIT Google account
      ↓
Google returns ID token (credential)
      ↓
Frontend sends token to backend
```

### 2. Backend (Auth Controller)
```
Receive Google ID token
      ↓
Verify token with Google OAuth2Client
      ↓
Extract email from token payload
      ↓
⭐ VALIDATE NIT DOMAIN
      ↓
If valid: Create/update user → Return JWT
If invalid: Return 403 Forbidden
```

### 3. Subsequent Requests
```
Frontend includes JWT in Authorization header
      ↓
Backend middleware validates JWT
      ↓
Request proceeds if valid
```

---

## 📁 File Structure

```
server/src/
├── controllers/
│   └── authController.ts    # ⭐ Main auth logic with NIT validation
├── middleware/
│   └── auth.ts              # JWT verification middleware
├── models/
│   └── User.ts              # User schema with googleId field
└── routes/
    └── auth.ts              # Auth endpoints

client/src/
├── app/
│   ├── login/
│   │   └── page.tsx         # Login page with GoogleLogin
│   ├── signup/
│   │   └── page.tsx         # Signup page (redirects to Google)
│   └── auth/
│       └── callback/
│           └── page.tsx     # OAuth callback handler
└── lib/
    └── api.ts               # Auth API functions
```

---

## 🔌 API Endpoints

### POST `/api/auth/google`
Main authentication endpoint. Validates Google token and NIT domain.

**Request:**
```json
{
  "credential": "eyJhbGciOiJSUzI1NiIsInR5cCI6Ikp..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful. Welcome back!",
  "isNewUser": false,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp...",
  "user": {
    "id": "64f8a2...",
    "name": "Ritesh Saini",
    "email": "2022uec5234@mnit.ac.in",
    "profileImage": "https://lh3.googleusercontent.com/...",
    "role": "user",
    "isEmailVerified": true
  }
}
```

**Error Response (403 - Non-NIT Email):**
```json
{
  "success": false,
  "message": "Only NIT email addresses are allowed to login. Please use your official NIT email (@mnit.ac.in, @nitj.ac.in, etc.)",
  "domain": "gmail.com",
  "allowedDomains": ["mnit.ac.in", "nitj.ac.in", ...]
}
```

### GET `/api/auth/me`
Get current authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "64f8a2...",
    "email": "2022uec5234@mnit.ac.in",
    "name": "Ritesh Saini",
    "profileImage": "...",
    "role": "user",
    "masterProfile": { ... }
  }
}
```

### POST `/api/auth/login`
Admin-only email/password login.

### POST `/api/auth/logout`
Logout endpoint (client should remove token).

---

## 🚀 Google Cloud Setup

### 1. Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Add authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - `https://your-production-domain.com` (production)
7. Copy the **Client ID**

### 2. Configure OAuth Consent Screen

1. Go to **OAuth consent screen**
2. Select **External** user type
3. Fill in app information
4. Add scopes: `email`, `profile`, `openid`
5. Publish app when ready

---

## 🧪 Testing

### Test with NIT Email
1. Sign in with a valid NIT email (e.g., `yourname@mnit.ac.in`)
2. Should successfully create account and redirect to dashboard

### Test with Non-NIT Email
1. Sign in with a non-NIT email (e.g., `yourname@gmail.com`)
2. Should see error: "Only NIT email addresses are allowed"

---

## 🔒 Security Considerations

1. **JWT Secret**: Use a strong, random secret in production
2. **HTTPS**: Always use HTTPS in production
3. **Token Expiry**: Tokens expire after 7 days by default
4. **Domain Validation**: Server-side validation prevents bypassing

---

## 🐛 Troubleshooting

### "Invalid Google token"
- Ensure `GOOGLE_CLIENT_ID` matches in both frontend and backend
- Check if the token has expired

### "Origin not allowed"
- Add your frontend URL to Google Cloud Console authorized origins

### CORS Errors
- Ensure backend CORS config includes your frontend URL
- Check `CLIENT_URL` in backend `.env`

### "Only NIT email addresses are allowed"
- User is trying to login with a non-NIT email
- This is expected behavior for the system

---

## 📞 Support

For issues with authentication:
1. Check browser console for errors
2. Check backend logs for detailed error messages
3. Verify environment variables are set correctly
