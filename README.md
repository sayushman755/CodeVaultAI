# CodeVault AI

CodeVault AI is a full-stack AI-powered coding journal, revision tracker, and personal developer knowledge vault.

It helps users store daily solved coding problems, generate AI-based line-by-line explanations, track coding streaks, manage pending problem statements, save reusable code logic, and revise everything through a flashcard-style Revision Mode.

---

## Project Purpose

This project is built for personal coding growth, interview preparation, and long-term technical revision.

Instead of only saving code, CodeVault AI helps users understand:

- What problem was solved
- When it was solved
- Which language was used
- How each line of code works
- What the time and space complexity are
- How to explain the solution in interviews
- What reusable logic or skill was learned
- What needs to be revised later

---

## Main Features

### Authentication

- User signup
- Built-in OTP verification for local development
- Login with JWT token
- Protected frontend routes
- Protected backend APIs
- User-wise data separation

Each user can only access their own:

- Solved problems
- Problem statements
- Knowledge notes
- Dashboard stats
- Revision items

---

### Dashboard

The dashboard displays:

- Total solved problems
- Problems solved today
- Current coding streak
- Longest coding streak
- Total active coding days
- Pending problem statements
- Solved problem statements
- Knowledge notes count
- Language-wise problem count
- Difficulty-wise problem count
- Topic-wise problem count

---

### Solved Problems

Users can:

- Add a solved coding problem
- Store problem title, statement, language, difficulty, topics, date, and code
- Generate AI explanation while saving
- View all saved problems
- Search problems by title
- Filter by language, difficulty, and topic
- View complete problem details
- Edit saved problems
- Regenerate AI explanation
- Delete problems
- Download revision notes as `.txt`

---

### AI Code Explanation

CodeVault AI uses the Groq API to generate:

- Line-by-line code explanation
- Summary of the solution
- Time complexity
- Space complexity
- Interview-style explanation

---

### Problem Statement Store

Users can store problems before solving them.

Features:

- Add pending problem statements
- Store source, difficulty, topics, planned language, and target date
- Mark statements as solved
- View pending statements
- View solved statements
- Delete statements

---

### Knowledge Vault

Knowledge Vault is a personal developer notebook.

It is used to store:

- Reusable code snippets
- New skills learned
- Project logic
- Bug fixes
- Commands
- Interview concepts
- Small logic blocks for future use

Example notes:

- Convert comma-separated input into array
- FastAPI router pattern
- MongoDB aggregation example
- React form handling logic
- JWT authentication flow
- Tailwind card layout pattern

Users can:

- Add knowledge notes
- Edit knowledge notes
- Search notes
- Filter by category
- Filter by tag
- Delete notes

---

### Revision Mode

Revision Mode combines:

- Saved coding problems
- Knowledge Vault notes

Users can revise everything like flashcards.

Features:

- Search revision items
- Filter by Problem or Knowledge Note
- Choose any item from the list
- Show/hide answer
- Move to previous or next item
- Revise code, explanation, concepts, and reusable logic in one place

---

## Tech Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- React Router DOM
- Axios

### Backend

- Python
- FastAPI
- Pydantic
- Uvicorn
- JWT authentication

### Database

- MongoDB
- PyMongo

### AI API

- Groq API

### Authentication

- JWT token
- Built-in OTP verification for local development
- Password hashing with Passlib and bcrypt

---

## Folder Structure

```text
CodeVaultAI/
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── .env
│   ├── requirements.txt
│   │
│   ├── models/
│   │   ├── auth_model.py
│   │   ├── problem_model.py
│   │   ├── statement_model.py
│   │   ├── ai_model.py
│   │   └── knowledge_model.py
│   │
│   ├── routes/
│   │   ├── auth_routes.py
│   │   ├── problem_routes.py
│   │   ├── statement_routes.py
│   │   ├── dashboard_routes.py
│   │   ├── ai_routes.py
│   │   └── knowledge_routes.py
│   │
│   └── services/
│       ├── auth_service.py
│       ├── auth_dependency.py
│       ├── ai_service.py
│       └── email_service.py
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js
│   │   │
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── VerifyOtp.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AddProblem.jsx
│   │   │   ├── ProblemList.jsx
│   │   │   ├── ProblemDetail.jsx
│   │   │   ├── EditProblem.jsx
│   │   │   ├── Statements.jsx
│   │   │   ├── KnowledgeVault.jsx
│   │   │   └── RevisionMode.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   └── tailwind.config.js
│
└── README.md