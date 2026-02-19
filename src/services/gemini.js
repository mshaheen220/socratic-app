import { THINKING_ERRORS } from '../constants/thinkingErrors';
import { COGNITIVE_DISTORTIONS } from '../constants/cognitiveDisorders';

export const generateSessionInsight = async (session) => {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  
  if (!apiKey) {
    throw new Error("Please add VITE_GOOGLE_API_KEY to your .env file");
  }

  const getLabels = (ids, source) => {
    if (!Array.isArray(ids)) return ids;
    return ids.map(id => source.find(i => i.id === id)?.label || id).join(', ');
  };

  const prompt = `
    Act as a compassionate CBT therapist. I have completed a Socratic questioning exercise based on the Socratic Questioning, ognitive Distorions, and Thinking Errors worksheets from TherapistAid.com.

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

  Based on CBT principles, analyze this entry and return ONLY a JSON object with the following keys:

  {
    "AIsummary": "An empathetic HTML-formatted summary (starting with <div class='AIsummary'>) analyzing the logic of the thought.",
    "AIbalancedThought": "A suggestion for a new, balanced thought in HTML (starting with <div class='AIbalancedThought'>).",
    "scores": {
      "intensity": [An integer 1-100 representing the severity/distress of the initial thought],
      "efficacy": [An integer 1-100 representing how well the user's Socratic questioning dismantled the distortion],
      "scoreExplanation": "An HTML-formatted explanation of why these specific scores were assigned, referencing the 'Evidence Against' and 'Likelihood vs Possibility' provided."
    }
  }

  Do not include any conversational filler or markdown code blocks. Return only the raw JSON string.
  `;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) throw new Error('Failed to generate insight');

  const data = await response.json();
  // Gemini API returns an array of candidates, so index [0] is required.
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

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