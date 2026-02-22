# Synthetic Focus Group Dashboard

A powerful, AI-driven market research tool that simulates consumer focus groups using the Google Gemini API. Test product pitches, marketing campaigns, and pricing strategies against a diverse set of synthetic personas to instantly extract actionable insights, sentiment analysis, and direct quotes.

## Features

- **Dynamic Persona Management:** Load, create, view, and delete custom AI personas.
- **Campaign Stimulus Testing:** Input any product pitch, credit card offer, or marketing copy.
- **Deep Simulation:** The AI simulates a multi-turn debate among the active personas based on their specific demographics, income, and spending habits.
- **Instant Analytics Dashboard:**
  - Executive Summary & Sentiment Evolution
  - Verdict Breakdown (Apply, On the Fence, Hard No)
  - Feature-by-Feature Sentiment Analysis (Positive/Neutral/Negative)
  - Persona-specific reasoning and direct quotes
  - Missed Opportunities & Product Recommendations
- **Word Document Export:** Download the entire focus group report as a beautifully formatted `.docx` file.
- **Python Backend Ready:** Includes a FastAPI Python backend (`backend_main.py`) for local execution.

---

## How It Works

This application was inspired by Microsoft's `tinytroupe` library but is optimized for the web. Instead of running multiple slow, individual AI agents, it uses a highly-engineered "Mega-Prompt" sent to **Gemini 2.5 Flash**. 

The AI reads the active personas and the campaign pitch, *imagines* the entire multi-turn debate, and extracts the final analytical report in a single, fast API call.

---

## Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- Python 3.9+ (Optional, if using the Python backend)
- A Google Gemini API Key (Get one free at [Google AI Studio](https://aistudio.google.com/app/apikey))

### 1. Clone & Install Frontend
```bash
git clone https://github.com/YOUR_USERNAME/synthetic-focus-group.git
cd synthetic-focus-group
npm install
```

### 2. Set Up Environment Variables
Duplicate the `.env.example` file and rename it to `.env`. Add your Gemini API key:
```env
VITE_GEMINI_API_KEY="your_actual_api_key_here"
```
*(Note: If running locally outside of the AI Studio cloud, ensure your `vite.config.ts` and `geminiService.ts` are using `import.meta.env.VITE_GEMINI_API_KEY` instead of `process.env.GEMINI_API_KEY`).*

### 3. Run the React App (Browser-Only Mode)
```bash
npm run dev
```
The app will run at `http://localhost:5173`. In this mode, the React app calls the Gemini API directly.

---

## Running with the Python Backend (Optional)

If you prefer to handle the AI logic in Python (e.g., to integrate with other Python data science tools or databases), this project includes a fully functional FastAPI backend.

### 1. Install Python Dependencies
Open a new terminal window in the project root:
```bash
pip install fastapi uvicorn google-genai pydantic
```

### 2. Set API Key & Run Server
```bash
export GEMINI_API_KEY="your_actual_api_key_here"
python3 backend_main.py
```
The Python server will start at `http://localhost:8000`.

### 3. Run the React App
Start the React app (`npm run dev`). When you click "Run Focus Group", the React app will automatically detect the Python server running on port 8000 and route the simulation request through Python instead of the browser!

---

## Managing Personas

You can manage the focus group participants in three ways:

1. **Use Defaults:** The app comes pre-loaded with 8 diverse Mid-California personas.
2. **Manual Creation:** Click the **"Create"** button to manually input a new persona's demographics and spending habits.
3. **JSON Upload:** Click **"Load JSON"** to upload personas generated from other tools. 

**Expected JSON Format:**
```json
{
  "name": "Alex",
  "age": 32,
  "occupation": "Freelance Designer",
  "location": "Sacramento, CA",
  "income": "$75,000/year",
  "personality": "Creative, values aesthetics, hates hidden fees.",
  "spending_habits": "Spends heavily on software subscriptions, coffee shops, and travel."
}
```

---

## Tech Stack
- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Vite, Recharts, Lucide Icons
- **AI Model:** Google Gemini 2.5 Flash
- **Export:** `docx` library for Word document generation
- **Backend (Optional):** Python, FastAPI, Google GenAI SDK

## License
MIT License
