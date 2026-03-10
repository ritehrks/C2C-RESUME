# MongoDB Atlas Free Tier (M0) Capacity Analysis

This guide estimates how many users and resumes your **Code to Career (C2C)** platform can support on the **MongoDB Atlas Free Tier (M0 Sandbox)**, based on your current data models.

## 📊 Quick Summary
| **Metric** | **Limit / Capacity** |
| :--- | :--- |
| **Free Storage Limit** | **512 MB** |
| **Max Users (Conservative)** | **~25,000 - 30,000 Users** |
| **Max Users (Optimistic)** | **~40,000 - 50,000 Users** |
| **Max Resumes** | **~80,000 - 100,000 Resumes** |

> **Verdict:** The free tier is **more than enough** for a college-level application. Even with the entire college population (e.g., ~5,000 students) using it actively, you will likely use less than **15-20%** of your free tier capacity.

---

## 🧐 Detailed Breakdown

### 1. Storage Limit
The M0 Sandbox gives you **512 MB** of storage. This includes:
- **Data:** The actual JSON documents (Users, Resumes, Events).
- **Indexes:** Data structures for fast searching (e.g., searching users by email). Indexes usually take up 30-50% of the data size.

### 2. Document Size Estimates
Based on your schema in `server/src/models/`, here are the estimates per document:

#### **User Profile (`User.ts`)**
- **Content:** Name, email, hashed password, master profile (education, skills, links).
- **Estimated Size:** **~1 KB - 1.5 KB**
  - *Why?* Hashed passwords and basic text are small. The `masterProfile` arrays add a bit, but text is very efficient to store.

#### **Resume (`Resume.ts`)**
- **Content:** Detailed projects, experience bullets, education, skills. This is your largest data type.
- **Estimated Size:** **~3 KB - 8 KB**
  - *Why?* A full-page text-heavy resume typically contains 500-1000 words. In DB storage, this is quite small.
  - *Average:* Let's assume **5 KB** per resume (a very safe upper bound).

#### **Event & Attendance (`Event.ts`, `Attendance`)**
- **Content:** Event details are negligible (~1-2 KB per event).
- **Attendance Records:** tiny links between a user and event.
- **Estimated Size:** **~0.2 KB** per attendance record.

---

## 🧮 Capacity Calculation (The Math)

Let's verify the "Storage Footprint" of a single active student.

**Scenario: An Active Student**
- **1 User Profile**: 1.5 KB
- **2 Resumes** (e.g., Software & Core profiles): 5 KB x 2 = 10 KB
- **20 Event Attendances**: 0.2 KB x 20 = 4 KB
- **Database Overhead & Indexes**: ~50% of data size = ~7.5 KB
- **TOTAL Footprint per Student:** **~23 KB**

### **How many such students fit in 512 MB?**

$$ 512 \text{ MB} = 512 \times 1024 \text{ KB} = 524,288 \text{ KB} $$

$$ \text{Total Users} = \frac{524,288 \text{ KB}}{23 \text{ KB/User}} \approx \mathbf{22,795 \text{ Users}} $$

### **Adjustment for Inactive Users**
Not every user will have 2 full resumes and 20 events.
- Many users might just sign up and create 1 basic resume.
- **Average Footprint:** ~10-12 KB
- **Realistic Capacity:** **~40,000 - 50,000 Users**

---

## ⚠️ When Will You Hit Limits?
You won't hit limits due to text data. You will only hit limits if:
1.  **Binary Data:** You start storing images (profile pics) or PDF files **directly in the database** (Base64 encoding).
    - *Solution:* You are likely already using (or should use) cloud storage like **Cloudinary, AWS S3, or Firebase Storage** for images/PDFs. Storing only the *Link* (URL) in MongoDB uses negligible space.
2.  **Logs:** if you store massive logs or analytics events in the same DB.

## 🚀 Scaling Plan
If you somehow exceed 50,000 users or 512 MB:
1.  **MongoDB Atlas Upgrade:** The next tier (M2/M5) starts at roughly **$9/month** for 2GB-5GB.
2.  **Data Cleanup:** Delete old accounts or archive old events/attendance records.

## 🎯 Conclusion for Your Project
For a college project or even a startup launch within a single university:
- **MNIT Student Count:** ~5,000 - 6,000
- **Required Space:** ~100 MB - 150 MB
- **Free Tier Availability:** 512 MB

**You are 100% safe to use the free tier.** You can comfortably host the entire college's resume and attendance data for years without paying a cent.
