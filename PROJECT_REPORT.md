# Cartes - Project Report

## 1. Project Overview
**Cartes** (formerly LogicLatch/Reverse Learn) is an AI-powered "Reverse Learning" platform designed to help users master new skills by starting with their end goal. Instead of following a generic curriculum, users define what they want to build or achieve, and the AI generates a personalized, step-by-step roadmap with interactive quizzes to verify mastery at each stage.

### Core Concept: "Reverse Learning"
1.  **Goal-Oriented**: Users state a specific goal (e.g., "Build a Twitter clone with React").
2.  **AI Roadmap**: The system breaks this goal down into logical, manageable steps.
3.  **Verification**: Users must pass a quiz for each step to proceed, ensuring true understanding before moving forward.
4.  **Gamification**: Progress is tracked with scores and completion status to maintain motivation.

---

## 2. Technology Stack (Skill Set)

### Frontend (Client-Side)
Built for performance, interactivity, and a premium user experience.
*   **Framework**: **Next.js 16** (App Router) - Utilizing Server Components and Client Components for optimal rendering.
*   **Language**: **TypeScript** - Ensuring type safety and code maintainability.
*   **Styling**: **Tailwind CSS v4** - Utility-first CSS for rapid and consistent custom designs.
*   **Animations**: **Framer Motion** - Complex, smooth animations for page transitions and UI interactions.
*   **UI Components**: **shadcn/ui** (based on Radix UI) - Accessible, unstyled primitive components customized with Tailwind.
*   **Icons**: **Lucide React** - Consistent and clean SVG icons.
*   **State Management**: React Context API (AuthContext, ProjectContext).
*   **Internationalization**: **next-intl** - Full support for English and Japanese locales.

### Backend (Server-Side)
Built for scalability, speed, and reliability.
*   **Language**: **Go (Golang) 1.24** - High-performance, statically typed language.
*   **Web Framework**: **Echo v4** - Fast and minimalist web framework for Go.
*   **ORM**: **GORM** - Object-Relational Mapping for database interactions.
*   **Authentication**: **JWT (JSON Web Tokens)** - Secure, stateless authentication with bcrypt for password hashing.
*   **Job Queue**: Internal Go channels/worker pool pattern for handling asynchronous AI processing tasks without blocking HTTP requests.

### Database & Storage
*   **Production**: **PostgreSQL** (hosted on Supabase) - Robust, relational database for user data, projects, roadmaps, and scores.
*   **Development**: **SQLite** - Lightweight, file-based database for easy local development.

### Artificial Intelligence
*   **Provider**: **Google Gemini API** (Gemini 1.5 Flash / Pro).
*   **Usage**:
    *   Analyzing user goals to generate structured implementation plans (JSON).
    *   Generating relevant, context-aware multiple-choice quizzes for each learning step.
    *   Providing explanations for quiz answers.

### Infrastructure & DevOps
*   **Containerization**: **Docker** & **Docker Compose** - Multi-stage builds for optimized production images (Alpine Linux based).
*   **Frontend Hosting**: **Vercel** - Global edge network, automatic CI/CD for Next.js.
*   **Backend Hosting**: **DigitalOcean App Platform** - Managed container hosting with auto-scaling.
*   **Version Control**: **Git** & **GitHub**.

---

## 3. Key Features & Architecture

### Architecture Highlights
*   **Decoupled Monorepo**: Frontend and Backend exist in the same repository but are deployed independently.
*   **Asynchronous Processing**: Heavy AI tasks (roadmap generation) are offloaded to a background worker pool. The API returns a `202 Accepted` and a Job ID, which the frontend polls until completion. This prevents timeouts and improves perceived performance.
*   **Secure API**: All private endpoints are protected via JWT middleware. CORS is configured to allow secure cross-origin requests from the frontend.

### User Flow
1.  **Onboarding**: Users sign up/login (JWT issued).
2.  **Goal Setting**: User inputs a goal (e.g., "Create an E-commerce site").
3.  **Planning**: AI proposes a tech stack and high-level steps. User reviews/edits.
4.  **Generation**: Backend worker generates the full roadmap and saves it to DB.
5.  **Learning Loop**:
    *   User views a step.
    *   User takes a generated quiz.
    *   Score is recorded; next step unlocks (conceptually).
