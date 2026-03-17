# 📡 KaushalSetu AI — API Reference

> **Base URL:** `https://api.kaushalsetu.ai/api`  
> **Authentication:** JWT via HTTP-only cookies (`accessToken`, `refreshToken`)  
> **Content-Type:** `application/json` (unless noted)

---

## 📋 Table of Contents

- [Response Format](#response-format)
- [Error Codes](#error-codes)
- [Authentication](#-authentication--user-management)
- [Resume](#-resume)
- [Opportunities](#-opportunities)
- [Skill Gap Analysis](#-skill-gap-analysis)
- [Learning Roadmaps](#-learning-roadmaps)
- [Assessments](#-assessments)
- [Career Guidance](#-career-guidance)
- [Ratings](#-ratings)
- [Admin — Management](#-admin--management)
- [Admin — Analytics](#-admin--analytics)

---

## Response Format

All responses follow a consistent envelope:

```json
{
  "statusCode": 200,
  "message": "Human-readable message",
  "data": { ... } | [ ... ] | null,
  "success": true
}
```

**Error responses:**
```json
{
  "statusCode": 404,
  "message": "User not found",
  "success": false,
  "errors": []
}
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| `400` | Bad Request — missing or invalid input |
| `401` | Unauthorized — missing or expired token |
| `402` | Account Blacklisted |
| `403` | Forbidden — email not verified / insufficient role |
| `404` | Resource not found |
| `422` | Unprocessable Entity (e.g., unreadable PDF) |
| `500` | Internal Server Error |

---

## 🔐 Authentication & User Management

**Base path:** `/api/users`  
**Auth required:** No (public routes) / Yes (protected routes, marked with 🔒)

---

### `POST /register`

Register a new user. Sends an OTP to the provided email.

**Request Body:**
```json
{
  "name": "Arjun Sharma",
  "email": "arjun@example.com",
  "password": "securePass123"
}
```

**Response `201`:**
```json
{
  "message": "OTP sent to email for verification",
  "data": { "email": "arjun@example.com" }
}
```

**Validations:**
- All fields required
- Password minimum 6 characters
- Duplicate verified email rejected

---

### `POST /verify-email`

Verify OTP sent during registration. Returns auth cookies on success.

**Request Body:**
```json
{
  "email": "arjun@example.com",
  "otp": "482910"
}
```

**Response `200`:**
```json
{
  "message": "Email verified and login successful",
  "data": { "user": { ... } }
}
```
Sets `accessToken` (15min) and `refreshToken` (7 days) as HTTP-only cookies.

---

### `POST /resend-otp`

Resend OTP for unverified users.

**Request Body:**
```json
{ "email": "arjun@example.com" }
```

---

### `POST /login`

Authenticate with email and password.

**Request Body:**
```json
{
  "email": "arjun@example.com",
  "password": "securePass123"
}
```

**Response `200`:**
```json
{
  "message": "Login successful",
  "data": { "user": { "_id": "...", "name": "Arjun Sharma", "email": "...", "role": "student" } }
}
```

---

### `POST /logout` 🔒

Clears auth cookies and invalidates refresh token.

**Response `200`:**
```json
{ "message": "Logout successful" }
```

---

### `POST /refresh-token`

Rotate the access token using the refresh token cookie.

**Response `200`:** Sets new `accessToken` cookie.

---

### `POST /forgot-password`

Initiates password reset. Sends a signed reset link to email.

**Request Body:**
```json
{ "email": "arjun@example.com" }
```

---

### `POST /reset-password/:token`

Complete password reset using the token from the email link.

**Request Body:**
```json
{ "newPassword": "newSecurePass456" }
```

---

### `GET /auth/google`

Initiates Google OAuth 2.0 flow. Redirects to Google consent screen.

---

### `GET /auth/google/callback`

OAuth callback. On success, sets auth cookies and redirects to `FRONTEND_URL/dashboard`.

---

### `GET /profile` 🔒

Fetch the authenticated user's full profile.

**Response `200`:**
```json
{
  "data": {
    "user": {
      "_id": "...",
      "name": "Arjun Sharma",
      "email": "arjun@example.com",
      "role": "student",
      "isEmailVerified": true,
      "avatar": { "url": "...", "publicId": "..." },
      "areaOfInterest": [...],
      "theme": "dark"
    }
  }
}
```

---

### `PUT /profile` 🔒

Update profile fields (name, bio, etc.).

---

### `PUT /change-password` 🔒

**Request Body:**
```json
{
  "currentPassword": "oldPass123",
  "newPassword": "newPass456"
}
```

---

### `PATCH /interests` 🔒

Toggle an area of interest (adds if not present, removes if present).

**Request Body:**
```json
{
  "name": "Machine Learning",
  "category": "AI"
}
```

---

### `GET /interests` 🔒

Fetch the authenticated user's interests array.

---

### `PATCH /avatar` 🔒

Upload and set a new avatar. Uploads to Cloudinary.

**Content-Type:** `multipart/form-data`  
**Field:** `avatar` (image file)

---

### `PATCH /theme` 🔒

**Request Body:**
```json
{ "theme": "dark" }
```
Accepted values: `"light"` | `"dark"`

---

## 📄 Resume

**Base path:** `/api/resume`  
**Auth required:** 🔒 All routes

---

### `POST /upload`

Upload a PDF resume. Extracts text and runs AI parsing pipeline.

**Content-Type:** `multipart/form-data`  
**Field:** `resume` (PDF file, max 10MB)

**Response `201`:**
```json
{
  "message": "Resume uploaded & saved",
  "data": {
    "resumeId": "64abc...",
    "data": {
      "name": "Arjun Sharma",
      "email": "arjun@example.com",
      "skills": [
        { "name": "Python", "level": "intermediate" },
        { "name": "React", "level": "advanced" }
      ],
      "experience": [...],
      "education": [...],
      "projects": [...],
      "categories": [
        { "name": "Full Stack Development" }
      ]
    }
  }
}
```

**Notes:**
- Auto-increments `resumeVersion` per user
- Unreadable PDFs return `422`

---

### `GET /`

Fetch the user's most recently uploaded resume.

**Response `200`:** Full `ResumeParsed` document.

---

### `PUT /:id`

Manually update specific resume sections.

**Request Body (all fields optional):**
```json
{
  "skills": [{ "name": "TypeScript", "level": "intermediate" }],
  "education": [...],
  "experience": [...],
  "projects": [...]
}
```

---

## 💼 Opportunities

**Base path:** `/api/opportunities`  
**Auth required:** 🔒 All routes

---

### `GET /`

Fetch opportunities. If the user has a parsed resume with categories, results are filtered to matching categories. Falls back to 50 most recent if no resume exists.

**Response `200`:**
```json
{
  "message": "Opportunities for Full Stack Development fetched",
  "data": [
    {
      "_id": "...",
      "title": "Junior Backend Developer",
      "company": "TechCorp",
      "location": "Remote",
      "category": "Full Stack Development",
      "opportunityType": "job",
      "experienceLevel": "junior",
      "requiredSkills": ["Node.js", "MongoDB", "Express"],
      "aiEnriched": true
    }
  ]
}
```

---

### `GET /ranked`

Returns opportunities ranked by AI-weighted match score against the user's resume skills and current market demand.

**Response `200`:**
```json
{
  "data": [
    {
      "jobId": "...",
      "title": "Backend Developer",
      "company": "StartupXYZ",
      "weightedScore": 87.4,
      "matchedSkills": ["Node.js", "MongoDB"],
      "missingSkills": ["Redis", "Docker"],
      "skillCoverage": 0.72,
      "demandWeight": 1.21,
      "requiredSkills": ["Node.js", "MongoDB", "Redis", "Docker"]
    }
  ]
}
```

**Algorithm:** `weightedScore = skillCoverage × demandWeight × 100`

---

## 🔍 Skill Gap Analysis

**Base path:** `/api/skillgap`  
**Auth required:** 🔒 All routes

---

### `GET /analyze/:opportunityId`

Generate a full skill gap report comparing the user's latest resume against a specific opportunity.

**Response `200`:**
```json
{
  "message": "Skill gap report fetched",
  "data": {
    "matchedSkills": ["Python", "SQL", "React"],
    "missingSkills": ["Docker", "Kubernetes", "CI/CD"],
    "matchPercentage": 62,
    "opportunityTitle": "DevOps Engineer",
    "recommendations": "Focus on containerization and cloud deployment skills..."
  }
}
```

---

## 🗺️ Learning Roadmaps

**Base path:** `/api/roadmap`  
**Auth required:** 🔒 All routes

---

### `POST /generate/:opportunityId`

Generate a personalized learning roadmap for a specific opportunity based on identified skill gaps.

**Response `201`:**
```json
{
  "message": "Roadmap Generated Successfully",
  "data": {
    "_id": "...",
    "user": "...",
    "opportunity": "...",
    "progress": 0,
    "roadmap": [
      {
        "week": 1,
        "title": "Docker Fundamentals",
        "tasks": [
          {
            "_id": "...",
            "title": "Learn Docker basics",
            "description": "Complete Docker official tutorial",
            "resourceUrl": "https://docs.docker.com/get-started/",
            "isCompleted": false
          }
        ]
      }
    ]
  }
}
```

---

### `POST /custom-target`

Define a career goal and generate a roadmap toward it.

**Request Body:**
```json
{
  "targetRole": "Machine Learning Engineer",
  "category": "AI/ML",
  "specificSkills": ["TensorFlow", "PyTorch", "MLOps"]
}
```

**Response `201`:**
```json
{
  "data": {
    "target": { "_id": "...", "targetRole": "Machine Learning Engineer", ... },
    "roadmap": { ... }
  }
}
```

---

### `POST /generate-ranked-job-roadmap`

Generate a roadmap directly from ranked job match data.

**Request Body:**
```json
{
  "jobTitle": "Backend Developer",
  "category": "Full Stack Development",
  "missingSkills": ["Redis", "Docker"],
  "opportunityId": "64abc..."
}
```

---

### `GET /`

Fetch all roadmaps for the authenticated user (with opportunity and target skill details).

---

### `GET /completed`

Fetch only roadmaps where `progress === 100`.

---

### `PATCH /:roadmapId/task/:taskId`

Toggle a task's completion status. Automatically recalculates overall roadmap progress percentage.

**Response `200`:**
```json
{
  "message": "Task status updated successfully",
  "data": {
    "_id": "...",
    "progress": 35,
    "roadmap": [...]
  }
}
```

---

### `DELETE /:roadmapId`

Permanently delete a roadmap.

---

## 📝 Assessments

**Base path:** `/api/assessment`  
**Auth required:** 🔒 All routes

---

### `POST /generate`

Generate a new AI-powered assessment on a given topic.

**Request Body:**
```json
{ "topic": "JavaScript Closures" }
```

**Response `201`:**
```json
{
  "message": "Assessment created successfully",
  "data": "64assessmentId..."
}
```

---

### `PATCH /start/:assessmentId`

Mark assessment as started (records `timeStarted`). Returns questions **without** correct answers.

**Response `200`:**
```json
{
  "data": {
    "maxScore": 100,
    "assessment": {
      "_id": "...",
      "topic": "JavaScript Closures",
      "questions": [
        {
          "_id": "...",
          "question": "What is a closure in JavaScript?",
          "options": ["A", "B", "C", "D"]
        }
      ]
    }
  }
}
```

---

### `POST /submit`

Submit answers. Calculates score, records duration, and updates ELO rating.

**Request Body:**
```json
{
  "assessmentId": "64abc...",
  "answers": ["A", "C", "B", "D", "A"]
}
```

**Response `200`:**
```json
{
  "data": {
    "score": 80,
    "duration": 342.5,
    "maxScore": 100
  }
}
```

---

### `GET /`

Fetch all completed assessments for the authenticated user.

---

### `GET /:assessmentId`

Fetch a specific assessment (includes correct answers for review).

---

## 🎯 Career Guidance

**Base path:** `/api/guidance`  
**Auth required:** 🔒 All routes

---

### `POST /job-readiness`

Generate an AI job readiness report based on the user's latest resume and a target interest.

**Request Body:**
```json
{ "interest": "Backend Development" }
```

**Response `201`:** Full readiness report with scores, strengths, weaknesses, and action items.

---

### `GET /job-readiness`

Fetch all previously generated job readiness reports.

---

### `POST /interest-guide`

Generate an AI career pathway guide for a given interest area.

**Request Body:**
```json
{ "interest": "Product Management" }
```

---

### `GET /interest-guide`

Fetch all previously generated interest guides.

---

### `POST /freelance-guide`

Generate an AI freelance opportunity guide for a skill/interest.

**Request Body:**
```json
{ "interest": "UI/UX Design" }
```

---

### `GET /freelance-guide`

Fetch all previously generated freelance guides.

---

## ⭐ Ratings

**Base path:** `/api/rating`  
**Auth required:** Partial (noted per route)

---

### `GET /tiers`

Public endpoint. Returns all tier definitions.

**Response `200`:**
```json
{
  "data": [
    { "title": "Bronze", "min": 0, "max": 1199, "color": "#CD7F32" },
    { "title": "Silver", "min": 1200, "max": 1399, "color": "#C0C0C0" },
    { "title": "Gold", "min": 1400, "max": 1599, "color": "#FFD700" },
    { "title": "Platinum", "min": 1600, "max": 1799, "color": "#E5E4E2" },
    { "title": "Diamond", "min": 1800, "max": 9999, "color": "#B9F2FF" }
  ]
}
```

---

### `GET /me` 🔒

Get the authenticated user's current rating and tier.

**Response `200`:**
```json
{
  "data": {
    "currentRating": 1642,
    "peakRating": 1701,
    "totalAssessments": 14,
    "tier": { "title": "Platinum", "color": "#E5E4E2" }
  }
}
```

---

### `GET /me/history` 🔒

Paginated rating event history (newest first).

**Query Parameters:**

| Param | Default | Description |
|-------|---------|-------------|
| `page` | `1` | Page number |
| `limit` | `20` | Results per page |

**Response `200`:**
```json
{
  "data": {
    "history": [
      {
        "ratingBefore": 1620,
        "ratingAfter": 1642,
        "delta": 22,
        "assessmentScore": 85,
        "createdAt": "2024-03-15T10:30:00.000Z"
      }
    ],
    "total": 14,
    "currentPage": 1,
    "totalPages": 1
  }
}
```

---

## 🛡️ Admin — Management

**Base path:** `/api/admin`  
**Auth required:** 🔒 Admin role only

---

### `GET /dashboard`

Comprehensive platform statistics snapshot.

**Response `200`:**
```json
{
  "data": {
    "users": { "total": 1240, "verified": 1183, "blacklisted": 7 },
    "opportunities": { "total": 3420, "active": 3104, "pendingEnrichment": 234 },
    "resumes": 987,
    "roadmaps": { "total": 2341, "completed": 412, "avgProgress": 47 },
    "assessments": { "total": 8901, "completed": 7234, "avgScore": 72 },
    "recentLogs": [...]
  }
}
```

---

### `GET /fetch`

Trigger opportunity ingestion from external sources + regenerate skill demand data. Responds immediately with `202 Accepted` and runs async.

---

### `POST /enrich`

Trigger AI enrichment batch on all unenriched active opportunities. Runs async.

**Response `202`:**
```json
{
  "message": "AI enrichment started",
  "data": { "pending": 234 }
}
```

---

### `PATCH /blacklist/:userId`

Toggle blacklist status for a user.

**Response `200`:**
```json
{
  "message": "User blacklisted",
  "data": { "isBlacklisted": true }
}
```

---

### `GET /logs`

Paginated system audit log.

**Query Parameters:**

| Param | Description |
|-------|-------------|
| `level` | Filter by log level (`info`, `warn`, `error`) |
| `action` | Filter by action type (e.g., `USER_LOGIN`) |
| `page` | Page number (default: 1) |
| `limit` | Results per page (default: 20) |

---

### `GET /logs/export`

Export all system logs as a CSV file download.

**Response:** `Content-Type: text/csv` with columns: `Date, Level, Action, User, Message, URL`

---

### `GET /users`

Fetch all student accounts (excludes sensitive fields like password, tokens).

---

## 📊 Admin — Analytics

**Base path:** `/api/admin/analytics`  
**Auth required:** 🔒 Admin role only

---

### `GET /overview`

Platform totals: users, resumes, opportunities, roadmaps, assessments.

---

### `GET /user-growth`

Monthly user registration counts grouped by month number.

**Response `200`:**
```json
{
  "data": [
    { "_id": 1, "count": 84 },
    { "_id": 2, "count": 112 },
    ...
  ]
}
```

---

### `GET /top-skills`

Top 10 most common skills across all parsed resumes.

---

### `GET /missing-skills`

Top 10 most frequent missing skills across all skill gap reports.

---

### `GET /skill-demand`

Top 10 skills by labour market demand score with region and growth trend.

---

### `GET /learning`

Learning roadmap insights: average progress, completion rate, progress bucket distribution (0–25%, 26–50%, 51–75%, 76–100%).

---

### `GET /opportunities`

Opportunity breakdown by category, experience level, and opportunity type.

---

### `GET /assessments`

Assessment insights: overview, score distribution across 5 bands, top 8 most-tested topics.

---

### `GET /ratings`

Rating system insights including tier distribution, top 10 users by rating, and monthly average rating trend.

**Response `200` (partial):**
```json
{
  "data": {
    "avgRating": 1523,
    "maxRating": 2140,
    "totalRated": 847,
    "tierDistribution": [
      { "tier": "Bronze", "color": "#CD7F32", "count": 213 },
      ...
    ],
    "topUsers": [...],
    "ratingByMonth": [
      { "month": "Jan", "avgRating": 1498, "events": 234 },
      ...
    ]
  }
}
```

---

## 🔄 Pagination Pattern

All paginated endpoints accept:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Number | `1` | Page number (1-indexed) |
| `limit` | Number | `20` | Items per page |

All paginated responses include:
```json
{
  "currentPage": 2,
  "totalPages": 8,
  "total": 156
}
```

---

## 🍪 Cookie Reference

| Cookie | MaxAge | Scope |
|--------|--------|-------|
| `accessToken` | 15 minutes | All authenticated requests |
| `refreshToken` | 7 days | Token refresh only |

Both cookies are set with `httpOnly: true`, `secure: true`, `sameSite: None`.

---

*KaushalSetu AI API · Built for speed, security, and scale.*