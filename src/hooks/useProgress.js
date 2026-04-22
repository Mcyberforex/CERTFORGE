import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DOMAIN_TOPIC_IDS } from '../data/domainContent';

const STORAGE_KEY = 'netplus_progress_v1';

const defaultTimer = () => ({
  startedAt: null,
  totalMs: 0,
  sessionStartMs: null,
  completed: false,
  completedAt: null,
});

const defaultTopicProgress = () => ({ lessonsCompleted: [], quizScore: null, pbqCompleted: false });
const buildDomainTopics = (domainId) => Object.fromEntries(
  (DOMAIN_TOPIC_IDS[domainId] || []).map(topicId => [topicId, defaultTopicProgress()])
);

const DEFAULT_PROGRESS = {
  xp: 0,
  domains: {
    1: {
      unlocked: true,
      topics: buildDomainTopics(1),
      domainQuizScore: null,
    },
    2: { unlocked: false, topics: buildDomainTopics(2), domainQuizScore: null },
    3: { unlocked: false, topics: buildDomainTopics(3), domainQuizScore: null },
    4: { unlocked: false, topics: buildDomainTopics(4), domainQuizScore: null },
    5: { unlocked: false, topics: buildDomainTopics(5), domainQuizScore: null },
  },
  notes: [],
  dailyQuiz: {
    lastDate: null,
    streak: 0,
    todayCompleted: false,
  },
  domainTimers: {
    1: defaultTimer(),
    2: defaultTimer(),
    3: defaultTimer(),
    4: defaultTimer(),
    5: defaultTimer(),
  },
};

