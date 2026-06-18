import { useState, useEffect } from 'react';
import { generateSessionInsight } from '../services/gemini';
import {
  getInitialData,
  migrateLegacyData,
  saveSession as apiSaveSession,
  deleteSession as apiDeleteSession,
  updateSettings as apiUpdateSettings,
} from '../services/api';
import { importData } from '../utils';

const initialSessionState = {
  type: 'distortion', // 'distortion' | 'stressor' | 'worry' | 'mood'
  thought: '',
  selectedErrors: [],
  selectedDistortions: [],
  evidenceFor: '',
  evidenceAgainst: '',
  feelingsVsFacts: '',
  alternativeInterpretations: '',
  habitOrPast: '',
  likelihoodVsPossibility: '',
  // Coping Schema
  radicalAcceptance: '',
  worstCase: '',
  worstCasePlan: '',
  controlIn: '',
  controlOut: '',
  // Worry Tree Schema
  worryType: '', // 'current' | 'hypothetical'
  worryActionable: '', // 'yes' | 'no'
  worryPlan: '', // Action plan or distraction technique
  // Mood Reset Schema
  moodIntensityBefore: 5,
  moodExplanation: ''
};

export function useAppState(token, onLogout) {
  const [history, setHistory] = useState([]);
  const [settings, setSettings] = useState({ theme: 'light', last_export: null });
  const [isLoaded, setIsLoaded] = useState(false);
  const [view, setView] = useState('journal'); // 'journal' | 'triage' | 'wizard' | 'analytics' | 'admin'
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [draftIdToReplace, setDraftIdToReplace] = useState(null);
  const [session, setSession] = useState(initialSessionState);

  const totalSteps = session.type === 'stressor' ? 4 : (session.type === 'worry' ? 4 : (session.type === 'mood' ? 2 : 6));

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Auto-migrate legacy local storage data if it exists
        const legacyHistoryStr = localStorage.getItem('socratic_history');
        if (legacyHistoryStr) {
          const legacyHistory = JSON.parse(legacyHistoryStr);
          if (Array.isArray(legacyHistory) && legacyHistory.length > 0) {
            await migrateLegacyData(token, legacyHistory);
          }
          // Clean up old local storage keys
          localStorage.removeItem('socratic_history');
          localStorage.removeItem('socratic_theme');
          localStorage.removeItem('socratic_last_backup');
        }

        const [sessionsResult, settingsResult] = await getInitialData(token);

        if (!sessionsResult.ok || !settingsResult.ok) {
          onLogout();
          return;
        }

        const sessionsData = sessionsResult.data;
        if (Array.isArray(sessionsData)) setHistory(sessionsData);

        const settingsData = settingsResult.data;
        if (settingsData) setSettings(settingsData);

      } catch (err) {
        console.error("Failed to fetch initial data", err);
      } finally {
        setIsLoaded(true);
      }
    };
    fetchData();
  }, [token, onLogout]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  const startNewSession = () => {
    setSession(initialSessionState);
    setView('triage');
  };

  const handleTriageSelect = (type) => {
    setSession(prev => ({ ...prev, type }));
    setStep(1);
    setView('wizard');
  };

  const nextStep = () => {
    if (step === 1 && !session.thought) return alert("Please identify a thought first!");
    setStep(s => Math.min(s + 1, totalSteps));
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const saveQuickThought = async (text) => {
    const newEntry = {
      type: 'draft',
      thought: text,
      id: Date.now()
    };

    try {
      await apiSaveSession(token, newEntry);
      setHistory([...history, newEntry]);
    } catch (e) {
      console.error(e);
      alert("Failed to save draft");
    }
  };

  const processDraft = (entry) => {
    setSession({ ...initialSessionState, thought: entry.thought });
    setDraftIdToReplace(entry.id);
    setView('triage');
  };

  const saveSession = async () => {
    if (!session.thought) return alert("Identify a thought first!");

    setIsGenerating(true);
    let aiData = null;
    try {
      aiData = await generateSessionInsight(session);
    } catch (e) {
      console.error(e);
    }

    const newEntry = {
      ...session,
      aiSummary: aiData?.summary,
      aiBalancedThought: aiData?.balancedThought,
      aiCopingPlan: aiData?.copingPlan,
      aiKeywords: aiData?.keywords,
      aiSuggestedTechniques: aiData?.suggestedTechniques,
      aiScores: aiData?.scores,
      id: draftIdToReplace || Date.now()
    };

    try {
      await apiSaveSession(token, newEntry);

      if (draftIdToReplace) {
        setHistory(history.map(h => h.id === draftIdToReplace ? newEntry : h));
        setDraftIdToReplace(null);
      } else {
        setHistory([...history, newEntry]);
      }
      setSession(initialSessionState);
      setStep(1);
      setView('journal');
      setSelectedEntry(newEntry);
    } catch (e) {
      console.error(e);
      alert("Failed to save session");
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteEntry = async (id) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        const { ok } = await apiDeleteSession(token, id);
        if (ok) setHistory(history.filter(h => h.id !== id));
      } catch (e) {
        console.error(e);
        alert("Failed to delete session");
      }
    }
  };

  const cancelSession = () => {
    if (window.confirm('Are you sure you want to cancel? All progress in this session will be lost.')) {
      setSession(initialSessionState);
      setDraftIdToReplace(null);
      setStep(1);
      setView('journal');
    }
  };

  const handleImport = async (file) => {
    if (!file) return;
    try {
      const data = await importData(file);
      if (Array.isArray(data)) {
        const existingIds = new Set(history.map(item => item.id));
        const newItems = data.filter(item => !existingIds.has(item.id));
        
        if (newItems.length > 0) {
          for (const item of newItems) {
            await apiSaveSession(token, item);
          }
          setHistory([...history, ...newItems]);
          alert(`Successfully imported ${newItems.length} sessions.`);
        } else {
          alert('No new sessions found in backup.');
        }
      } else {
        alert('Invalid backup file format.');
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import backup file.');
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      await apiUpdateSettings(token, newSettings);
      setSettings(newSettings);
    } catch (e) {
      console.error("Failed to update settings", e);
      alert("Could not save settings.");
    }
  };

  const safeHistory = Array.isArray(history) ? history : [];

  return {
    history: safeHistory,
    settings,
    isLoaded,
    view,
    setView,
    selectedEntry,
    setSelectedEntry,
    step,
    totalSteps,
    isGenerating,
    session,
    setSession,
    startNewSession,
    handleTriageSelect,
    nextStep,
    prevStep,
    saveQuickThought,
    processDraft,
    saveSession,
    deleteEntry,
    cancelSession,
    handleImport,
    updateSettings
  };
}