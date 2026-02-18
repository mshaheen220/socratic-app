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
    Act as a compassionate CBT therapist. I have completed a Socratic questioning exercise.
    
    My Negative Thought: "${session.thought}"
    
    Analysis:
    - Thinking Errors: ${getLabels(session.selectedErrors, THINKING_ERRORS)}
    - Cognitive Distortions: ${getLabels(session.selectedDistortions, COGNITIVE_DISTORTIONS)}
    - Evidence For: ${session.evidenceFor}
    - Evidence Against: ${session.evidenceAgainst}
    - Feelings vs Facts: ${session.feelingsVsFacts}
    - Level of Criticism: ${session.levelOfCriticism}
    - Exaggeration Check: ${session.exaggerationCheck}
    - Alternative Interpretations: ${session.alternativeInterpretations}
    - Habit/Past Influence: ${Array.isArray(session.habitOrPast) ? session.habitOrPast.join(', ') : session.habitOrPast}
    - Likelihood vs Possibility: ${session.likelihoodVsPossibility}

    Based on this, please provide:
    1. A brief empathetic summary of my analysis.
    2. A suggestion for a new, balanced thought.

    Format your response using html markup
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
  return {
    insight: data.candidates[0].content.parts[0].text,
    prompt
  };
};