export function useProgress() {
  const [progress, setProgress] = useState(DEFAULT_PROGRESS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try {
          const saved = JSON.parse(raw);
          setProgress(prev => deepMerge(prev, saved));
        } catch (_) {}
      }
      setLoaded(true);
    });
  }, []);

  const save = useCallback((updated) => {
    setProgress(updated);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const addXP = useCallback((amount) => {
    setProgress(prev => {
      const updated = { ...prev, xp: prev.xp + amount };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const completeLesson = useCallback((domainId, topicId, lessonId, xpAmount) => {
    setProgress(prev => {
      const domain = prev.domains[domainId];
      const topic = domain.topics[topicId] || { lessonsCompleted: [], quizScore: null, pbqCompleted: false };
      if (topic.lessonsCompleted.includes(lessonId)) return prev;
      const updated = {
        ...prev,
        xp: prev.xp + xpAmount,
        domains: {
          ...prev.domains,
          [domainId]: {
            ...domain,
            topics: {
              ...domain.topics,
              [topicId]: {
                ...topic,
                lessonsCompleted: [...topic.lessonsCompleted, lessonId],
              },
            },
          },
        },
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const saveQuizScore = useCallback((domainId, topicId, score, xpEarned, wrongQuestions) => {
    setProgress(prev => {
      const domain = prev.domains[domainId];
      const topic = domain.topics[topicId] || { lessonsCompleted: [], quizScore: null, pbqCompleted: false };
      const prevBest = topic.quizScore || 0;
      const newScore = Math.max(prevBest, score);

      const newNotes = wrongQuestions.map(q => ({
        id: `note-${q.id}-${Date.now()}`,
        topicId,
        question: q.question,
        yourAnswer: q.yourAnswer,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        mastered: false,
        createdAt: new Date().toISOString(),
      }));

      const allNotes = [...prev.notes];
      newNotes.forEach(note => {
        const exists = allNotes.find(n => n.question === note.question && !n.mastered);
        if (!exists) allNotes.push(note);
      });

      let updatedDomains = { ...prev.domains };
      if (score >= 80 && domainId < 5) {
        const nextId = domainId + 1;
        const topicsPassed = Object.values(updatedDomains[domainId].topics)
          .filter(t => (t.quizScore || 0) >= 80).length;
        if (topicsPassed >= 3) {
          updatedDomains[nextId] = { ...updatedDomains[nextId], unlocked: true };
        }
      }

      // Check if domain 1 (only domain with topics) was just fully completed
      const topicIds = DOMAIN_TOPIC_IDS[domainId];
      let justCompleted = false;
      let updatedDomainTimers = prev.domainTimers;

      if (topicIds) {
        const updatedTopics = {
          ...domain.topics,
          [topicId]: { ...topic, quizScore: newScore },
        };
        const allNowPassed = topicIds.every(id => (updatedTopics[id]?.quizScore || 0) >= 80);
        const wasPreviouslyCompleted = topicIds.every(id => (domain.topics[id]?.quizScore || 0) >= 80);
        justCompleted = allNowPassed && !wasPreviouslyCompleted;

        if (justCompleted) {
          const existingTimer = prev.domainTimers?.[domainId] || defaultTimer();
          const now = Date.now();
          const timerElapsed = existingTimer.sessionStartMs ? (now - existingTimer.sessionStartMs) : 0;
          updatedDomainTimers = {
            ...prev.domainTimers,
            [domainId]: {
              ...existingTimer,
              totalMs: existingTimer.totalMs + timerElapsed,
              sessionStartMs: null,
              completed: true,
              completedAt: new Date().toISOString(),
            },
          };
        }
      }

      const updated = {
        ...prev,
        xp: prev.xp + xpEarned,
        notes: allNotes,
        domains: {
          ...updatedDomains,
          [domainId]: {
            ...domain,
            topics: {
              ...domain.topics,
              [topicId]: { ...topic, quizScore: newScore },
            },
          },
        },
        domainTimers: updatedDomainTimers,
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const completePBQ = useCallback((domainId, topicId, xpAmount) => {
    setProgress(prev => {
      const domain = prev.domains[domainId];
      const topic = domain.topics[topicId] || { lessonsCompleted: [], quizScore: null, pbqCompleted: false };
      const updated = {
        ...prev,
        xp: prev.xp + xpAmount,
        domains: {
          ...prev.domains,
          [domainId]: {
            ...domain,
            topics: {
              ...domain.topics,
              [topicId]: { ...topic, pbqCompleted: true },
            },
          },
        },
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const masterNote = useCallback((noteId) => {
    setProgress(prev => {
      const updated = {
        ...prev,
        notes: prev.notes.map(n => n.id === noteId ? { ...n, mastered: true } : n),
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const completeDailyQuiz = useCallback((xpEarned) => {
    const today = new Date().toDateString();
    setProgress(prev => {
      const daily = prev.dailyQuiz;
      const wasYesterday = daily.lastDate === new Date(Date.now() - 86400000).toDateString();
      const newStreak = wasYesterday ? daily.streak + 1 : 1;
      const updated = {
        ...prev,
        xp: prev.xp + xpEarned,
        dailyQuiz: { lastDate: today, streak: newStreak, todayCompleted: true },
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const startDomainTimer = useCallback((domainId) => {
    setProgress(prev => {
      const existing = prev.domainTimers?.[domainId] || defaultTimer();
      if (existing.completed || existing.sessionStartMs) return prev;
      const now = Date.now();
      const updated = {
        ...prev,
        domainTimers: {
          ...prev.domainTimers,
          [domainId]: {
            ...existing,
            startedAt: existing.startedAt || new Date().toISOString(),
            sessionStartMs: now,
          },
        },
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const pauseDomainTimer = useCallback((domainId) => {
    setProgress(prev => {
      const existing = prev.domainTimers?.[domainId];
      if (!existing?.sessionStartMs) return prev;
      const elapsed = Date.now() - existing.sessionStartMs;
      const updated = {
        ...prev,
        domainTimers: {
          ...prev.domainTimers,
          [domainId]: {
            ...existing,
            totalMs: existing.totalMs + elapsed,
            sessionStartMs: null,
          },
        },
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetProgress = useCallback(() => {
    AsyncStorage.removeItem(STORAGE_KEY);
    setProgress(DEFAULT_PROGRESS);
  }, []);

  const isDailyDone = (() => {
    const today = new Date().toDateString();
    return progress.dailyQuiz.lastDate === today && progress.dailyQuiz.todayCompleted;
  })();

  return {
    progress,
    loaded,
    addXP,
    completeLesson,
    saveQuizScore,
    completePBQ,
    masterNote,
    completeDailyQuiz,
    startDomainTimer,
    pauseDomainTimer,
    resetProgress,
    isDailyDone,
  };
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
