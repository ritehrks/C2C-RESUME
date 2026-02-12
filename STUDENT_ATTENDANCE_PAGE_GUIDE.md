# Student "My Attendance" Page — Frontend Mockup Guide

## Overview

A dashboard page at **`/attendance`** where students can view their past attendance records across all C2C club events. Accessible from the sidebar alongside "My Resumes", "ATS Analyzer", and "Profile".

---

## Design System Reference

| Token | Value |
|-------|-------|
| **Font** | `Inter` (Google Fonts) |
| **Primary Blue** | `#1152d4` |
| **Dark Text** | `#0d121b` |
| **Muted Text** | `#4c669a` |
| **Light BG** | `#f6f6f8` |
| **Card BG (Light)** | `#ffffff` |
| **Card BG (Dark)** | `#1a2233` |
| **Dark BG** | `#101622` |
| **Border (Light)** | `border-gray-200` |
| **Border (Dark)** | `border-gray-800` |
| **Icons** | `material-symbols-outlined` (Google Material Symbols) |
| **Radius (cards)** | `rounded-xl` (12px) |
| **Radius (badges)** | `rounded-full` |
| **Shadows** | `shadow-sm` on cards |

### Event Type Colors

| Type | Icon | Badge Color |
|------|------|-------------|
| `coding_contest` | `code` | `bg-purple-500 text-white` |
| `workshop` | `school` | `bg-blue-500 text-white` |
| `hackathon` | `rocket_launch` | `bg-orange-500 text-white` |
| `meeting` | `groups` | `bg-green-500 text-white` |
| `seminar` | `mic` | `bg-teal-500 text-white` |
| `other` | `event` | `bg-gray-500 text-white` |

### Status Badges

| Status | Style |
|--------|-------|
| `present` | Green dot + "Present" — `bg-green-100 text-green-700 border-green-200` |
| `late` | Amber dot + "Late" — `bg-amber-100 text-amber-700 border-amber-200` |
| `invalid_location` | Red dot + "Location Issue" — `bg-red-100 text-red-700 border-red-200` |

---

## Page Structure

### 1. Page Header

```
┌─────────────────────────────────────────────────────┐
│  My Attendance                                      │
│  Track your event participation history             │
└─────────────────────────────────────────────────────┘
```

- Title: `text-lg font-bold`
- Subtitle: `text-sm text-[#4c669a]`
- Same style as the "Contests & Events" header on the admin page

---

