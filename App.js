import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProgress } from './src/hooks/useProgress';
import { C } from './src/theme';
import ConfettiOverlay from './src/components/ConfettiOverlay';

import Dashboard        from './src/screens/Dashboard';
import DomainView       from './src/screens/DomainView';
import LessonView       from './src/screens/LessonView';
import QuizView         from './src/screens/QuizView';
import PBQView          from './src/screens/PBQView';
import ResultsScreen    from './src/screens/ResultsScreen';
import NotesView        from './src/screens/NotesView';
import OnboardingScreen    from './src/screens/OnboardingScreen';
import FinalExamView       from './src/screens/FinalExamView';
import FinalResultsScreen  from './src/screens/FinalResultsScreen';
import WeakAreasReviewView from './src/screens/WeakAreasReviewView';
import { RESUME_PROGRESS_KEY, buildResumeProgress } from './src/utils/resumeProgress';

const ONBOARDING_KEY          = 'poppas_onboarding_done';
const ONBOARDING_ALWAYS_KEY   = 'netplus_onboarding_always';
const DEV_UNLOCK_ALL_KEY      = 'netplus_dev_unlock_all';
const FINAL_EXAM_OPENED_KEY   = 'netplus_final_exam_opened';
const DOMAIN1_TOPIC_IDS       = ['osi', 'tcpip', 'ports', 'subnetting'];

