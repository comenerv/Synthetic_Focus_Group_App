export interface PersonaDefinition {
  name: string;
  age: number;
  occupation: string;
  location: string;
  income: string;
  personality: string;
  spending_habits: string;
}

export interface FeatureSentiment {
  feature: string;
  positive: number;
  negative: number;
  neutral: number;
}

export interface PersonaVerdict {
  name: string;
  occupation: string;
  location: string;
  income: string;
  verdict: 'Apply' | 'Hard No' | 'On the Fence';
  reason: string;
  quote: string;
}

export interface FocusGroupReport {
  executiveSummary: string;
  sentimentEvolution: string;
  verdicts: {
    apply: number;
    fence: number;
    reject: number;
  };
  featureSentiments: FeatureSentiment[];
  personas: PersonaVerdict[];
  missedOpportunities: string[];
}

export interface CreativePreference {
  personaName: string;
  preferredCreative: 'Creative A' | 'Creative B' | 'None';
  wouldApply: boolean;
  reasoning: string;
  quote: string;
}

export interface CreativeComparisonReport {
  overallWinner: 'Creative A' | 'Creative B' | 'Tie';
  summary: string;
  creativeAAnalysis: {
    strengths: string[];
    weaknesses: string[];
    appealScore: number; // 1-10
  };
  creativeBAnalysis: {
    strengths: string[];
    weaknesses: string[];
    appealScore: number; // 1-10
  };
  personaPreferences: CreativePreference[];
  recommendations: string[];
}
