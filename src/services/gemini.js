import { GoogleGenerativeAI } from "@google/generative-ai";
import { THINKING_ERRORS } from '../constants/thinkingErrors';
import { COGNITIVE_DISTORTIONS } from '../constants/cognitiveDisorders';

export const generateSessionInsight = async (session) => {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  
  if (!apiKey) {
    throw new Error("Please add VITE_GOOGLE_API_KEY to your .env file");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    systemInstruction: `Act as a compassionate CBT therapist. I have completed a Socratic questioning exercise based on the Socratic Questioning, Cognitive Distortions, and Thinking Errors worksheets from TherapistAid.com.

Based on CBT principles, analyze the user's entry and return ONLY a JSON object with the following keys:

{
  "AIsummary": "An empathetic HTML-formatted summary (starting with <div class='AIsummary'>) analyzing the logic of the thought.",
  "AIbalancedThought": "A suggestion for a new, balanced thought in HTML (starting with <div class='AIbalancedThought'>).",
  "scores": {
    "intensity": [An integer 1-100 representing the severity/distress of the initial thought],
    "efficacy": [An integer 1-100 representing how well the user's Socratic questioning dismantled the distortion],
    "scoreExplanation": "An HTML-formatted explanation of why these specific scores were assigned, referencing the 'Evidence Against' and 'Likelihood vs Possibility' provided."
  }
}

Do not include any conversational filler or markdown code blocks. Return only the raw JSON string.`,
    generationConfig: { responseMimeType: "application/json" }
  });

  const getLabels = (ids, source) => {
    if (!Array.isArray(ids)) return ids;
    return ids.map(id => source.find(i => i.id === id)?.label || id).join(', ');
  };

  const prompt = `
  My Input Data:
    - Negative Thought: "${session.thought}"
    - Thinking Errors: ${getLabels(session.selectedErrors, THINKING_ERRORS)}
    - Cognitive Distortions: ${getLabels(session.selectedDistortions, COGNITIVE_DISTORTIONS)}
    - Evidence For: ${session.evidenceFor}
    - Evidence Against: ${session.evidenceAgainst}
    - Feelings vs Facts: ${session.feelingsVsFacts}
    - Alternative Interpretations: ${session.alternativeInterpretations}
    - Habit/Past Influence: ${Array.isArray(session.habitOrPast) ? session.habitOrPast.join(', ') : session.habitOrPast}
    - Likelihood vs Possibility: ${session.likelihoodVsPossibility}
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  if (!text) throw new Error('No text found in response');

  // Remove markdown code blocks if present
  const jsonString = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const insight = JSON.parse(jsonString);

  return {
    summary: insight.AIsummary,
    balancedThought: insight.AIbalancedThought,
    scores: insight.scores,
  };
};