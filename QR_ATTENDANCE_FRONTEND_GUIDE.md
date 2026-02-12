# QR Attendance — Frontend Reference Guide

> This document describes **all existing frontend pages**, their **API endpoints**, **data shapes**, and the **changes needed** to integrate QR Attendance into the Resume Builder platform.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [API Endpoints Reference](#2-api-endpoints-reference)
3. [Data Models / TypeScript Interfaces](#3-data-models--typescript-interfaces)
4. [API Utility (lib/api.ts)](#4-api-utility-libapits)
5. [Existing Pages (Already Built)](#5-existing-pages-already-built)
6. [Changes Needed in Existing Frontend](#6-changes-needed-in-existing-frontend)
7. [Page-by-Page UI Breakdown](#7-page-by-page-ui-breakdown)
8. [Styling & Design System](#8-styling--design-system)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  PUBLIC PAGES (No Auth Required)                        │
│  ├── /attend/[token]  → Student scans QR, marks attend  │
│                                                         │
│  ADMIN PAGES (Requires Auth + Admin Role)               │
│  ├── /admin/contests        → List/Create/Edit contests │
│  ├── /admin/contests/[id]   → View attendance + export  │
│                                                         │
│  DASHBOARD (Requires Auth)                              │
│  ├── /dashboard             → My Resumes (add link here)│
│  └── Sidebar nav items      → Add QR Attendance link    │
│                                                         │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP API calls
                        ▼
┌─────────────────────────────────────────────────────────┐
│            BACKEND (Express.js on :5000)                 │
│  Base URL: process.env.NEXT_PUBLIC_API_URL               │
│  Routes:   /api/contests/...                             │
└─────────────────────────────────────────────────────────┘
```

---

## 2. API Endpoints Reference

### Public Endpoints (No Auth)

| Method | Endpoint | Purpose | Request Body / Params |
|--------|---------|---------|----------------------|
| `GET` | `/api/contests/public/:token` | Get contest info by QR token | — |
| `POST` | `/api/contests/public/:token/mark` | Mark attendance | `{ name, email, studentId, branch, phone?, latitude?, longitude?, locationAccuracy? }` |
| `GET` | `/api/contests/public/:token/check` | Check if already attended | Query: `?email=...&studentId=...` |

### Admin Endpoints (Requires `Authorization: Bearer <token>` header)

| Method | Endpoint | Purpose | Request Body |
|--------|---------|---------|-------------|
| `GET` | `/api/contests` | Get all contests | Query: `?status=active&type=workshop` |
| `POST` | `/api/contests` | Create new contest | `{ title, description?, type?, venue, date, startTime, endTime, maxParticipants?, requiresGPS?, venueLatitude?, venueLongitude?, gpsRadius? }` |
| `GET` | `/api/contests/:id` | Get single contest | — |
| `PUT` | `/api/contests/:id` | Update contest | Same as create body |
| `DELETE` | `/api/contests/:id` | Delete contest | — |
| `PATCH` | `/api/contests/:id/toggle` | Toggle active/inactive | — |
| `POST` | `/api/contests/:id/regenerate-qr` | Regenerate QR token | — |
| `GET` | `/api/contests/:id/attendance` | Get attendance list | Query: `?sort=name&order=asc` |
| `GET` | `/api/contests/:id/attendance/export` | Download CSV | Query: `?token=<authToken>` |
| `DELETE` | `/api/contests/:id/attendance/:attendanceId` | Delete attendance record | — |

---

## 3. Data Models / TypeScript Interfaces

### Contest
```typescript
interface Contest {
    _id: string;
    title: string;
    description?: string;
    type: 'coding_contest' | 'workshop' | 'hackathon' | 'meeting' | 'seminar' | 'other';
    venue: string;
    date: string;            // ISO date string
    startTime: string;       // "HH:mm" format e.g. "14:00"
    endTime: string;         // "HH:mm" format e.g. "16:00"
    maxParticipants?: number;
    qrToken: string;         // Unique token for QR code URL
    isActive: boolean;
    requiresGPS: boolean;
    venueLatitude?: number;
    venueLongitude?: number;
    gpsRadius: number;       // Default: 100 meters
    attendanceCount: number; // Populated by backend on GET
    attendanceUrl: string;   // "/attend/<qrToken>"
    createdAt: string;
    updatedAt: string;
}
```

### AttendanceRecord
```typescript
interface AttendanceRecord {
    _id: string;
    contestId: string;
    userId?: string;
    name: string;
    email: string;
    studentId: string;       // e.g. "2022UCP1234"
    branch: string;          // e.g. "UCP", "UCE", "UEC"
    year?: number;           // 1, 2, 3, 4 (auto-parsed from studentId)
    phone?: string;
    latitude?: number;
    longitude?: number;
    locationAccuracy?: number;
    distanceFromVenue?: number;
    markedAt: string;        // ISO date
    deviceInfo?: string;
    ipAddress?: string;
    status: 'present' | 'late' | 'invalid_location';
}
```

### Contest Type Config Map
```typescript
const contestTypeConfig: Record<string, { label: string; color: string; icon: string }> = {
    coding_contest: { label: 'Coding Contest', color: 'bg-blue-500',   icon: 'code' },
    workshop:       { label: 'Workshop',       color: 'bg-purple-500', icon: 'build' },
    hackathon:      { label: 'Hackathon',      color: 'bg-orange-500', icon: 'terminal' },
    meeting:        { label: 'Meeting',        color: 'bg-green-500',  icon: 'groups' },
    seminar:        { label: 'Seminar',        color: 'bg-teal-500',   icon: 'mic' },
    other:          { label: 'Event',          color: 'bg-gray-500',   icon: 'event' },
};
```

### Branch Options (for dropdowns)
```typescript
const branchOptions = [
    { value: 'UCP', label: 'Computer Science (UCP)' },
    { value: 'UCE', label: 'Civil Engineering (UCE)' },
    { value: 'UEC', label: 'Electronics & Comm (UEC)' },
    { value: 'UEE', label: 'Electrical Engineering (UEE)' },
    { value: 'UME', label: 'Mechanical Engineering (UME)' },
    { value: 'UMT', label: 'Metallurgical (UMT)' },
    { value: 'UCH', label: 'Chemical Engineering (UCH)' },
    { value: 'UAR', label: 'Architecture (UAR)' },
    { value: 'OTHER', label: 'Other' },
];
```

---

## 4. API Utility (`lib/api.ts`)

The `contestApi` object already exists in `client/src/lib/api.ts` (lines 285-413). It wraps all API calls. Use it like:

```typescript
import { contestApi } from '@/lib/api';

// Public calls (no auth token needed)
const contestInfo = await contestApi.getContestByToken(qrToken);
const result = await contestApi.markAttendance(qrToken, formData);
const check = await contestApi.checkAttendance(qrToken, email, studentId);

// Admin calls (need auth token from localStorage)
const token = localStorage.getItem('token');
const contests = await contestApi.getAllContests(token, { status: 'active' });
const contest = await contestApi.getContest(token, contestId);
const created = await contestApi.createContest(token, contestData);
const updated = await contestApi.updateContest(token, contestId, contestData);
await contestApi.deleteContest(token, contestId);
await contestApi.toggleContestStatus(token, contestId);
await contestApi.regenerateQRToken(token, contestId);
const attendance = await contestApi.getContestAttendance(token, contestId, 'name', 'asc');
const csvUrl = contestApi.exportAttendanceCSV(token, contestId); // returns URL string
await contestApi.deleteAttendanceRecord(token, contestId, attendanceId);
```

---

## 5. Existing Pages (Already Built)

These pages are **already coded** in the project. You can reference or rebuild them:

### 5a. `/attend/[token]/page.tsx` — Student Attendance Page
- **File**: `client/src/app/attend/[token]/page.tsx` (560 lines)
- **Auth**: No auth required (public page — students scan QR code)
- **Dependencies**: `@react-oauth/google` for Google Sign-In
- **Flow**:
  1. Page loads → fetches contest info via `GET /api/contests/public/:token`
  2. Shows contest details (title, venue, date, time, type badge)
  3. Student logs in with Google → auto-fills name & email from Google token
  4. Student fills: Student ID (`2022UCP1234`), Branch (dropdown), Phone (optional)
  5. If `contest.requiresGPS` → requests browser geolocation
  6. Submit → `POST /api/contests/public/:token/mark`
  7. Shows success ✅ or error ❌ state

### 5b. `/admin/contests/page.tsx` — Admin Contest List
- **File**: `client/src/app/admin/contests/page.tsx` (700 lines)
- **Auth**: Admin only
- **Dependencies**: `qrcode.react` for QR code generation
- **Features**:
  - List all contests with filter by status (active/inactive) and type
  - Create / Edit contest modal form
  - Toggle active/inactive status
  - Show QR code modal with download button
  - Delete contest with confirmation
  - Shows attendance count per contest
  - QR code encodes: `{origin}/attend/{qrToken}`

### 5c. `/admin/contests/[id]/page.tsx` — Contest Detail + Attendance
- **File**: `client/src/app/admin/contests/[id]/page.tsx` (519 lines)
- **Auth**: Admin only
- **Features**:
  - Contest header with all details
  - Attendance table (sortable by name, studentId, branch, status, time)
  - Search/filter attendance records
  - Export to CSV button
  - Delete individual attendance records
  - Status badges: `present` (green), `late` (yellow), `invalid_location` (red)
  - Shows distance from venue if GPS was used

---

## 6. Changes Needed in Existing Frontend

### 6a. Add "QR Attendance" Link to Dashboard Sidebar

**File**: `client/src/app/(dashboard)/layout.tsx`  
**What to change**: Add a nav item to the `navItems` array (line 36-40)

```typescript
// CURRENT (line 36-40):
const navItems = [
    { name: 'My Resumes',  href: '/dashboard', icon: 'folder_open', active: pathname === '/dashboard' },
    { name: 'ATS Analyzer', href: '/analyzer',  icon: 'analytics',   active: pathname === '/analyzer' },
    { name: 'Profile',      href: '/profile',   icon: 'person',      active: pathname === '/profile' },
];

// ADD THIS ITEM (for admin users only — see note below):
{ name: 'QR Attendance', href: '/admin/contests', icon: 'qr_code_scanner', active: pathname.startsWith('/admin/contests') },
```

> **Note**: If you want this link visible only to admins, you'll need to check the user's role. Currently `displayRole` is derived from the email (`displayEmail.includes('admin') ? 'Admin' : 'Student'`). You can conditionally add the nav item:

```typescript
const navItems = [
    { name: 'My Resumes',  href: '/dashboard', icon: 'folder_open', active: pathname === '/dashboard' },
    { name: 'ATS Analyzer', href: '/analyzer',  icon: 'analytics',   active: pathname === '/analyzer' },
    { name: 'Profile',      href: '/profile',   icon: 'person',      active: pathname === '/profile' },
    // Only show for admins:
    ...(displayRole === 'Admin' ? [
        { name: 'QR Attendance', href: '/admin/contests', icon: 'qr_code_scanner', active: pathname.startsWith('/admin') }
    ] : []),
];
```

### 6b. Add "QR Attendance" Link to Admin Sidebar

**File**: `client/src/components/AdminSidebar.tsx`  
**Status**: ✅ Already has it! The `navItems` array (line 31-36) already includes:
```typescript
{ href: '/admin/contests', icon: 'event', label: 'Contests & Events' },
```

No change needed here.

---

## 7. Page-by-Page UI Breakdown

### Page 1: `/attend/[token]` — Student Attendance Form (PUBLIC)

**States the page handles:**

| State | What to show |
|-------|-------------|
| `loading` | Spinner + "Loading contest..." |
| `error` (invalid token) | Error card: "Invalid QR code" |
| `error` (contest inactive) | Warning card: "Contest is no longer accepting attendance" |
| `contest loaded` | Contest info + attendance form |
| `already_marked` | Green card: "You already marked attendance at {time}" |
| `submitting` | Disabled form + spinner |
| `success` | Big green checkmark + "Attendance marked!" |

**UI Sections:**

#### Header Section
```
┌──────────────────────────────────────┐
│  🏫 C2C Resume                       │
│  ← Back to Home                      │
└──────────────────────────────────────┘
```

#### Contest Info Card
```
┌──────────────────────────────────────┐
│  [Type Badge: e.g. "Workshop" 🔧]    │
│                                      │
│  Title: "React Workshop 2024"        │
│  📍 Venue: LHC 101                   │
│  📅 Date: Feb 12, 2026              │
│  🕐 Time: 2:00 PM - 4:00 PM        │
│  🌐 GPS Required: Yes/No            │
└──────────────────────────────────────┘
```

#### Attendance Form
```
┌──────────────────────────────────────┐
│  Step 1: Sign in with Google         │
│  [Google Sign-In Button]             │
│                                      │
│  ─── After Google login ───          │
│                                      │
│  Full Name: [pre-filled, readonly]   │
│  Email:     [pre-filled, readonly]   │
│  Student ID: [2022UCP1234]           │
│  Branch:     [Dropdown ▾]            │
│  Phone:      [Optional]              │
│                                      │
│  ⚠ If GPS required:                 │
│  📍 Getting your location...         │
│  ✅ Location acquired (±20m)        │
│                                      │
│  [    Mark Attendance    ]           │
└──────────────────────────────────────┘
```

#### Key Implementation Notes:
- Uses `@react-oauth/google` — needs `GoogleOAuthProvider` wrapper with client ID
- Google client ID: `process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- Email must end with `@mnit.ac.in` (backend validates this)
- If `contest.requiresGPS === true`, must call `navigator.geolocation.getCurrentPosition()`
- Send `{ latitude, longitude, locationAccuracy }` in the request body
- Student ID format: `2022UCP1234` — backend auto-extracts year from it

---

### Page 2: `/admin/contests` — Contest Management (ADMIN)

**States:**

| State | What to show |
|-------|-------------|
| `loading` | Loading skeleton |
| `no contests` | Empty state: "No contests yet" + Create button |
| `contests loaded` | Contest cards/list with actions |
| `modal open` | Create/Edit form modal |
| `qr modal` | QR code display modal |

**UI Sections:**

#### Top Bar
```
┌──────────────────────────────────────┐
│  Contests & Events                   │
│                                      │
│  [Filter: All ▾] [Type: All ▾]      │
│                          [+ Create]  │
└──────────────────────────────────────┘
```

#### Contest Card (repeat for each)
```
┌──────────────────────────────────────┐
│  [Type Badge]  title                 │
│  📍 venue  |  📅 date  |  🕐 time   │
│                                      │
│  👥 12 attendees  |  Status: ● Active│
│                                      │
│  [QR Code] [Edit] [Toggle] [Delete]  │
└──────────────────────────────────────┘
```

#### Create/Edit Modal Form Fields
```
┌──────────────────────────────────────┐
│  Create New Contest                  │
│                                      │
│  Title*:         [_______________]   │
│  Description:    [_______________]   │
│  Type:           [Dropdown ▾    ]   │
│  Venue*:         [_______________]   │
│  Date*:          [Date picker   ]   │
│  Start Time*:    [HH:mm         ]   │
│  End Time*:      [HH:mm         ]   │
│  Max Participants: [Number      ]   │
│                                      │
│  ☐ Require GPS Verification         │
│  ── If GPS checked: ──              │
│  Venue Latitude:  [___________]     │
│  Venue Longitude: [___________]     │
│  GPS Radius (m):  [100        ]     │
│                                      │
│  [Cancel]  [Create Contest]          │
└──────────────────────────────────────┘
```

#### QR Code Modal
```
┌──────────────────────────────────────┐
│  QR Code: "React Workshop 2024"      │
│                                      │
│       ┌───────────────┐              │
│       │  ▓▓▓ QR ▓▓▓   │              │
│       │  ▓▓▓ CODE ▓▓▓  │              │
│       │  ▓▓▓▓▓▓▓▓▓▓▓  │              │
│       └───────────────┘              │
│                                      │
│  URL: https://domain.com/attend/xyz  │
│  [Copy URL] [Download QR as PNG]     │
└──────────────────────────────────────┘
```

#### Key Implementation Notes:
- Uses `qrcode.react` package → `import { QRCodeSVG } from 'qrcode.react'`
- QR encodes: `${window.location.origin}/attend/${contest.qrToken}`
- Download QR: Render QRCodeSVG to canvas, then `canvas.toDataURL('image/png')`
- Auth token: `localStorage.getItem('token')`

---

### Page 3: `/admin/contests/[id]` — Attendance Detail (ADMIN)

**UI Sections:**

#### Contest Header
```
┌──────────────────────────────────────┐
│  ← Back to Contests                 │
│                                      │
│  "React Workshop 2024"              │
│  [Type Badge]  Status: ● Active      │
│  📍 LHC 101  📅 Feb 12  🕐 2-4 PM  │
│  👥 34 attendees                     │
│                                      │
│  [Show QR]  [Export CSV]             │
└──────────────────────────────────────┘
```

#### Attendance Table
```
┌────┬──────────┬──────────────┬────────────┬────────┬────────┬──────┬────────┐
│ #  │ Name ↕   │ Student ID ↕ │ Branch ↕   │ Status │ Time ↕ │ Dist │ Action │
├────┼──────────┼──────────────┼────────────┼────────┼────────┼──────┼────────┤
│ 1  │ Ritesh   │ 2022UCP1738  │ UCP        │ ● Present│ 2:05PM│ 15m  │ [🗑]  │
│ 2  │ Amit     │ 2022UCE0345  │ UCE        │ ● Late   │ 2:20PM│ 45m  │ [🗑]  │
│ 3  │ Priya    │ 2023UEC0112  │ UEC        │ ● Invalid│ 2:15PM│ 250m │ [🗑]  │
└────┴──────────┴──────────────┴────────────┴────────┴────────┴──────┴────────┘
```

#### Status Badge Colors
```typescript
const statusBadge = {
    present:          'bg-green-100 text-green-700',  // ● Present
    late:             'bg-yellow-100 text-yellow-700', // ● Late
    invalid_location: 'bg-red-100 text-red-700',      // ● Invalid Location
};
```

#### Key Implementation Notes:
- Sortable columns: click header to toggle asc/desc
- Export CSV: `window.open(contestApi.exportAttendanceCSV(token, id))`
- Delete: confirm dialog → `contestApi.deleteAttendanceRecord(token, id, attendanceId)`

---

## 8. Styling & Design System

### Colors Used (Tailwind classes)
```
Primary Blue:    text-[#1152d4] / bg-[#1152d4] (or text-app-primary)
Dark Background: bg-[#0d121b] / bg-[#1a2235] / bg-[#1e2636]
Text Primary:    text-[#0d121b] (light) / text-white (dark)
Text Secondary:  text-[#4c669a] (light) / text-gray-400 (dark)
Border:          border-[#cfd7e7] (light) / border-gray-700 (dark)
Card Background: bg-white (light) / bg-[#1e2636] (dark)
```

### Common Patterns
```html
<!-- Card -->
<div class="bg-white dark:bg-[#1e2636] rounded-xl shadow-sm border border-[#e7ebf3] dark:border-gray-700 p-6">

<!-- Badge -->
<span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-green-100 text-green-700">

<!-- Primary Button -->
<button class="bg-app-primary hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-colors">

<!-- Icon (Material Symbols) -->
<span class="material-symbols-outlined">qr_code_scanner</span>
```

### Font
```html
<!-- Already loaded in layout.tsx -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
```

### NPM Packages Needed
```json
{
    "@react-oauth/google": "latest",   // Google Sign-In for attend page
    "qrcode.react": "latest"           // QR code generation for admin page
}
```

### Environment Variable Needed
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Quick Summary: What to Build vs What Exists

| Component | Status | File Path |
|-----------|--------|-----------|
| `contestApi` (API utility) | ✅ Already built | `client/src/lib/api.ts` (lines 285-413) |
| `AdminSidebar` (with contests link) | ✅ Already built | `client/src/components/AdminSidebar.tsx` |
| `/attend/[token]` page | ✅ Already built | `client/src/app/attend/[token]/page.tsx` |
| `/admin/contests` page | ✅ Already built | `client/src/app/admin/contests/page.tsx` |
| `/admin/contests/[id]` page | ✅ Already built | `client/src/app/admin/contests/[id]/page.tsx` |
| Dashboard sidebar link to QR | ⚠️ Need to add | `client/src/app/(dashboard)/layout.tsx` line 36 |

> **TL;DR**: Almost everything is already built. The main change needed is adding a **"QR Attendance" nav link** in the dashboard sidebar for admin users. All 3 pages and the API utility are fully functional.