### 2. Stats Summary Row (3 cards)

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  🏆  12      │  │  ✅  10      │  │  ⏰  2       │
│  Events      │  │  On Time     │  │  Late         │
│  Attended    │  │              │  │               │
└──────────────┘  └──────────────┘  └──────────────┘
```

Each card:
- White card with `rounded-xl border shadow-sm`
- Left icon in a colored container (`size-11 rounded-lg`)
  - **Card 1**: `groups` icon in `bg-[#1152d4]/10` text `text-[#1152d4]` — Total count
  - **Card 2**: `check_circle` icon in `bg-green-100` text `text-green-600` — Present count
  - **Card 3**: `schedule` icon in `bg-amber-100` text `text-amber-600` — Late count
- Large number: `text-2xl font-bold`
- Label: `text-xs text-[#4c669a]`
- Layout: `grid grid-cols-3 gap-4`

---

### 3. Attendance History — Card List

Each attendance record is a **horizontal card** (not a table). Stack them vertically with `gap-4`.

```
┌──────────────────────────────────────────────────────────────┐
│ ┌────┐                                                       │
│ │icon│  React Workshop 2024              [Workshop]  [Present]│
│ └────┘                                                       │
│        📅 Oct 24, 2024   🕐 10:00 - 13:00   📍 LHC 101     │
│        Marked at 10:05 AM  •  Distance: 12m                  │
└──────────────────────────────────────────────────────────────┘
```

**Card structure:**

- **Left side**: Event type icon in a colored circle (`size-10 rounded-lg`) using type colors above
- **Top row**: Event title (bold) + type badge (small pill) + status badge (right side)
- **Bottom row**: Date, Time, Venue — using material icons `calendar_today`, `schedule`, `location_on`
- **Footer line**: "Marked at 10:05 AM" + GPS distance if available (`text-xs text-[#4c669a]`)

**Card styling:**
- `bg-white dark:bg-[#1a2233] rounded-xl border border-gray-200 dark:border-gray-800 p-4`
- Hover: `hover:shadow-md transition-shadow`

---

### 4. Empty State (when no records)

```
┌─────────────────────────────────────────┐
│                                         │
│         📋 (large icon, faded)          │
│                                         │
│    No Attendance Records Yet            │
│    Your event attendance will appear    │
│    here after you scan a QR code        │
│                                         │
└─────────────────────────────────────────┘
```

- Icon: `event_available` at `text-6xl text-[#4c669a]/30`
- Title: `text-xl font-semibold`
- Subtitle: `text-[#4c669a]`

---

## Data Available Per Record

Use these as placeholder/sample data in the mockup:

```json
{
  "eventTitle": "React Workshop 2024",
  "eventType": "workshop",
  "venue": "LHC 101, MNIT Jaipur",
  "eventDate": "2024-10-24",
  "startTime": "10:00",
  "endTime": "13:00",
  "status": "present",
  "markedAt": "2024-10-24T10:05:00Z",
  "distanceFromVenue": 12
}
```

### Sample records for the mockup (use 4–5):

| # | Title | Type | Date | Status |
|---|-------|------|------|--------|
| 1 | React Workshop 2024 | `workshop` | Oct 24, 2024 | present |
| 2 | Weekly Coding Contest #12 | `coding_contest` | Oct 20, 2024 | present |
| 3 | HackMNIT 2024 | `hackathon` | Oct 15, 2024 | late |
| 4 | Club General Meeting | `meeting` | Oct 10, 2024 | present |
| 5 | AI/ML Seminar | `seminar` | Oct 5, 2024 | invalid_location |

---

## Page Layout (Full)

```
┌──────────────────────────────────────────────────────────┐
│ SIDEBAR │                  MAIN CONTENT                  │
│         │                                                │
│ Resumes │  ┌─ Header ──────────────────────────────────┐ │
│ ATS     │  │ My Attendance                             │ │
│ Profile │  │ Track your event participation history    │ │
│ ──────  │  └───────────────────────────────────────────┘ │
│ Attend. │                                                │
│         │  ┌─ Stats ───────┐ ┌─────────┐ ┌───────────┐ │
│         │  │ 12 Events     │ │ 10 OnTime│ │ 2 Late    │ │
│         │  └───────────────┘ └─────────┘ └───────────┘ │
│         │                                                │
│         │  ┌─ Card 1 ─────────────────────────────────┐ │
│         │  │ React Workshop 2024    [Workshop][Present]│ │
│         │  │ Oct 24 • 10:00-13:00 • LHC 101           │ │
│         │  └──────────────────────────────────────────┘ │
│         │  ┌─ Card 2 ─────────────────────────────────┐ │
│         │  │ Weekly Coding #12  [Coding][Present]     │ │
│         │  │ Oct 20 • 14:00-16:00 • CL-01             │ │
│         │  └──────────────────────────────────────────┘ │
│         │  ... more cards ...                           │
└──────────────────────────────────────────────────────────┘
```

- The sidebar is the existing dashboard sidebar (no changes needed)
- The `main` area scrolls vertically
- Stats are always visible at top
- Cards stack below, most recent first

---

## File to Create

Create a single HTML file: **`student_attendance_mockup.html`**

Include:
- Tailwind CDN: `<script src="https://cdn.tailwindcss.com"></script>`
- Google Fonts Inter: `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">`
- Material Symbols: `<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined">`
- Use `font-['Inter',sans-serif]` on body
- Dark mode support using `dark:` classes with a `class="dark"` on `<html>`

> **Note:** The sidebar does not need to be functional in the mockup — just show it as a static column or skip it entirely and focus on the main content area.

---

## What I'll Do After You Give Me the Mockup

1. **Create backend API**: `GET /api/contests/my-attendance` — returns all attendance records for the logged-in student (matched by email)
2. **Add API client function**: `contestApi.getMyAttendance(token)` in `lib/api.ts`
3. **Convert your HTML mockup** into a Next.js page at `client/src/app/(dashboard)/attendance/page.tsx`
4. **Add "My Attendance" link** to the sidebar nav for all users
5. **Test the full flow**: Build + visual verification
