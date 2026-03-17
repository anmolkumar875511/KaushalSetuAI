# 🗄️ KaushalSetu AI — Data Model Reference

> Complete schema documentation for all Mongoose models in the KaushalSetu AI platform.  
> All models use MongoDB via Mongoose ODM with automatic `createdAt` / `updatedAt` timestamps unless noted.

---

## 📋 Table of Contents

- [Entity Relationship Overview](#entity-relationship-overview)
- [User](#-user)
- [ResumeParsed](#-resumeparsed)
- [Opportunity](#-opportunity)
- [SkillDemand](#-skilldemand)
- [SkillGapReport](#-skillgapreport)
- [LearningRoadmap](#-learningroadmap)
- [TargetSkill](#-targetskill)
- [Assessment](#-assessment)
- [UserRating](#-userrating)
- [JobReadinessReport](#-jobreadinessreport)
- [InterestGuide](#-interestguide)
- [FreelanceGuide](#-freelanceguide)
- [Log](#-log)

---

## Entity Relationship Overview

```
User ──────────────┬──── ResumeParsed (1:many, versioned)
                   │
                   ├──── LearningRoadmap (1:many)
                   │         └── TargetSkill (optional ref)
                   │         └── Opportunity (optional ref)
                   │
                   ├──── Assessment (1:many)
                   │
                   ├──── UserRating (1:1)
                   │
                   ├──── SkillGapReport (1:many)
                   │         └── Opportunity (ref)
                   │
                   ├──── JobReadinessReport (1:many)
                   │         └── ResumeParsed (ref)
                   │
                   ├──── InterestGuide (1:many)
                   ├──── FreelanceGuide (1:many)
                   └──── Log (1:many)

Opportunity ───────┬──── SkillGapReport
                   └──── LearningRoadmap

SkillDemand ─────────── (standalone, populated by ingestion service)
```

---

## 👤 User

**Collection:** `users`

The central identity document. Supports both email/password and Google OAuth auth flows.

```
User {
  _id                  ObjectId (PK)
  name                 String          required
  email                String          required, unique, lowercase
  password             String          select: false (bcrypt hashed)
  role                 Enum            ['student', 'admin']  default: 'student'
  
  // Email Verification
  isEmailVerified      Boolean         default: false
  emailOTP             String          select: false (hashed)
  emailOTPExpires      Date            select: false
  
  // Google OAuth
  googleId             String          sparse, unique
  
  // Password Reset
  passwordResetToken   String
  passwordResetExpires Date
  
  // Account Status
  isBlacklisted        Boolean         default: false
  
  // Profile
  avatar {
    url                String
    publicId           String
  }
  areaOfInterest [
    {
      name             String          required
      category         String          default: 'General'
    }
  ]
  theme                Enum            ['light', 'dark']  default: 'light'
  
  // Auth Tokens
  refreshToken         String
  
  // Timestamps
  createdAt            Date
  updatedAt            Date
}
```

**Instance Methods:**
| Method | Description |
|--------|-------------|
| `isPasswordMatch(password)` | Compares plain password against bcrypt hash |
| `setEmailOTP(otp)` | Hashes and stores OTP with 10-minute expiry |
| `isEmailOTPMatch(otp)` | Validates OTP against stored hash |
| `clearEmailOTP()` | Removes OTP fields post-verification |
| `generateAccessToken()` | Signs JWT with 15-minute expiry |
| `generateRefreshToken()` | Signs JWT with 7-day expiry |
| `generatePasswordResetToken()` | Generates SHA-256 hashed reset token (10-min expiry) |
| `toJSON()` | Returns user object excluding sensitive fields |

**Pre-save Hooks:**
- Bcrypt hashes `password` field (cost factor 10) when modified

**Indexes:**
- `email` (unique)
- `googleId` (unique, sparse)

---

## 📄 ResumeParsed

**Collection:** `resumeparseds`

Stores AI-extracted structured data from uploaded PDF resumes. Supports versioning — each upload creates a new document.

```
ResumeParsed {
  _id                  ObjectId (PK)
  user                 ObjectId        ref: 'User', required
  resumeVersion        Number          default: 1
  
  // Parsed Identity
  name                 String
  email                String
  phone                String
  location             String
  linkedin             String
  github               String
  summary              String
  
  // Skills
  skills [
    {
      name             String
      level            Enum            ['beginner', 'intermediate', 'advanced', 'expert']
    }
  ]
  
  // AI-derived Categories
  categories [
    {
      name             String          (e.g., "Full Stack Development", "Data Science")
    }
  ]
  
  // Experience
  experience [
    {
      title            String
      company          String
      location         String
      startDate        String
      endDate          String
      description      String
      technologies     [String]
    }
  ]
  
  // Education
  education [
    {
      degree           String
      institution      String
      location         String
      startYear        String
      endYear          String
      gpa              String
    }
  ]
  
  // Projects
  projects [
    {
      name             String
      description      String
      technologies     [String]
      url              String
    }
  ]
  
  // Meta
  parsingMeta {
    parsedAt           Date
    parserVersion      String          default: 'v1.0'
  }
  
  createdAt            Date
  updatedAt            Date
}
```

**Indexes:**
- `{ user: 1, resumeVersion: -1 }` — efficient latest-version lookups

---

## 💼 Opportunity

**Collection:** `opportunities`

Job and internship postings. Ingested from external sources and enriched by AI.

```
Opportunity {
  _id                  ObjectId (PK)
  
  // Core Details
  title                String          required
  company              String          required
  location             String
  description          String
  url                  String
  
  // Classification
  category             String          (e.g., 'Full Stack Development', 'Data Science')
  opportunityType      Enum            ['job', 'internship', 'freelance', 'contract']
  experienceLevel      Enum            ['junior', 'mid', 'senior', 'entry']
  
  // Skills
  requiredSkills       [String]
  
  // AI Enrichment
  aiEnriched           Boolean         default: false
  enrichedAt           Date
  
  // Status
  isActive             Boolean         default: true
  postedAt             Date
  
  // Source
  source               String          (ingestion source identifier)
  externalId           String          unique per source
  
  createdAt            Date
  updatedAt            Date
}
```

**Indexes:**
- `{ category: 1, isActive: 1 }`
- `{ aiEnriched: 1, isActive: 1 }` — used by enrichment batch service
- `{ externalId: 1, source: 1 }` (unique, for deduplication)

---

## 📈 SkillDemand

**Collection:** `skilldemands`

Regional labour market data. Populated by the ingestion + demand analysis pipeline.

```
SkillDemand {
  _id                  ObjectId (PK)
  skill                String          required (e.g., 'Python', 'React')
  region               String          (e.g., 'remote', 'india', 'us')
  demandScore          Number          0–100 normalized demand score
  avgSalary            Number          average salary for this skill in region
  growthTrend          Enum            ['rising', 'stable', 'declining']
  sampleSize           Number          number of postings analyzed
  
  createdAt            Date
  updatedAt            Date
}
```

**Usage:** Referenced by the weighted match service to boost scores for high-demand skills.

**Indexes:**
- `{ skill: 1, region: 1 }` (unique)

---

## 🔍 SkillGapReport

**Collection:** `skillgapreports`

Per-user, per-opportunity skill gap analysis results.

```
SkillGapReport {
  _id                  ObjectId (PK)
  user                 ObjectId        ref: 'User', required
  opportunity          ObjectId        ref: 'Opportunity', required
  resume               ObjectId        ref: 'ResumeParsed'
  
  matchedSkills        [String]        skills user has that the job requires
  missingSkills        [String]        skills job requires that user lacks
  matchPercentage      Number          0–100
  
  // AI-generated narrative
  recommendations      String          actionable advice text
  
  createdAt            Date
  updatedAt            Date
}
```

**Indexes:**
- `{ user: 1, opportunity: 1 }` (unique — one report per user/opportunity pair)

---

## 🗺️ LearningRoadmap

**Collection:** `learningroadmaps`

Week-by-week AI-generated learning plan with task tracking and progress calculation.

```
LearningRoadmap {
  _id                  ObjectId (PK)
  user                 ObjectId        ref: 'User', required
  
  // Source reference (one of the following)
  opportunity          ObjectId        ref: 'Opportunity'
  targetSkill          ObjectId        ref: 'TargetSkill'
  
  // Type tag
  roadmapType          Enum            ['opportunity', 'custom', 'ranked']
  
  // Progress (0–100, auto-computed on task toggle)
  progress             Number          default: 0
  
  // Weekly Structure
  roadmap [
    {
      week             Number          week number
      title            String          e.g., "Docker Fundamentals"
      tasks [
        {
          _id          ObjectId        (auto-generated, used as taskId in PATCH)
          title        String
          description  String
          resourceUrl  String
          isCompleted  Boolean         default: false
        }
      ]
    }
  ]
  
  createdAt            Date
  updatedAt            Date
}
```

**Key Behaviour:**
- `progress` is recalculated on every `PATCH /:roadmapId/task/:taskId` call:
  `progress = Math.round((completedTasks / totalTasks) * 100)`
- Task `_id` values are used directly in the toggle endpoint URL

**Indexes:**
- `{ user: 1, progress: 1 }` — efficient completed roadmap queries

---

## 🎯 TargetSkill

**Collection:** `targetskills`

User-defined career goal used to generate custom roadmaps.

```
TargetSkill {
  _id                  ObjectId (PK)
  user                 ObjectId        ref: 'User', required
  targetRole           String          required  (e.g., "Machine Learning Engineer")
  category             String          (e.g., "AI/ML")
  specificSkills       [String]        explicit skills user wants to learn
  
  createdAt            Date
  updatedAt            Date
}
```

---

## 📝 Assessment

**Collection:** `assessments`

AI-generated topic assessments with timing, scoring, and answer tracking.

```
Assessment {
  _id                  ObjectId (PK)
  userId               ObjectId        ref: 'User', required
  topic                String          required (e.g., "JavaScript Closures")
  
  // Questions (correct answer hidden until after submission)
  questions [
    {
      _id              ObjectId
      question         String
      options          [String]        4 options (A–D)
      correctAnswer    String          select: false on startAssessment
      userAnswer       String          populated on submit
      isCorrect        Boolean         computed on submit
    }
  ]
  
  // Scoring
  score                Number          0–100 (null until submitted)
  
  // Status
  completed            Boolean         default: false
  
  // Timing
  timeStarted          Date            set on PATCH /start
  timeCompleted        Date            set on POST /submit
  duration             Number          seconds (timeCompleted - timeStarted)
  
  createdAt            Date
  updatedAt            Date
}
```

**Score Calculation:**
`score = (correctAnswers / totalQuestions) × 100`

**Post-Submit Side Effect:**
- Triggers `updateUserRating({ userId, assessment })` in the rating service
- Rating delta is calculated based on score and current ELO

**Indexes:**
- `{ userId: 1, completed: 1, createdAt: -1 }`

---

## ⭐ UserRating

**Collection:** `userratings`

ELO-style competitive rating system. One document per user.

```
UserRating {
  _id                  ObjectId (PK)
  user                 ObjectId        ref: 'User', required, unique
  
  currentRating        Number          default: 1500
  peakRating           Number          default: 1500
  totalAssessments     Number          default: 0
  
  // Full event history (appended, never overwritten)
  history [
    {
      ratingBefore     Number
      ratingAfter      Number
      delta            Number          positive (gain) or negative (loss)
      assessmentScore  Number          0–100 score that triggered this update
      assessmentId     ObjectId        ref: 'Assessment'
      createdAt        Date
    }
  ]
  
  createdAt            Date
  updatedAt            Date
}
```

**Tier Definitions** (exported as `RATING_TIERS`):

| Tier | Min Rating | Max Rating | Color |
|------|-----------|-----------|-------|
| Bronze | 0 | 1199 | `#CD7F32` |
| Silver | 1200 | 1399 | `#C0C0C0` |
| Gold | 1400 | 1599 | `#FFD700` |
| Platinum | 1600 | 1799 | `#E5E4E2` |
| Diamond | 1800 | ∞ | `#B9F2FF` |

**`getTierForRating(rating)`** — exported helper that returns the full tier object for a given rating.

**Rating Algorithm:**  
Scores above 50 increase the rating; below 50 decrease it.  
Delta magnitude scales with distance from 50 (a score of 100 gives a larger boost than 60).

---

## 📊 JobReadinessReport

**Collection:** `jobreadinessreports`

AI-generated holistic evaluation of a user's readiness for a career path.

```
JobReadinessReport {
  _id                  ObjectId (PK)
  user                 ObjectId        ref: 'User', required
  resume               ObjectId        ref: 'ResumeParsed'
  interest             String          target career area
  
  // Scores (0–100)
  overallScore         Number
  technicalScore       Number
  experienceScore      Number
  educationScore       Number
  
  // Narrative
  strengths            [String]
  weaknesses           [String]
  actionItems          [String]
  summary              String
  
  createdAt            Date
  updatedAt            Date
}
```

---

## 🧭 InterestGuide

**Collection:** `interestguides`

AI-generated career pathway guide for a specific interest area.

```
InterestGuide {
  _id                  ObjectId (PK)
  user                 ObjectId        ref: 'User', required
  interest             String          required
  
  // Content
  overview             String          career path overview
  coreSkills           [String]        essential skills for this path
  careerPaths          [String]        possible job roles/titles
  topResources         [String]        learning resources
  salaryRange          String          typical compensation range
  marketDemand         String          market outlook narrative
  
  createdAt            Date
  updatedAt            Date
}
```

---

## 💰 FreelanceGuide

**Collection:** `freelanceguides`

AI-generated guide for monetizing skills through freelance work.

```
FreelanceGuide {
  _id                  ObjectId (PK)
  user                 ObjectId        ref: 'User', required
  interest             String          required
  
  // Content
  overview             String
  platforms            [String]        (e.g., "Upwork", "Fiverr", "Toptal")
  rateGuide            String          typical hourly/project rates
  portfolioTips        [String]
  clientAcquisition    [String]
  topSkillsToLearn     [String]
  
  createdAt            Date
  updatedAt            Date
}
```

---

## 📋 Log

**Collection:** `logs`

Full audit trail of platform actions. Written on every significant event.

```
Log {
  _id                  ObjectId (PK)
  level                Enum            ['info', 'warn', 'error']
  message              String          human-readable description
  
  user                 ObjectId        ref: 'User' (nullable for system actions)
  
  meta {
    action             String          action code (e.g., 'USER_LOGIN', 'RESUME_UPLOAD')
    url                String          request URL
    method             String          HTTP method
    ip                 String          client IP
    userAgent          String
    error              String          stringified error (level: 'error' only)
  }
  
  createdAt            Date            (no updatedAt — logs are immutable)
}
```

**Action Codes Reference:**

| Action | Trigger |
|--------|---------|
| `USER_REGISTER` | New user registration |
| `EMAIL_VERIFIED` | OTP verified |
| `USER_LOGIN` | Successful email/password login |
| `USER_LOGIN_GOOGLE` | Successful Google OAuth login |
| `USER_LOGIN_ATTEMPT_BLACKLISTED` | Blacklisted user attempted login |
| `USER_LOGOUT` | Explicit logout |
| `USER_UPDATE` | Profile updated |
| `USER_PASSWORD_CHANGE` | Password changed |
| `USER_PASSWORD_RESET` | Password reset completed |
| `USER_INTEREST_TOGGLE` | Interest added or removed |
| `USER_AVATAR_UPLOAD` | Avatar uploaded |
| `USER_BLACKLIST_TOGGLE` | Admin blacklisted/whitelisted user |
| `RESUME_UPLOAD` | Resume PDF uploaded |
| `RESUME_UPDATE` | Resume manually edited |
| `SKILL_GAP_REPORT_FETCH` | Skill gap report generated |
| `ROADMAP_GENERATE` | Opportunity roadmap created |
| `TARGET_ROADMAP_GENERATE` | Custom target roadmap created |
| `RANKED_JOB_ROADMAP_GENERATE` | Ranked job roadmap created |
| `TASK_STATUS_UPDATE` | Task toggled in roadmap |
| `ASSESSMENT_GENERATE` | New assessment created |
| `ASSESSMENT_START` | Assessment started |
| `ASSESSMENT_SUBMIT` | Assessment submitted |
| `JOB_READINESS_GENERATE` | Job readiness report created |
| `INTEREST_GUIDE_GENERATE` | Interest guide created |
| `FREELANCE_GUIDE_GENERATE` | Freelance guide created |
| `ADMIN_FETCHED_OPPORTUNITIES` | Admin triggered ingestion |
| `ADMIN_FETCH_OPPORTUNITIES_FAILED` | Ingestion failed |
| `ADMIN_TRIGGERED_ENRICHMENT` | Admin triggered AI enrichment |
| `ADMIN_ENRICHMENT_FAILED` | Enrichment batch failed |
| `ADMIN_FETCHED_LOGS` | Admin fetched audit logs |
| `ADMIN_EXPORTED_LOGS` | Admin exported logs to CSV |

**Indexes:**
- `{ level: 1, createdAt: -1 }`
- `{ 'meta.action': 1 }`
- `{ user: 1, createdAt: -1 }`

---

## 📐 Common Sub-document Patterns

### Skill Object
Used in `ResumeParsed.skills` and referenced across services:
```json
{ "name": "Python", "level": "advanced" }
```

### Category Object
Used in `ResumeParsed.categories` for AI-derived domain classification:
```json
{ "name": "Data Science" }
```

### Area of Interest Object
Used in `User.areaOfInterest`:
```json
{ "name": "Machine Learning", "category": "AI" }
```

---

## 🔗 Cross-Model Data Flow

```
1. User uploads PDF
   └─→ ResumeParsed created (skills, categories, experience extracted)

2. User browses Opportunities
   └─→ Filtered by resume.categories
   └─→ rankedJobs uses resume.skills + SkillDemand for weighted scoring

3. User requests Skill Gap
   └─→ SkillGapReport created (resume.skills vs opportunity.requiredSkills)

4. User generates Roadmap
   └─→ LearningRoadmap created referencing opportunity or TargetSkill
   └─→ Weekly tasks generated to close missingSkills

5. User takes Assessment
   └─→ Assessment created with AI questions
   └─→ On submit → score calculated → UserRating updated
   └─→ Rating history event appended

6. Admin triggers /fetch
   └─→ Opportunities ingested → SkillDemand regenerated

7. Admin triggers /enrich
   └─→ Unenriched Opportunities get AI-extracted requiredSkills, category, etc.

8. Every action → Log entry written
```

---

*KaushalSetu AI Data Models · Designed for intelligence, built for scale.*