# LogicLatch AI

LogicLatch AI is an AI-powered learning platform that generates customized learning roadmaps based on your goals. It helps you master programming concepts through "Reverse Learning" - starting with what you want to build and learning the necessary skills to achieve it.

![LogicLatch AI Main Screen](./main_screen.png)

## Features

- **Goal-First Architecture**: Define what you want to build, and AI generates the roadmap.
- **Curated Tech Stack**: AI selects the optimal tools for your project.
- **Step-by-Step Learning**: Break down complex projects into manageable steps.
- **Interactive Quizzes**: Verify your understanding with AI-generated quizzes for each step.
- **Progress Tracking**: Track your completion status and quiz scores.
- **Multilingual Support**: Available in English and Japanese.

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **Internationalization**: next-intl

### Backend
- **Language**: Go (Golang)
- **Framework**: Echo
- **Database**: SQLite (with GORM)
- **AI**: Google Gemini API (gemini-flash-latest)
- **Authentication**: JWT

## Getting Started

### Prerequisites
- Node.js (v18+)
- Go (v1.21+)
- Google Gemini API Key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a `.env` file based on `.env.example` (or set environment variables):
   ```env
   GEMINI_API_KEY=your_api_key_here
   JWT_SECRET=your_jwt_secret
   ```

3. Run the server:
   ```bash
   go run cmd/server/main.go
   ```
   The backend server will start on `http://localhost:8081`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   The frontend application will be available at `http://localhost:3000`.

## Usage

1. Open `http://localhost:3000` in your browser.
2. Sign up for a new account.
3. Enter your learning goal (e.g., "Build a Todo App") and preferred tech stack.
4. Click "Propose Plan" to generate a roadmap.
5. Follow the steps and take quizzes to test your knowledge.

## License

[MIT](LICENSE)
