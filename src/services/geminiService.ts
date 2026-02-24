import { GoogleGenAI, Type } from "@google/genai";
import { FocusGroupReport, PersonaDefinition, CreativeComparisonReport } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function runCreativeComparison(
  campaignPitch: string,
  personas: PersonaDefinition[],
  imageA: string, // base64
  imageB: string  // base64
): Promise<CreativeComparisonReport> {
  const personaString = personas.map((p, i) => 
    `${i + 1}. ${p.name} (Age: ${p.age}, Job: ${p.occupation}, Loc: ${p.location}, Income: ${p.income}, Personality: ${p.personality}, Spending: ${p.spending_habits})`
  ).join('\n');

  const prompt = `
    You are an expert market researcher and visual analyst. 
    I am running a creative comparison test with ${personas.length} personas.
    
    The Context:
    ${campaignPitch}

    The Personas:
    ${personaString}

    I am providing two marketing creative posters (Creative A and Creative B). 
    Analyze both images in the context of the campaign and the personas.
    
    Simulate how each persona would react to both creatives based on the questions in the context. 
    Which one do they prefer? Does either poster actually convince them to apply for the card? Why or why not? 
    What are the visual strengths and weaknesses of each for this specific Mid-California audience?

    Return the analysis strictly in the requested JSON format.
  `;

  // Extract mime types and data from base64 strings
  const getPart = (base64: string) => {
    const [header, data] = base64.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
    return {
      inlineData: {
        data,
        mimeType
      }
    };
  };

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      { parts: [{ text: prompt }] },
      { parts: [getPart(imageA)] },
      { parts: [getPart(imageB)] }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallWinner: { type: Type.STRING, description: "Must be 'Creative A', 'Creative B', or 'Tie'" },
          summary: { type: Type.STRING },
          creativeAAnalysis: {
            type: Type.OBJECT,
            properties: {
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              appealScore: { type: Type.NUMBER }
            },
            required: ["strengths", "weaknesses", "appealScore"]
          },
          creativeBAnalysis: {
            type: Type.OBJECT,
            properties: {
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              appealScore: { type: Type.NUMBER }
            },
            required: ["strengths", "weaknesses", "appealScore"]
          },
          personaPreferences: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                personaName: { type: Type.STRING },
                preferredCreative: { type: Type.STRING, description: "Must be 'Creative A', 'Creative B', or 'None'" },
                wouldApply: { type: Type.BOOLEAN, description: "Whether they would actually apply for the card based on the creatives" },
                reasoning: { type: Type.STRING },
                quote: { type: Type.STRING }
              },
              required: ["personaName", "preferredCreative", "wouldApply", "reasoning", "quote"]
            }
          },
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["overallWinner", "summary", "creativeAAnalysis", "creativeBAnalysis", "personaPreferences", "recommendations"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  
  return JSON.parse(text) as CreativeComparisonReport;
}

export async function runSyntheticFocusGroup(campaignPitch: string, personas: PersonaDefinition[]): Promise<FocusGroupReport> {
  // --- PYTHON BACKEND INTEGRATION ---
  // If you are running the Python backend locally (backend_main.py),
  // this will attempt to call it. If it fails (like in this cloud preview),
  // it will fall back to the direct Gemini API call below.
  try {
    const pyResponse = await fetch('http://localhost:8000/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignPitch, personas })
    });
    
    if (pyResponse.ok) {
      console.log("Successfully fetched from Python backend!");
      return await pyResponse.json() as FocusGroupReport;
    }
  } catch (e) {
    console.log("Python backend not found at localhost:8000. Falling back to direct Gemini API...");
  }
  // -----------------------------------

  const personaString = personas.map((p, i) => 
    `${i + 1}. ${p.name} (Age: ${p.age}, Job: ${p.occupation}, Loc: ${p.location}, Income: ${p.income}, Personality: ${p.personality}, Spending: ${p.spending_habits})`
  ).join('\n');

  const prompt = `
    You are an expert market researcher and data extractor. 
    I am running a synthetic focus group with ${personas.length} personas testing a new credit card campaign.
    
    The Personas:
    ${personaString}

    The Campaign Pitch:
    ${campaignPitch}

    Simulate a deep, multi-turn debate among these ${personas.length} personas about this exact campaign. 
    Then, extract the final insights and return them strictly in the requested JSON format.
    
    Ensure the data reflects realistic demographic reactions based on the persona definitions provided.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          executiveSummary: { type: Type.STRING, description: "A high-level overview of the card's reception." },
          sentimentEvolution: { type: Type.STRING, description: "How opinions changed during the debate." },
          verdicts: {
            type: Type.OBJECT,
            properties: {
              apply: { type: Type.INTEGER },
              fence: { type: Type.INTEGER },
              reject: { type: Type.INTEGER }
            },
            required: ["apply", "fence", "reject"]
          },
          featureSentiments: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                feature: { type: Type.STRING },
                positive: { type: Type.INTEGER },
                negative: { type: Type.INTEGER },
                neutral: { type: Type.INTEGER }
              },
              required: ["feature", "positive", "negative", "neutral"]
            }
          },
          personas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                occupation: { type: Type.STRING },
                location: { type: Type.STRING },
                income: { type: Type.STRING },
                verdict: { type: Type.STRING, description: "Must be 'Apply', 'Hard No', or 'On the Fence'" },
                reason: { type: Type.STRING },
                quote: { type: Type.STRING }
              },
              required: ["name", "occupation", "location", "income", "verdict", "reason", "quote"]
            }
          },
          missedOpportunities: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["executiveSummary", "sentimentEvolution", "verdicts", "featureSentiments", "personas", "missedOpportunities"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  
  return JSON.parse(text) as FocusGroupReport;
}
