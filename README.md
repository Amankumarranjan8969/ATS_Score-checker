# 🚀 ATS Resume Analyzer

An AI-powered full-stack web application that analyzes resumes and provides an ATS (Applicant Tracking System) score based on job descriptions or target companies. It helps candidates optimize their resumes by identifying missing keywords, improving structure, and increasing their chances of selection.

---

## 📌 Project Overview

The ATS Resume Analyzer simulates real-world Applicant Tracking Systems used by companies like Google, Amazon, and Microsoft.
It evaluates resumes using keyword matching, NLP techniques, and structured scoring algorithms.

---

## 🎯 Key Features

* 📄 Upload Resume (PDF/DOCX)
* 🏢 Company-based Analysis (Google, Amazon, Microsoft)
* 📊 ATS Score (0–100)
* 📈 Score Breakdown (Keyword Match, Skills, Formatting, etc.)
* 🔍 Missing Keywords Detection
* 💡 Smart Suggestions for Resume Improvement
* 📊 Dashboard UI with charts and score indicators
* ⚡ Fast and responsive interface

---

## 🧠 How It Works

1. User uploads resume

2. Resume is parsed using PDF/DOCX parser

3. Job description or company dataset is processed

4. NLP techniques extract keywords

5. Resume is compared with job description

6. Score is calculated using weighted metrics:

   **ATS Score = 0.4 × Keyword Match + 0.2 × Skills + 0.15 × Formatting + 0.15 × Experience + 0.1 × Readability**

7. Results are displayed with:

   * Overall score
   * Match percentage
   * Missing keywords
   * Suggestions

---

## 🛠️ Tech Stack

### Frontend:

* React.js
* Tailwind CSS
* Chart.js

### Backend:

* Node.js
* Express.js

### NLP & Processing:

* pdf-parse
* Natural Language Processing (NLP)

### Database:

* MongoDB Atlas

---

## 📁 Project Structure

```id="lqjyyb"
ATS-Resume-Analyzer/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Upload.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ScoreGauge.jsx
│   │   │   ├── KeywordList.jsx
│   │   │   └── Suggestions.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   └── Result.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── index.html
│
├── backend/
│   ├── controllers/
│   │   └── analyzeController.js
│   │
│   ├── routes/
│   │   └── analyzeRoutes.js
│   │
│   ├── utils/
│   │   ├── parser.js
│   │   └── scorer.js
│   │
│   ├── models/
│   │   └── Resume.js
│   │
│   ├── config/
│   │   └── db.js
│   │
│   └── server.js
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash id="d0u5lm"
git clone https://github.com/your-username/ats-resume-analyzer.git
cd ATS-Resume-Analyzer
```

---

### 2️⃣ Frontend Setup

```bash id="5df0tz"
cd frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

### 3️⃣ Backend Setup

```bash id="93vcmr"
cd backend
npm install
node server.js
```

Backend runs on:

```
http://localhost:5000
```

---

### 4️⃣ Database Setup (MongoDB Atlas)

* Create a cluster
* Get connection string
* Add it in `config/db.js`

---

## 🔗 API Endpoint

### POST /api/analyze

**Request:**

* resume (file)
* jobDesc (text)

**Response:**

```json id="mxrdti"
{
  "overallScore": 78,
  "matchPercentage": 80,
  "selectionChance": "High",
  "breakdown": {
    "keywordMatch": 80,
    "skillsMatch": 75,
    "formatting": 70,
    "experienceRelevance": 72,
    "readability": 85
  },
  "missingKeywords": ["docker", "aws"]
}
```

---

## 🚀 Deployment

* Frontend → Vercel
* Backend → Render
* Database → MongoDB Atlas

---


---

## 🔥 Future Enhancements

* AI-powered resume suggestions (GPT)
* LinkedIn profile analyzer
* Chrome extension
* Role-based scoring system
* Resume auto-optimizer

---

## 👨‍💻 Author

Your Name
B.Tech CSE Student

---

## ⭐ Contribution

Feel free to fork and contribute to improve the project.

---

## 📜 License

This project is licensed under the MIT License.
