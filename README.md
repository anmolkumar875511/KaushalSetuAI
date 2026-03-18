<div align="center">

# 🚀 KaushalSetu AI

### *Intelligent Career Intelligence Platform*

**An AI-powered backend system that bridges the gap between student potential and career opportunity — through smart resume parsing, skill gap analysis, personalized learning roadmaps, and real-time labour market intelligence.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Mongoose](https://img.shields.io/badge/ODM-Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)](https://mongoosejs.com)

[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Build-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/UI-TailwindCSS%204-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![Google OAuth](https://img.shields.io/badge/Auth-Google%20OAuth-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/identity)

[![Cloudinary](https://img.shields.io/badge/Media-Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com)
[![Nodemailer](https://img.shields.io/badge/Email-Nodemailer-009688?style=for-the-badge)](https://nodemailer.com)

[![AI](https://img.shields.io/badge/AI-Google%20Generative%20AI-FF6F00?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![Cron Jobs](https://img.shields.io/badge/Jobs-node--cron-3C873A?style=for-the-badge)](https://www.npmjs.com/package/node-cron)

[![Charts](https://img.shields.io/badge/Charts-Recharts-FF6384?style=for-the-badge)](https://recharts.org)
[![Notifications](https://img.shields.io/badge/UI-Sonner-FFB020?style=for-the-badge)](https://sonner.emilkowal.ski)

[![Linting](https://img.shields.io/badge/Code%20Quality-ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)](https://eslint.org)
[![Formatting](https://img.shields.io/badge/Formatter-Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black)](https://prettier.io)

</div>

---

## 📖 What is KaushalSetu AI?

KaushalSetu AI is a production-grade RESTful API platform designed to empower students and early-career professionals. It uses AI to analyze resumes, identify skill gaps against live job opportunities, generate personalized week-by-week learning roadmaps, and provide deep career guidance — all backed by real labour market demand data.

This isn't just a CRUD API. It's an **intelligent career companion** with a competitive rating system, admin analytics dashboard, and AI-enriched opportunity matching.

---

## ✨ Core Features

### 🤖 AI-Powered Intelligence
- **Resume Parsing** — Upload a PDF resume; AI extracts skills, experience, education, and projects into structured data
- **Skill Gap Analysis** — Compares your skills against any job opportunity's requirements with weighted demand scoring
- **Learning Roadmap Generator** — Creates personalized week-by-week study plans to close identified skill gaps
- **Job Readiness Reports** — Evaluates how prepared a user is for a specific career path
- **Interest & Freelance Guides** — AI-curated career guides based on individual interests

### 🏆 Competitive Rating System
- ELO-style rating system (default 1500) that updates after every assessment
- Tiered ranking (Bronze → Silver → Gold → Platinum → Diamond) with history tracking
- Leaderboard-ready with full rating history pagination

### 📊 Labour Market Intelligence
- Real-time opportunity ingestion from external sources
- AI enrichment of job postings with demand scores, required skills, and experience levels
- Skill demand analytics by region and growth trend
- Weighted job matching that factors in market demand, not just skill overlap

### 🎯 Assessments
- AI-generated topic-based quizzes
- Timed assessments with score calculation
- Post-submission rating adjustment
- Full assessment history per user

### 🛡️ Admin Control Plane
- Dashboard with platform-wide statistics
- User management with blacklist/whitelist
- Manual trigger for opportunity ingestion & AI enrichment
- Full audit log with export to CSV
- 9 dedicated analytics endpoints for deep platform insights

### 🔐 Secure Authentication
- JWT-based auth with access + refresh token rotation
- Email OTP verification on registration
- Google OAuth 2.0 (Passport.js)
- Secure HTTP-only cookies
- Password reset via signed email link

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│              (Web App / Mobile App / Admin Panel)                │
└─────────────────────────────┬────────────────────────────────────┘
                              │ HTTPS
┌─────────────────────────────▼────────────────────────────────────┐
│                        EXPRESS API SERVER                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  /users  │  │ /resume  │  │ /roadmap │  │    /admin        │  │
│  │ /assess  │  │ /skillgap│  │/guidance │  │ /analytics       │  │
│  │ /opport  │  │ /rating  │  │          │  │                  │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘  │
│       │             │             │                 │            │
│  ┌────▼─────────────▼─────────────▼─────────────────▼──────────┐ │
│  │                    SERVICE LAYER (AI)                       │ │
│  │  Resume Parser │ Skill Matcher │ Roadmap Gen │ Assessment   │ │
│  │  Job Readiness │ Interest Guide│ Freelance   │ Labour Mkt   │ │
│  └────────────────────────────┬────────────────────────────────┘ │
└───────────────────────────────┼──────────────────────────────────┘
                                │
┌───────────────────────────────▼──────────────────────────────────┐
│                         DATA LAYER                               │
│         MongoDB Atlas    ·    Cloudinary    ·    Cache           │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Backend Structure

```
src/
├── controllers/
│   ├── user.controller.js          # Auth, profile, interests
│   ├── admin.controller.js         # Dashboard, logs, user mgmt
│   ├── adminAnalytics.controller.js# 9 analytics endpoints
│   ├── assessment.controller.js    # Generate, start, submit
│   ├── guidance.controller.js      # Job readiness, interest, freelance
│   ├── opportunity.controller.js   # Browse + AI-ranked jobs
│   ├── rating.controller.js        # ELO rating + history
│   ├── resume.controller.js        # Upload, parse, update
│   ├── roadmap.controller.js       # Generate, track, delete
│   └── skillGap.controller.js      # Skill gap analysis
│
├── routes/
│   ├── user.routes.js
│   ├── admin.routes.js
│   ├── assessment.routes.js
│   ├── guidance.routes.js
│   ├── opportunity.routes.js
│   ├── rating.routes.js
│   ├── resume.routes.js
│   ├── roadmap.routes.js
│   └── skillGap.routes.js
│
├── models/                         # Mongoose schemas
├── services/                       # AI + business logic
│   ├── resumeParser/
│   ├── skillMatcher/
│   ├── roadmapGenerator/
│   ├── assessment/
│   ├── rating/
│   ├── jobReadinessReport/
│   ├── interestGuide/
│   ├── freelanceGuide/
│   ├── fetchOpportunity/
│   └── labourMarket/
├── middlewares/
│   ├── auth.middleware.js
│   └── upload.middleware.js
└── utils/
    ├── apiError.js
    ├── apiResponse.js
    ├── asyncHandler.js
    ├── cleanResumeText.js
    ├── cloudinary.js
    ├── constants.js
    ├── defaultAdmin.js
    ├── domainMapper.js
    ├── findWorkNormalizer.js
    ├── geminiClient.js
    ├── generateOTP.js
    ├── logger.js
    ├── mappers.js
    ├── normalizeForSkills.js
    ├── normalizeResumeParsed.js
    ├── normalizeText.js
    ├── passport.js
    ├── safeJsonParse.js
    ├── sendEmail.js
    ├── skillNormalizer.js
    └── splitSections.js
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18.x |
| MongoDB | Atlas or local ≥ 6.x |
| npm | ≥ 9.x |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/anmolkumar875511/KaushalSetuAI.git
cd KaushalSetuAI

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Fill in required variables (see Environment Variables section)

# 4. Start development server
npm run dev

# 5. Start production server
npm start
```

### Environment Variables

```env
# Server
PORT=8000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/kaushalsetu

# JWT
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://kaushal-setu-ai-yy8y.vercel.app/api/users/auth/google/callback

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_app_password

# Frontend URL (for redirects & reset links)
FRONTEND_URL=http://localhost:3000

# AI Service
AI_API_KEY=your_ai_api_key
```

---

## 🔑 Authentication Flow

```
Register → OTP Email → Verify OTP → Access Token + Refresh Token (httpOnly cookies)
                                           │
                              15min expiry │  7 day expiry
                         ┌─────────────────┘
                         ▼
                  Refresh Token Rotation (POST /api/users/refresh-token)
```

**Google OAuth Flow:**
```
GET /api/users/auth/google → Google Consent → Callback → Auto login → Dashboard redirect
```

---

## 📦 API Module Summary

| Module | Base Path | Key Capabilities |
|--------|-----------|-----------------|
| Users | `/api/users` | Register, Login, Google OAuth, Profile, Interests, Avatar, Theme |
| Resume | `/api/resume` | PDF Upload & Parse, Version History, Manual Edit |
| Opportunities | `/api/opportunities` | Browse, AI-Ranked Matching with Weighted Scores |
| Skill Gap | `/api/skillgap` | Full Match Analysis vs. Any Job Posting |
| Roadmaps | `/api/roadmap` | Generate, Custom Target, Ranked Job, Task Tracking, Delete |
| Assessments | `/api/assessment` | Generate, Start, Submit, History |
| Guidance | `/api/guidance` | Job Readiness, Interest Guides, Freelance Guides |
| Ratings | `/api/rating` | Current Rating, History, Tier Definitions |
| Admin | `/api/admin` | Dashboard, Ingestion, Enrichment, Logs, User Control |
| Admin Analytics | `/api/admin/analytics` | 9 deep analytics endpoints |

> **Full API documentation:** See [`API.md`](./documentations/api.md)

---

## 🗄️ Data Models

| Model | Description |
|-------|-------------|
| `User` | Core user entity with auth, OAuth, blacklist, preferences |
| `ResumeParsed` | Structured resume data with versioning |
| `Opportunity` | Job/internship postings with AI enrichment fields |
| `SkillDemand` | Regional skill demand from labour market analysis |
| `SkillGapReport` | Per-user, per-opportunity gap analysis |
| `LearningRoadmap` | Week-by-week task-based learning plans with progress |
| `TargetSkill` | User-defined career targets |
| `Assessment` | Topic questions, answers, scoring, timing |
| `UserRating` | ELO-style rating with full event history |
| `JobReadinessReport` | AI-generated readiness evaluation |
| `InterestGuide` | Interest-based career pathway guides |
| `FreelanceGuide` | Freelance market guides per skill/interest |
| `Log` | Full audit log for all platform actions |

> **Full schema documentation:** See [`MODEL.md`](./documentations/model.md)

---

## 🔒 Security Highlights

- ✅ HTTP-only secure cookies for token storage
- ✅ Refresh token rotation on every use
- ✅ SHA-256 hashed password reset tokens
- ✅ Bcrypt password hashing
- ✅ OTP expiry enforcement
- ✅ Role-based access control (student / admin)
- ✅ Blacklist enforcement at every auth checkpoint
- ✅ Request-level audit logging for all sensitive actions

---

## 📈 Admin Analytics Capabilities

The admin analytics module provides 9 dedicated insight endpoints:

| Endpoint | Insight |
|----------|---------|
| `/analytics/overview` | Platform-wide counts |
| `/analytics/user-growth` | Monthly user registration trend |
| `/analytics/top-skills` | Most common skills across all resumes |
| `/analytics/missing-skills` | Most frequent skill gaps platform-wide |
| `/analytics/skill-demand` | Top skills by market demand score |
| `/analytics/learning` | Roadmap progress distribution & completion rates |
| `/analytics/opportunities` | Breakdown by category, experience, type |
| `/analytics/assessments` | Score distribution, completion rate, top topics |
| `/analytics/ratings` | Tier distribution, top users, rating trends |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for students who deserve better career tools.**

*KaushalSetu AI — Know your gaps. Build your path. Land your role.*

</div>