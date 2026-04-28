# BlueCarbonX

**AI + Blockchain MRV Platform for Blue Carbon Restoration**

[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Firebase](https://img.shields.io/badge/Deploy-Firebase%20Hosting-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react&logoColor=black)](https://react.dev/)

## Demo

A short walkthrough of the system architecture and workflow:

[![BlueCarbonX Demo](https://img.youtube.com/vi/JmnAMk7iiNQ/0.jpg)](https://youtu.be/JmnAMk7iiNQ)

---

## Overview

BlueCarbonX is a full-stack prototype that models how carbon footprint documentation can be structured into a transparent, token-based digital workflow — now enhanced with **real AI-powered environmental analysis** using Google Gemini.

### Key Features

- 🌿 **AI Environmental Analysis** — Upload restoration images and get real-time vegetation assessment via Google Gemini
- 🔗 **Carbon Asset Tokenization** — Full lifecycle from project submission to token issuance
- 🛡️ **Multi-Signature Governance** — Admin panel with multi-sig approval workflow
- 📊 **Trust Score & Fraud Detection** — AI-powered project risk assessment
- 💼 **Carbon Credit Marketplace** — Industry buyers can purchase verified credits
- 🔒 **Transparency Panel** — Full audit trail and project tracking

---

## Architecture

```
bluecarbon-x/
├── src/
│   ├── ai/                  # Google Gemini integration logic
│   │   └── geminiService.js # Image analysis via Gemini 1.5 Flash
│   ├── config/              # Environment configuration
│   │   └── env.js           # API key management
│   ├── components/          # Reusable UI components
│   │   └── shared/
│   │       ├── GeminiAnalysis.jsx  # AI Analysis display
│   │       ├── GlassCard.jsx
│   │       ├── ParticleBackground.jsx
│   │       └── ...
│   ├── context/             # React Context (state management)
│   │   └── AppContext.jsx
│   ├── pages/               # Route pages
│   │   ├── community/       # Community dashboard, upload, wallet
│   │   ├── admin/           # Admin review, transparency, risk
│   │   ├── industry/        # Industry marketplace, portfolio
│   │   ├── analysis/        # AI analysis (Groq-powered)
│   │   └── landing/         # Landing page
│   ├── main.jsx
│   └── App.jsx
├── ai-agent/                # Python backend (FastAPI)
│   ├── api.py               # REST API with Gemini + Groq endpoints
│   ├── agent.py             # CLI agent
│   └── requirements.txt
├── firebase.json            # Firebase Hosting config
├── .firebaserc              # Firebase project alias
├── .env.example             # Environment variables template
└── package.json
```

---

## Quick Start (Local Development)

### Prerequisites

- Node.js 18+
- npm 9+
- A Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### 1. Clone & Install

```bash
git clone https://github.com/your-repo/bluecarbon-x.git
cd bluecarbon-x
npm install
```

### 2. Configure API Key

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your Gemini API key
# VITE_GEMINI_API_KEY=your_actual_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`.

### 4. Test Gemini Integration

1. Click **"Community"** role on the landing page
2. Navigate to **"Upload Proof"**
3. Upload any image (vegetation/nature photo works best)
4. The **"AI Environmental Analysis"** section will show real-time Gemini results

---

## Backend (Optional)

The Python backend provides additional AI agents (Carbon Analyst + Fraud Detector).

```bash
cd ai-agent

# Create virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Copy env and set API keys
cp .env.example .env
# Edit .env with your GROQ_API_KEY and GOOGLE_GEMINI_API_KEY

# Run backend
python api.py
```

Backend runs at `http://localhost:8000` with interactive docs at `/docs`.

---

## Cloud Deployment (Firebase Hosting)

### Prerequisites

- [Firebase CLI](https://firebase.google.com/docs/cli) installed
- A Firebase project created at [console.firebase.google.com](https://console.firebase.google.com/)

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

### Step 3: Create a Firebase Project

Go to [Firebase Console](https://console.firebase.google.com/) → **Add Project** → Name it (e.g., `bluecarbon-x`).

### Step 4: Update Project ID

Edit `.firebaserc` and replace the project ID:

```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

### Step 5: Set API Key for Production

Before building, set your Gemini API key in `.env`:

```bash
VITE_GEMINI_API_KEY=your_actual_gemini_api_key
```

> **Note**: Since the Gemini call runs client-side, the API key is embedded in the build.
> For production, restrict the key in [Google Cloud Console](https://console.cloud.google.com/apis/credentials) to your Firebase domain.

### Step 6: Build & Deploy

```bash
# One command does it all:
npm run deploy

# Or manually:
npm run build
firebase deploy --only hosting
```

### Step 7: Access Your Live Site

After deployment, Firebase will show your live URL:
```
✔  Deploy complete!
Hosting URL: https://your-project-id.web.app
```

---

## API Key Security

| Key | Usage | Location |
|-----|-------|----------|
| `VITE_GEMINI_API_KEY` | Frontend image analysis | `.env` (root) |
| `GROQ_API_KEY` | Backend carbon analysis | `ai-agent/.env` |
| `GOOGLE_GEMINI_API_KEY` | Backend image endpoint | `ai-agent/.env` |

### Production Security

For the frontend Gemini key:
1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Click on your API key
3. Under **Application restrictions**, select **HTTP referrers**
4. Add your Firebase domain: `your-project-id.web.app/*`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Framer Motion |
| AI (Image) | Google Gemini 1.5 Flash |
| AI (Text) | Groq (Llama 3.3 70B) |
| Backend | FastAPI, Python |
| State | React Context + LocalStorage |
| Deployment | Firebase Hosting |
| Design | Custom CSS, Glassmorphism |

---

## Google AI Services Used

### Google Gemini 1.5 Flash (Primary)

- **Purpose**: Real-time environmental image analysis
- **Integration**: `@google/generative-ai` SDK (frontend) + `google-generativeai` Python SDK (backend)
- **Functionality**:
  - Vegetation presence detection (low/medium/high)
  - Environmental insight generation
  - Confidence reasoning
  - Verification status determination

---

## Future Scope

- Integration with EVM-compatible smart contracts
- IPFS-based document hashing
- Machine learning–based carbon scoring
- Multi-role verification model
- Governance and audit layer
- Google Cloud Run deployment for backend

---

## License

This project is a prototype for research and hackathon purposes.
