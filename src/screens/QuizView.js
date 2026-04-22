import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C, S, MONO } from '../theme';
import { DAILY_QUIZ_QUESTIONS } from '../data/domains';
import { MIN_QUIZ_QUESTIONS, getTopic } from '../data/domainContent';
import { RESUME_PROGRESS_KEY, buildQuizResumeProgress } from '../utils/resumeProgress';

export default function QuizView({ domainId, topicId, isDaily, progress, saveQuizScore, completeDailyQuiz, navigate, resumeState, updateResumeState }) {
  const topic = topicId ? getTopic(domainId, topicId) : null;
  const PASS_SCORE = 80;
  const resumeScreen = isDaily ? 'daily-quiz' : 'quiz';
  const resumeParams = isDaily ? { domainId: 1 } : { domainId, topicId };
  const matchingResume = resumeState?.screen === (isDaily ? 'daily-quiz' : 'quiz') &&
    resumeState?.params?.domainId === domainId &&
    (isDaily || resumeState?.params?.topicId === topicId)
      ? resumeState.quiz
      : null;
  const questionsRef = useRef(
    isDaily
      ? buildQuizQuestions(DAILY_QUIZ_QUESTIONS, MIN_QUIZ_QUESTIONS, matchingResume?.questionIds)
      : buildQuizQuestions(topic.quiz, MIN_QUIZ_QUESTIONS, matchingResume?.questionIds)
  );
  const questions = questionsRef.current;
  const savedQuestionIndex = matchingResume?.currentQuestionIndex ?? matchingResume?.qIdx ?? 0;
  const initialQIdx = Math.max(0, Math.min(savedQuestionIndex, questions.length - 1));

  const [qIdx, setQIdx] = useState(initialQIdx);
  const [selected, setSelected] = useState(matchingResume?.selected ?? null);
  const [answered, setAnswered] = useState(!!matchingResume?.answered);
  const [wrongAnswers, setWrongAnswers] = useState(matchingResume?.wrongAnswers || []);
  const [correctCount, setCorrectCount] = useState(matchingResume?.correctCount || 0);
  const [streak, setStreak] = useState(matchingResume?.streak || 0);
  const [answerHistory, setAnswerHistory] = useState(matchingResume?.selectedAnswers || matchingResume?.answerHistory || {});

  const xpAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const current = questions[qIdx];
  const topicColor = topic?.color || C.purple;

  useEffect(() => {
    saveQuizResume({
      qIdx,
      currentQuestionIndex: qIdx,
      selected,
      answered,
      wrongAnswers,
      correctCount,
      streak,
      answerHistory,
      selectedAnswers: answerHistory,
      answeredQuestions: Object.keys(answerHistory),
    });
  }, [qIdx, selected, answered, wrongAnswers, correctCount, streak, answerHistory]);

  const handleSelect = (optIdx) => {
    if (answered) return;
    const isCorrect = optIdx === current.correct;
    const nextWrongAnswers = isCorrect
      ? wrongAnswers
      : [...wrongAnswers, {
          id: current.id,
          question: current.question,
          yourAnswer: current.options[optIdx],
          correctAnswer: current.options[current.correct],
          explanation: current.explanation,
        }];
    const nextCorrectCount = correctCount + (isCorrect ? 1 : 0);
    const nextStreak = isCorrect ? streak + 1 : 0;
    const nextAnswerHistory = {
      ...answerHistory,
      [qIdx]: optIdx,
    };

    setSelected(optIdx);
    setAnswered(true);
    setAnswerHistory(nextAnswerHistory);
    saveQuizResume({
      qIdx,
      currentQuestionIndex: qIdx,
      selected: optIdx,
      answered: true,
      wrongAnswers: nextWrongAnswers,
      correctCount: nextCorrectCount,
      streak: nextStreak,
      answerHistory: nextAnswerHistory,
      selectedAnswers: nextAnswerHistory,
      answeredQuestions: Object.keys(nextAnswerHistory),
    });

    if (isCorrect) {
      setCorrectCount(nextCorrectCount);
      setStreak(nextStreak);
      Animated.sequence([
        Animated.spring(xpAnim, { toValue: 1, useNativeDriver: true }),
        Animated.delay(600),
        Animated.spring(xpAnim, { toValue: 0, useNativeDriver: true }),
      ]).start();
    } else {
      setStreak(nextStreak);
      setWrongAnswers(nextWrongAnswers);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 4, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  };

  const handleNext = () => {
    if (qIdx + 1 >= questions.length) {
      // Finished
      const score = Math.round((correctCount / questions.length) * 100);
      const xpEarned = correctCount * 25 + (score >= PASS_SCORE ? 150 : 0) + (isDaily ? 100 : 0);
      if (isDaily) {
        completeDailyQuiz(xpEarned);
      } else if (topicId) {
        saveQuizScore(domainId, topicId, score, xpEarned, wrongAnswers);
      }
      navigate('results', {
        score,
        correct: correctCount,
        total: questions.length,
        xpEarned,
        passed: score >= PASS_SCORE,
        topicId,
        domainId,
        isDaily,
        wrongAnswers,
      });
      return;
    }
    const nextIdx = qIdx + 1;
    setQIdx(nextIdx);
    setSelected(null);
    setAnswered(false);
    saveQuizResume({
      qIdx: nextIdx,
      currentQuestionIndex: nextIdx,
      selected: null,
      answered: false,
      wrongAnswers,
      correctCount,
      streak,
      answerHistory,
      selectedAnswers: answerHistory,
      answeredQuestions: Object.keys(answerHistory),
    });
  };

  const saveQuizResume = (quizState) => {
    const resumeData = buildQuizResumeProgress({
      isDaily,
      domainId,
      topicId,
      topicName: topic?.name,
      questions,
      quizState,
    });

    updateResumeState?.(resumeData);
    AsyncStorage.setItem(RESUME_PROGRESS_KEY, JSON.stringify(resumeData));
  };

  const progress_pct = ((qIdx) / questions.length) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate(isDaily ? 'dashboard' : 'domain', { domainId })} style={styles.backBtn}>
          <Text style={styles.backText}>✕</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: 16 }}>
          <Text style={[styles.topicLabel, { color: topicColor }]}>
            {isDaily ? '⚡ DAILY QUIZ' : topic.name.toUpperCase()}
          </Text>
          <Text style={styles.qCounter}>{qIdx + 1} of {questions.length}</Text>
        </View>
        <View style={styles.scorePill}>
          <Text style={styles.scorePillText}>✓ {correctCount}</Text>
        </View>
        {streak >= 2 && (
          <View style={styles.streakPill}>
            <Text style={styles.streakPillText}>🔥 {streak}</Text>
          </View>
        )}
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress_pct}%`, backgroundColor: topicColor }]} />
      </View>

      {/* XP pop */}
      <Animated.View style={[styles.xpPop, {
        opacity: xpAnim,
        transform: [{ scale: xpAnim.interpolate({ inputRange: [0,1], outputRange: [0.5, 1.1] }) }],
      }]}>
        <Text style={styles.xpPopText}>{streak >= 3 ? `🔥 ${streak} STREAK  +25 XP ⚡` : '+25 XP ⚡'}</Text>
      </Animated.View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Question card */}
        <Animated.View style={[styles.questionCard, { transform: [{ translateX: shakeAnim }] }]}>
          <View style={[styles.qNumBadge, { backgroundColor: topicColor + '22', borderColor: topicColor + '55' }]}>
            <Text style={[styles.qNumText, { color: topicColor, fontFamily: MONO }]}>Q{qIdx + 1}</Text>
          </View>
          <Text style={styles.questionText}>{current.question}</Text>
        </Animated.View>

        {/* Options */}
        <View style={styles.optionsWrap}>
          {current.options.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrect = i === current.correct;
            const letters = ['A', 'B', 'C', 'D'];
            let letterBg = C.bgElevated;
            let letterColor = C.textSec;
            let textColor = C.textPrimary;
            let borderColor = C.border;

            if (answered) {
              if (isCorrect) {
                borderColor = C.green;
                letterBg = 'rgba(16,185,129,0.2)';
                letterColor = C.green;
                textColor = C.green;
              } else if (isSelected) {
                borderColor = C.red;
                letterBg = 'rgba(239,68,68,0.2)';
                letterColor = C.red;
                textColor = C.red;
              } else {
                textColor = C.textDim;
                letterColor = C.textDim;
              }
            }

            return (
              <TouchableOpacity
                key={i}
                style={[styles.optCard, { borderColor }]}
                onPress={() => handleSelect(i)}
                disabled={answered}
                activeOpacity={0.7}
              >
                <View style={[styles.optLetter, { backgroundColor: letterBg, borderColor }]}>
                  <Text style={[styles.optLetterText, { color: letterColor, fontFamily: MONO }]}>{letters[i]}</Text>
                </View>
                <Text style={[styles.optText, { color: textColor }]}>{opt}</Text>
                {answered && isCorrect && <Text style={styles.checkMark}>✓</Text>}
                {answered && isSelected && !isCorrect && <Text style={styles.crossMark}>✗</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explanation + Note */}
        {answered && (
          <View style={[styles.explanationCard, { borderColor: selected === current.correct ? C.green : C.red }]}>
            <Text style={[styles.explanationLabel, { color: selected === current.correct ? C.green : C.red }]}>
              {selected === current.correct ? '✓ CORRECT' : '✗ INCORRECT — STUDY NOTE SAVED'}
            </Text>
            <Text style={styles.explanationText}>{current.explanation}</Text>
          </View>
        )}

        {/* Note saved indicator */}
        {answered && selected !== current.correct && (
          <View style={styles.noteSaved}>
            <Text style={styles.noteSavedText}>📋 Added to your study notes for review</Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Footer */}
      {answered && (
        <View style={styles.footer}>
          <View style={styles.footerMeta}>
            <Text style={styles.footerScore}>
              {correctCount}/{qIdx + 1} correct
            </Text>
            <Text style={styles.footerNeeded}>
              Need 80% to pass
            </Text>
          </View>
          <TouchableOpacity style={[styles.nextBtn, { backgroundColor: topicColor }]} onPress={handleNext}>
            <Text style={styles.nextBtnText}>
              {qIdx + 1 >= questions.length ? 'SEE RESULTS →' : 'NEXT QUESTION →'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function shuffleArr(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildQuizQuestions(sourceQuestions, minCount, savedQuestionIds) {
  const expanded = expandQuestions(sourceQuestions, minCount);
  if (savedQuestionIds?.length) {
    const questionMap = new Map(expanded.map(q => [q.id, q]));
    const restored = savedQuestionIds.map(id => questionMap.get(id)).filter(Boolean);
    if (restored.length === savedQuestionIds.length) return restored;
  }

  return shuffleArr(expanded);
}

function expandQuestions(sourceQuestions, minCount) {
  const questions = [...sourceQuestions];
  let cycle = 1;
  while (questions.length < minCount) {
    sourceQuestions.forEach(q => {
      if (questions.length < minCount) {
        questions.push({ ...q, id: `${q.id}-repeat-${cycle}` });
      }
    });
    cycle++;
  }
  return questions;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bgDeep },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 52, paddingHorizontal: 16, paddingBottom: 14, backgroundColor: C.bgCard, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { width: 36, height: 36, backgroundColor: C.bgElevated, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  backText: { fontSize: 16, color: C.textSec, fontWeight: '700' },
  topicLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  qCounter: { fontSize: 13, color: C.textSec, marginTop: 2 },
  scorePill: { backgroundColor: 'rgba(16,185,129,0.15)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  scorePillText: { fontSize: 14, fontWeight: '800', color: C.green },
  progressTrack: { height: 3, backgroundColor: C.bgElevated },
  progressFill: { height: '100%', transition: 'width 0.3s' },
  xpPop: { position: 'absolute', top: 120, alignSelf: 'center', zIndex: 99, backgroundColor: 'rgba(16,185,129,0.9)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 99 },
  xpPopText: { fontSize: 18, fontWeight: '900', color: '#fff' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  questionCard: { backgroundColor: C.bgCard, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 20, marginBottom: 16 },
  qNumBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, borderWidth: 1, marginBottom: 12 },
  qNumText: { fontSize: 12, fontWeight: '700' },
  questionText: { fontSize: 17, color: C.textPrimary, fontWeight: '600', lineHeight: 26 },
  optionsWrap: { gap: 10, marginBottom: 16 },
  optCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: C.bgCard, borderRadius: 12, borderWidth: 1.5, padding: 14, gap: 12 },
  optLetter: { width: 32, height: 32, borderRadius: 9, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  optLetterText: { fontSize: 13, fontWeight: '800' },
  optText: { flex: 1, fontSize: 15, lineHeight: 22 },
  checkMark: { fontSize: 18, color: C.green, fontWeight: '800' },
  crossMark: { fontSize: 18, color: C.red, fontWeight: '800' },
  explanationCard: { backgroundColor: C.bgCard, borderRadius: 14, borderWidth: 1.5, padding: 16, marginBottom: 10 },
  explanationLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  explanationText: { fontSize: 14, color: C.textSec, lineHeight: 22 },
  noteSaved: { backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)', padding: 12, marginBottom: 8, alignItems: 'center' },
  noteSavedText: { fontSize: 13, color: C.amber },
  footer: { padding: 16, paddingBottom: 32, backgroundColor: C.bgCard, borderTopWidth: 1, borderTopColor: C.border },
  footerMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  footerScore: { fontSize: 12, color: C.green, fontWeight: '700' },
  footerNeeded: { fontSize: 12, color: C.textDim },
  nextBtn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  nextBtnText: { fontSize: 15, fontWeight: '800', color: '#000', letterSpacing: 0.5 },
  streakPill: { marginLeft: 8, backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)' },
  streakPillText: { fontSize: 14, fontWeight: '800', color: '#ff6b6b' },
});
