# Job Tracker & AI Resume Analyzer

A full-stack **Job Application Tracker** and **ATS Resume Scoring System** built with **React**, **Supabase**, and an **Express backend powered by Google Gemini AI**. 

In addition to tracking application lifecycles and pipeline metrics, the platform includes a privacy-first, stateless **Instant Resume Analyzer** that evaluates resumes against job descriptions in real time without persisting sensitive documents to a database.

---

## Features

### 📋 Job Tracking & Management
- **Authentication:** Secure user sign-up and login powered by Supabase Auth.
- **Application Pipeline:** Track application status across active stages (Bookmarked, Applying, Applied, Interviewing, Negotiating, Accepted).
- **Interactive Analytics:** Visual progress breakdown and metrics using Chart.js.
- **Cloud Database:** Persistent storage and profile data hosted on Supabase tables.
- **Responsive UI:** Built with modern React components and Tailwind CSS.

### 🤖 Instant AI Resume Analyzer (Gemini-Powered)
- **Multi-Factor ATS Scoring:** Evaluates candidate compatibility on a 100-point weighted scale based on skills, semantic relevance, experience, education, and role fit.
- **Actionable AI Recommendations:** Delivers targeted, recruiter-focused advice highlighting missing skills and resume optimization opportunities.
- **Visual Analytics:** Interactive SVG score ring, category progress meters, match tiers (Low, Moderate, Strong), and skill comparison chips (Found vs. Missing).
- **Stateless & Privacy-First:** PDFs are parsed entirely in-memory using buffer streams. Resumes, job descriptions, and AI scores are never written to disk or the database, wiping completely on exit.

---

## Tech Stack

- **Frontend:** React.js (Vite), React Router, Tailwind CSS, Chart.js, Axios
- **Database & Auth:** Supabase (PostgreSQL + Supabase Auth)
- **AI Backend:** Node.js, Express.js
- **Document Processing:** Multer (memory storage), PdfReader
- **AI Engine:** Google Gemini API (`@google/genai`)
- **Deployment:** Netlify (Frontend)

---

## Architecture Overview

```text
├── project/              # Frontend Client (Vite + React)
│   ├── src/components/   # Tracker modals, tables, charts, & sidebar
│   ├── src/pages/        # Dashboard & InstantAnalyzer view
│   └── src/lib/          # Supabase client & session management
│
└── backend/              # AI Proxy Server (Express + Node.js)
    ├── routes/           # Stateless analyzer endpoint (/api/analyzer)
    └── utils/            # Gemini AI prompt engine & in-memory PDF reader