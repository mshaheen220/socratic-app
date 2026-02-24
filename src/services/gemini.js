import { GoogleGenerativeAI } from "@google/generative-ai";
import { THINKING_ERRORS } from '../constants/thinkingErrors';
import { COGNITIVE_DISTORTIONS } from '../constants/cognitiveDisorders';

export const generateSessionInsight = async (session) => {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  
  if (!apiKey) {
    throw new Error("Please add VITE_GOOGLE_API_KEY to your .env file");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Define System Instructions based on Session Type
  const isStressor = session.type === 'stressor';
  const isWorry = session.type === 'worry';
  const isMood = session.type === 'mood';
  
  const STANDARD_TOPICS = "Work & Career, Relationships, Family, Health & Body, Self-Esteem, Finances, Social Interactions, Future & Anxiety, Past & Trauma, Daily Life";

  const systemInstruction = isStressor 
    ? `Act as a compassionate CBT therapist. The user is facing a Valid Stressor—a difficult situation that is objectively true, not a distortion.

Based on CBT and Resilience principles (Radical Acceptance, Decatastrophizing, Control Audits), analyze the user's entry and return ONLY a JSON object with the following keys:

{
  "AIsummary": "An empathetic HTML-formatted summary (starting with <div class='AIsummary'>) validating the difficulty of the situation.",
  "AIcopingPlan": "A suggested resilience strategy in HTML (starting with <div class='AIcopingPlan'>), synthesizing their action plan and acceptance.",
  "keywords": ["Array of 5-7 keywords. IMPORTANT: The first keyword MUST be selected from this standard list: [${STANDARD_TOPICS}]. The remaining keywords should be specific coping strategies."],
  "scores": {
    "intensity": [An integer 1-100 representing the severity/distress of the situation],
    "resilience": [An integer 1-100 representing how well the user's plan addresses the stressor],
    "scoreExplanation": "An HTML-formatted explanation of why these scores were assigned."
  }
}

Do not include any conversational filler or markdown code blocks. Return only the raw JSON string.` 
    : isWorry ? `Act as a compassionate CBT therapist using the "Worry Tree" technique.

Analyze the user's worry and their plan. Return ONLY a JSON object with the following keys:

{
  "AIsummary": "An empathetic HTML-formatted summary (starting with <div class='AIsummary'>) validating the worry.",
  "AIcopingPlan": "A suggestion in HTML (starting with <div class='AIcopingPlan'>). If the worry is hypothetical or not actionable, focus on distraction/mindfulness. If actionable, refine their action plan.",
  "keywords": ["Array of 5-7 keywords. IMPORTANT: The first keyword MUST be selected from this standard list: [${STANDARD_TOPICS}]."],
  "scores": {
    "intensity": [An integer 1-100 representing the anxiety level],
    "resilience": [An integer 1-100 representing the quality of their plan/acceptance],
    "scoreExplanation": "HTML explanation of the scores."
  }
}

Do not include any conversational filler or markdown code blocks. Return only the raw JSON string.`
    : isMood ? `Act as a compassionate CBT therapist focusing on Emotional Regulation.

Analyze the user's mood reset session. Return ONLY a JSON object with the following keys:

{
  "AIsummary": "An empathetic HTML-formatted summary (starting with <div class='AIsummary'>) validating the emotion and the effort to regulate.",
  "AIcopingPlan": "A suggestion of 1-2 specific grounding or regulation techniques (e.g. 5-4-3-2-1, Box Breathing, Container Exercise) in HTML (starting with <div class='AIcopingPlan'>). Explain briefly how to do them.",
  "suggestedTechniques": ["Array of strings naming the specific techniques suggested (e.g. 'Box Breathing', '5-4-3-2-1')"],
  "keywords": ["Array of 5-7 keywords. IMPORTANT: The first keyword MUST be selected from this standard list: [${STANDARD_TOPICS}]."],
  "scores": {
    "intensity": [An integer 1-100 representing the initial distress],
    "resilience": [An integer 1-100 representing the potential effectiveness of the suggested technique for this situation],
    "scoreExplanation": "HTML explanation."
  }
}

Do not include any conversational filler or markdown code blocks. Return only the raw JSON string.`
    : `Act as a compassionate CBT therapist. I have completed a Socratic questioning exercise based on the Socratic Questioning, Cognitive Distortions, and Thinking Errors worksheets from TherapistAid.com.

Based on CBT principles, analyze the user's entry and return ONLY a JSON object with the following keys:

{
  "AIsummary": "An empathetic HTML-formatted summary (starting with <div class='AIsummary'>) analyzing the logic of the thought.",
  "AIbalancedThought": "A suggestion for a new, balanced thought in HTML (starting with <div class='AIbalancedThought'>).",
  "keywords": ["Array of 5-7 keywords. IMPORTANT: The first keyword MUST be selected from this standard list: [${STANDARD_TOPICS}]. The remaining keywords should be specific techniques or details."],
  "scores": {
    "intensity": [An integer 1-100 representing the severity/distress of the initial thought],
    "efficacy": [An integer 1-100 representing how well the user's Socratic questioning dismantled the distortion],
    "scoreExplanation": "An HTML-formatted explanation of why these specific scores were assigned, referencing the 'Evidence Against' and 'Likelihood vs Possibility' provided."
  }
}

Do not include any conversational filler or markdown code blocks. Return only the raw JSON string.`;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    systemInstruction,
    generationConfig: { responseMimeType: "application/json" }
  });

  const getLabels = (ids, source) => {
    if (!Array.isArray(ids)) return ids;
    return ids.map(id => source.find(i => i.id === id)?.label || id).join(', ');
  };

  const prompt = (!isStressor && !isWorry && !isMood) ? `
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
  ` : isStressor ? `
  My Input Data (Valid Stressor):
    - Stressful Situation: "${session.thought}"
    - Radical Acceptance (Facts I cannot change): "${session.radicalAcceptance}"
    - Worst Case Scenario: "${session.worstCase}"
    - Action Plan for Worst Case: "${session.worstCasePlan}"
    - In My Control: "${session.controlIn}"
    - Out of My Control: "${session.controlOut}"
  ` : isWorry ? `
  My Input Data (Worry Tree):
    - Worry: "${session.thought}"
    - Type: "${session.worryType}" (Current Problem vs Hypothetical)
    - Actionable: "${session.worryActionable}"
    - User's Plan: "${session.worryPlan}"
  ` : `
  My Input Data (Mood Reset):
    - Event/Emotion: "${session.thought}"
    - Explanation: "${session.moodExplanation}"
    - Intensity Before: "${session.moodIntensityBefore}"
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
    copingPlan: insight.AIcopingPlan,
    keywords: insight.keywords,
    scores: insight.scores,
    suggestedTechniques: insight.suggestedTechniques,
  };
};

export const getTriageRecommendation = async (userInput) => {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  if (!apiKey) throw new Error("Please add VITE_GOOGLE_API_KEY to your .env file");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `Act as a CBT therapist. Analyze the user's input and categorize it into one of 4 workflows:
  1. 'distortion': Irrational thoughts, cognitive distortions, or negative self-talk that needs challenging.
  2. 'stressor': Valid, objective difficult situations that require coping or acceptance.
  3. 'worry': Anxious "what if" thoughts about the future or hypothetical scenarios.
  4. 'mood': Intense emotional or physical reactions (anger, panic) that need immediate regulation/grounding.

  User Input: "${userInput}"

  Return ONLY a JSON object with these keys:
  {
    "type": "distortion" | "stressor" | "worry" | "mood",
    "reason": "A brief explanation of why this category fits best."
  }`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  // Clean up potential markdown
  const jsonString = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  return JSON.parse(jsonString);
};