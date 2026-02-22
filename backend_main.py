from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from google import genai
from google.genai import types
import json
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow React frontend to communicate with this Python backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your React app's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini Client
# Make sure to set GEMINI_API_KEY in your environment variables before running
client = genai.Client()

class Persona(BaseModel):
    name: str
    age: int
    occupation: str
    location: str
    income: str
    personality: str
    spending_habits: str

class SimulationRequest(BaseModel):
    campaignPitch: str
    personas: List[Persona]

@app.post("/api/simulate")
def run_simulation(request: SimulationRequest):
    try:
        persona_strings = []
        for i, p in enumerate(request.personas):
            persona_strings.append(
                f"{i + 1}. {p.name} (Age: {p.age}, Job: {p.occupation}, Loc: {p.location}, Income: {p.income}, Personality: {p.personality}, Spending: {p.spending_habits})"
            )
        
        persona_list_str = "\n".join(persona_strings)

        prompt = f"""
        You are an expert market researcher and data extractor. 
        I am running a synthetic focus group with {len(request.personas)} personas testing a new credit card campaign.
        
        The Personas:
        {persona_list_str}

        The Campaign Pitch:
        {request.campaignPitch}

        Simulate a deep, multi-turn debate among these {len(request.personas)} personas about this exact campaign. 
        Then, extract the final insights and return them strictly in the requested JSON format.
        
        Ensure the data reflects realistic demographic reactions based on the persona definitions provided.
        """

        # Define the expected JSON schema for the output
        response_schema = {
            "type": "OBJECT",
            "properties": {
                "executiveSummary": {"type": "STRING"},
                "sentimentEvolution": {"type": "STRING"},
                "verdicts": {
                    "type": "OBJECT",
                    "properties": {
                        "apply": {"type": "INTEGER"},
                        "fence": {"type": "INTEGER"},
                        "reject": {"type": "INTEGER"}
                    },
                    "required": ["apply", "fence", "reject"]
                },
                "featureSentiments": {
                    "type": "ARRAY",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "feature": {"type": "STRING"},
                            "positive": {"type": "INTEGER"},
                            "negative": {"type": "INTEGER"},
                            "neutral": {"type": "INTEGER"}
                        },
                        "required": ["feature", "positive", "negative", "neutral"]
                    }
                },
                "personas": {
                    "type": "ARRAY",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "name": {"type": "STRING"},
                            "occupation": {"type": "STRING"},
                            "location": {"type": "STRING"},
                            "income": {"type": "STRING"},
                            "verdict": {"type": "STRING"},
                            "reason": {"type": "STRING"},
                            "quote": {"type": "STRING"}
                        },
                        "required": ["name", "occupation", "location", "income", "verdict", "reason", "quote"]
                    }
                },
                "missedOpportunities": {
                    "type": "ARRAY",
                    "items": {"type": "STRING"}
                }
            },
            "required": ["executiveSummary", "sentimentEvolution", "verdicts", "featureSentiments", "personas", "missedOpportunities"]
        }

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=response_schema,
            ),
        )

        return json.loads(response.text)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Run the server on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