export default function App() {
  const [screen, setScreen] = useState('dashboard');
  const [params, setParams] = useState({});
  const [onboardingDone, setOnboardingDone] = useState(null);
  const [onboardingAlways, setOnboardingAlways] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [devUnlockAll, setDevUnlockAll] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [finalExamFirstOpened, setFinalExamFirstOpened] = useState(false);
  const [pendingResume, setPendingResume] = useState(null);

  const {
    progress,
    loaded,
    completeLesson,
    saveQuizScore,
    completePBQ,
    masterNote,
    completeDailyQuiz,
    startDomainTimer,
    pauseDomainTimer,
    resetProgress,
  } = useProgress();

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(ONBOARDING_KEY),
      AsyncStorage.getItem(ONBOARDING_ALWAYS_KEY),
      AsyncStorage.getItem(DEV_UNLOCK_ALL_KEY),
      AsyncStorage.getItem(FINAL_EXAM_OPENED_KEY),
      AsyncStorage.getItem(RESUME_PROGRESS_KEY),
    ]).then(([val, alwaysVal, devVal, examVal, resumeVal]) => {
      setOnboardingDone(val === 'true');
      setOnboardingAlways(alwaysVal === 'true');
      setDevUnlockAll(devVal === 'true');
      setFinalExamFirstOpened(examVal === 'true');
      if (resumeVal) {
        try {
          setPendingResume(JSON.parse(resumeVal));
        } catch (_) {}
      }
    });
  }, []);

  const finalExamUnlocked = loaded && (
    devUnlockAll ||
    DOMAIN1_TOPIC_IDS.every(t => (progress.domains[1]?.topics?.[t]?.quizScore || 0) >= 80)
  );

  useEffect(() => {
    if (screen === 'final-exam' && finalExamUnlocked && !finalExamFirstOpened) {
      setShowConfetti(true);
      setFinalExamFirstOpened(true);
      AsyncStorage.setItem(FINAL_EXAM_OPENED_KEY, 'true');
    }
  }, [screen, finalExamUnlocked, finalExamFirstOpened]);

  const finishOnboarding = useCallback(() => {
    AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setOnboardingDone(true);
    setOnboardingDismissed(true);
    setScreen('dashboard');
    setParams({});
  }, []);

  const toggleOnboardingAlways = useCallback((val) => {
    setOnboardingAlways(val);
    setOnboardingDismissed(false);
    AsyncStorage.setItem(ONBOARDING_ALWAYS_KEY, val ? 'true' : 'false');
  }, []);

  const toggleDevUnlockAll = useCallback((val) => {
    setDevUnlockAll(val);
    AsyncStorage.setItem(DEV_UNLOCK_ALL_KEY, val ? 'true' : 'false');
  }, []);

  const saveResumeProgress = useCallback((nextScreen, nextParams = {}, extra = {}) => {
    const resumeData = buildResumeProgress(nextScreen, nextParams, extra);
    setPendingResume(resumeData);
    AsyncStorage.setItem(RESUME_PROGRESS_KEY, JSON.stringify(resumeData));
  }, []);

  const clearResumeProgress = useCallback(() => {
    setPendingResume(null);
    AsyncStorage.removeItem(RESUME_PROGRESS_KEY);
  }, []);

  const updateResumeState = useCallback((resumeData) => {
    setPendingResume(resumeData);
  }, []);

  const handleResetProgress = useCallback(() => {
    resetProgress();
    clearResumeProgress();
    setFinalExamFirstOpened(false);
    AsyncStorage.removeItem(FINAL_EXAM_OPENED_KEY);
    setScreen('dashboard');
    setParams({});
  }, [clearResumeProgress, resetProgress]);

  const navigate = useCallback((screenName, screenParams = {}) => {
    const isQuizScreen = screen === 'quiz' || screen === 'daily-quiz';
    const isOpeningQuiz = screenName === 'quiz' || screenName === 'daily-quiz';

    if (['domain', 'lesson'].includes(screenName) && !isQuizScreen) {
      saveResumeProgress(screenName, screenParams);
    } else if (isOpeningQuiz && !pendingResume?.quiz) {
      saveResumeProgress(screenName, screenParams);
    } else if (['results', 'final-results'].includes(screenName)) {
      clearResumeProgress();
    }
    setScreen(screenName);
    setParams(screenParams);
  }, [clearResumeProgress, pendingResume, saveResumeProgress, screen]);

  const handleConfettiDone = useCallback(() => {
    setShowConfetti(false);
  }, []);

  if (!loaded || onboardingDone === null) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={C.cyan} />
      </View>
    );
  }

  if (!onboardingDone || (onboardingAlways && !onboardingDismissed)) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={C.bgDeep} />
        <OnboardingScreen onDone={finishOnboarding} />
      </View>
    );
  }

  const commonProps = { progress, navigate };

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return (
          <Dashboard
            {...commonProps}
            onboardingAlways={onboardingAlways}
            toggleOnboardingAlways={toggleOnboardingAlways}
            devUnlockAll={devUnlockAll}
            toggleDevUnlockAll={toggleDevUnlockAll}
            resetProgress={handleResetProgress}
            pendingResume={pendingResume}
          />
        );

      case 'domain':
        return (
          <DomainView
            {...commonProps}
            domainId={params.domainId}
            startDomainTimer={startDomainTimer}
            pauseDomainTimer={pauseDomainTimer}
          />
        );

      case 'lesson':
        return (
          <LessonView
            key={`${params.domainId}-${params.topicId}-${params.lessonIndex || 0}`}
            {...commonProps}
            domainId={params.domainId}
            topicId={params.topicId}
            lessonIndex={params.lessonIndex || 0}
            completeLesson={completeLesson}
          />
        );

      case 'quiz':
        return (
          <QuizView
            key={`quiz-${params.domainId}-${params.topicId}`}
            {...commonProps}
            domainId={params.domainId}
            topicId={params.topicId}
            isDaily={false}
            saveQuizScore={saveQuizScore}
            completeDailyQuiz={completeDailyQuiz}
            resumeState={pendingResume}
            updateResumeState={updateResumeState}
          />
        );

      case 'daily-quiz':
        return (
          <QuizView
            key="quiz-daily"
            {...commonProps}
            domainId={1}
            topicId={null}
            isDaily={true}
            saveQuizScore={saveQuizScore}
            completeDailyQuiz={completeDailyQuiz}
            resumeState={pendingResume}
            updateResumeState={updateResumeState}
          />
        );

      case 'pbq':
        return (
          <PBQView
            {...commonProps}
            domainId={params.domainId}
            topicId={params.topicId}
            completePBQ={completePBQ}
          />
        );

      case 'results':
        return <ResultsScreen params={params} navigate={navigate} />;

      case 'notes':
        return <NotesView {...commonProps} masterNote={masterNote} />;

      case 'weak-areas':
        return <WeakAreasReviewView {...commonProps} masterNote={masterNote} />;

      case 'final-exam':
        return <FinalExamView navigate={navigate} devMode={devUnlockAll} />;

      case 'final-results':
        return <FinalResultsScreen params={params} navigate={navigate} />;

      default:
        return <Dashboard {...commonProps} onboardingAlways={onboardingAlways} toggleOnboardingAlways={toggleOnboardingAlways} devUnlockAll={devUnlockAll} toggleDevUnlockAll={toggleDevUnlockAll} resetProgress={handleResetProgress} pendingResume={pendingResume} />;
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bgDeep} />
      {renderScreen()}
      <ConfettiOverlay visible={showConfetti} onDone={handleConfettiDone} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bgDeep,
  },
  loading: {
    flex: 1,
    backgroundColor: C.bgDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
