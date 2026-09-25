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

| Layer | Technologies |
|---|---|
| **Frontend** | React.js (Vite), React Router, Tailwind CSS, Chart.js, Axios |
| **Database & Auth** | Supabase (PostgreSQL + Supabase Auth) |
| **AI Backend** | Node.js, Express.js |
| **Document Processing** | Multer (memory storage), PdfReader |
| **AI Engine** | Google Gemini API (`@google/genai`) |

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- A [Supabase](https://supabase.com) project (URL + anon key)
- A [Google Gemini API key](https://ai.google.dev)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourname/job-tracker-resume-analyzer.git
cd job-tracker-resume-analyzer

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

Fill in `.env` with your keys:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

```bash
# Start the development server
npm run dev
```

---

## Application Pipeline

Applications move through six stages, updated manually as your search progresses:

`Bookmarked` → `Applying` → `Applied` → `Interviewing` → `Negotiating` → `Accepted`

---

## Privacy Model

The Resume Analyzer is intentionally stateless:

- Resumes are parsed **in-memory only** (Multer memory storage + PdfReader) — never written to disk.
- Job descriptions and generated scores are **never persisted** to the database.
- All analysis data is discarded once the API response is sent.

---


