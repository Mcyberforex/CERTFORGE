import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated,
} from 'react-native';
import { C, MONO } from '../theme';
import {
  FINAL_EXAM_MAX_SCORE,
  FINAL_EXAM_MINUTES,
  FINAL_EXAM_MIN_SCORE,
  FINAL_EXAM_PASS,
  getFinalExamQuestions,
} from '../data/finalExam';

const TOTAL_SECS = FINAL_EXAM_MINUTES * 60;

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function FinalExamView({ navigate, devMode }) {
  const questionsRef    = useRef(getFinalExamQuestions(90));
  const questions       = questionsRef.current;
  const answersRef      = useRef({});
  const submittedRef    = useRef(false);
  const lastRandomSignatureRef = useRef('');

  const [qIdx,        setQIdx]        = useState(0);
  const [answers,     setAnswers]     = useState({});
  const [streak,      setStreak]      = useState(0);
  const [secsLeft,    setSecsLeft]    = useState(TOTAL_SECS);
  const [timeUp,      setTimeUp]      = useState(false);
  const [locked,      setLocked]      = useState(false);

  const xpAnim    = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const timerRef  = useRef(null);

  const getExamStats = useCallback((answerMap) => {
    const domainBreakdown = {};
    let correct = 0;
    let earnedWeight = 0;
    let totalWeight = 0;
    const wrongAnswers = [];

    questions.forEach(q => {
      const weight = q.weight || (q.type === 'pbq' ? 3 : 1);
      const selectedAnswer = answerMap[q.id];
      const isCorrect = selectedAnswer === q.correct;
      totalWeight += weight;
      if (!domainBreakdown[q.domainId]) {
        domainBreakdown[q.domainId] = { domainName: q.domainName, correct: 0, total: 0, earnedWeight: 0, totalWeight: 0 };
      }
      domainBreakdown[q.domainId].total += 1;
      domainBreakdown[q.domainId].totalWeight += weight;
      if (isCorrect) {
        correct += 1;
        earnedWeight += weight;
        domainBreakdown[q.domainId].correct += 1;
        domainBreakdown[q.domainId].earnedWeight += weight;
      } else {
        wrongAnswers.push({
          id: q.id,
          question: q.question,
          yourAnswer: selectedAnswer === undefined ? 'Unanswered' : q.options[selectedAnswer],
          correctAnswer: q.options[q.correct],
          explanation: q.explanation,
        });
      }
    });

    const percent = totalWeight > 0 ? earnedWeight / totalWeight : 0;
    const score = Math.round(FINAL_EXAM_MIN_SCORE + percent * (FINAL_EXAM_MAX_SCORE - FINAL_EXAM_MIN_SCORE));
    return { correct, wrongAnswers, domainBreakdown, score };
  }, [questions]);

  const finishExam = useCallback((answerMap, secs) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setLocked(true);
    clearInterval(timerRef.current);
    const total    = questions.length;
    const { correct, wrongAnswers, domainBreakdown, score } = getExamStats(answerMap);
    const xpEarned = correct * 10 + (score >= FINAL_EXAM_PASS ? 500 : 0);
    const timeUsed = TOTAL_SECS - secs;
    navigate('final-results', { score, correct, total, xpEarned, passed: score >= FINAL_EXAM_PASS, wrongAnswers, timeUsed, domainBreakdown });
  }, [getExamStats, navigate, questions.length]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecsLeft(s => {
        if (s <= 1) {
          setLocked(true);
          setTimeUp(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Use refs so the timeUp effect always reads the latest values without stale closure
  useEffect(() => {
    if (timeUp) finishExam(answersRef.current, 0);
  }, [timeUp, finishExam]);

  const current    = questions[qIdx];
  const selected   = answers[current.id];
  const { score: currentScaledScore } = getExamStats(answers);
  const timerColor = secsLeft <= 300 ? C.red : secsLeft <= 900 ? C.amber : C.green;
  const progress_pct = (qIdx / questions.length) * 100;

  const handleSelect = (optIdx) => {
    if (locked) return;
    const isCorrect = optIdx === current.correct;
    const newAnswers = { ...answersRef.current, [current.id]: optIdx };
    answersRef.current = newAnswers;
    setAnswers(newAnswers);

    if (isCorrect) {
      setStreak(s => s + 1);
      Animated.sequence([
        Animated.spring(xpAnim, { toValue: 1, useNativeDriver: true }),
        Animated.delay(500),
        Animated.spring(xpAnim, { toValue: 0, useNativeDriver: true }),
      ]).start();
    } else {
      setStreak(0);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 8,  duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 4,  duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0,  duration: 60, useNativeDriver: true }),
      ]).start();
    }
  };

  const handleNext = () => {
    if (locked) return;
    if (qIdx + 1 >= questions.length) {
      finishExam(answersRef.current, secsLeft);
      return;
    }
    setQIdx(i => i + 1);
  };

  const handlePrev = () => {
    if (locked || qIdx <= 0) return;
    setQIdx(i => i - 1);
  };

  const setBulkAnswers = (builder) => {
    if (!devMode || locked) return;
    const newAnswers = {};
    questions.forEach((q, index) => {
      newAnswers[q.id] = builder(q, index);
    });
    answersRef.current = newAnswers;
    setAnswers(newAnswers);
  };

  const answerAllCorrect = () => setBulkAnswers(q => q.correct);
  const answerAllWrong = () => setBulkAnswers(q => {
    const wrong = q.options.map((_, i) => i).filter(i => i !== q.correct);
    return wrong[Math.floor(Math.random() * wrong.length)];
  });
  const answerRandom = () => {
    if (!devMode || locked) return;
    let newAnswers = {};
    let signature = '';
    let attempts = 0;
    do {
      newAnswers = {};
      questions.forEach(q => {
        newAnswers[q.id] = Math.floor(Math.random() * q.options.length);
      });
      signature = questions.map(q => newAnswers[q.id]).join('');
      attempts++;
    } while (signature === lastRandomSignatureRef.current && attempts < 5);
    lastRandomSignatureRef.current = signature;
    answersRef.current = newAnswers;
    setAnswers(newAnswers);
  };

  const overrideTimer = (seconds) => {
    if (!devMode || locked) return;
    setSecsLeft(seconds);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('dashboard')} style={styles.backBtn}>
          <Text style={styles.backText}>✕</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text style={styles.examLabel}>🎓 NET+ FINAL EXAM</Text>
          <Text style={styles.qCounter}>{qIdx + 1} of {questions.length}</Text>
        </View>
        {streak >= 2 && (
          <View style={styles.streakPill}>
            <Text style={styles.streakPillText}>🔥 {streak}</Text>
          </View>
        )}
        <View style={[styles.timerPill, { borderColor: timerColor + '55', backgroundColor: timerColor + '15' }]}>
          <Text style={[styles.timerText, { color: timerColor, fontFamily: MONO }]}>
            ⏱ {formatTime(secsLeft)}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress_pct}%` }]} />
      </View>

      {devMode && (
        <View style={styles.devPanel}>
          <Text style={styles.devTitle}>DEV EXAM TOOLS</Text>
          <View style={styles.devRow}>
            <TouchableOpacity style={styles.devBtn} onPress={answerAllCorrect} disabled={locked}>
              <Text style={styles.devBtnText}>All Correct</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.devBtn} onPress={answerAllWrong} disabled={locked}>
              <Text style={styles.devBtnText}>All Wrong</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.devBtn} onPress={answerRandom} disabled={locked}>
              <Text style={styles.devBtnText}>Random</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.devRow}>
            <TouchableOpacity style={styles.devBtn} onPress={() => overrideTimer(5)} disabled={locked}>
              <Text style={styles.devBtnText}>5s</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.devBtn} onPress={() => overrideTimer(10)} disabled={locked}>
              <Text style={styles.devBtnText}>10s</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.devBtn} onPress={() => overrideTimer(30)} disabled={locked}>
              <Text style={styles.devBtnText}>30s</Text>
            </TouchableOpacity>
            <Text style={styles.devDebug}>
              {Object.keys(answers).length}/{questions.length} answered · {locked ? 'locked' : 'active'} · score {currentScaledScore}
            </Text>
          </View>
        </View>
      )}

      {/* XP pop */}
      <Animated.View style={[styles.xpPop, {
        opacity: xpAnim,
        transform: [{ scale: xpAnim.interpolate({ inputRange: [0,1], outputRange: [0.5, 1.2] }) }],
      }]}>
        <Text style={styles.xpPopText}>{streak >= 3 ? `🔥 ${streak} STREAK  +10 XP` : '+10 XP ⚡'}</Text>
      </Animated.View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Question */}
        <Animated.View style={[styles.questionCard, { transform: [{ translateX: shakeAnim }] }]}>
          <View style={styles.qNumBadge}>
            <Text style={[styles.qNumText, { fontFamily: MONO }]}>Q{qIdx + 1}</Text>
          </View>
          <Text style={styles.questionText}>{current.question}</Text>
        </Animated.View>

        {/* Options */}
        <View style={styles.optionsWrap}>
          {current.options.map((opt, i) => {
            const isSelected = selected === i;
            const letters    = ['A', 'B', 'C', 'D'];
            let borderColor  = C.border;
            let letterBg     = C.bgElevated;
            let letterColor  = C.textSec;
            let textColor    = C.textPrimary;

            if (isSelected) {
              borderColor = C.cyan;
              letterBg = C.cyanDim;
              letterColor = C.cyan;
              textColor = C.cyan;
            }

            return (
              <TouchableOpacity
                key={i}
                style={[styles.optCard, { borderColor }]}
                onPress={() => handleSelect(i)}
                disabled={locked}
                activeOpacity={0.7}
              >
                <View style={[styles.optLetter, { backgroundColor: letterBg, borderColor }]}>
                  <Text style={[styles.optLetterText, { color: letterColor, fontFamily: MONO }]}>{letters[i]}</Text>
                </View>
                <Text style={[styles.optText, { color: textColor }]}>{opt}</Text>
                {isSelected && <Text style={styles.checkMark}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Footer */}
      {!locked && (
        <View style={styles.footer}>
          <View style={styles.footerMeta}>
            <Text style={styles.footerScore}>{Object.keys(answers).length}/{questions.length} answered</Text>
            <Text style={styles.footerNeeded}>Need {FINAL_EXAM_PASS} to pass  ·  {formatTime(secsLeft)} left</Text>
          </View>
          <View style={styles.footerActions}>
            <TouchableOpacity style={[styles.prevBtn, qIdx <= 0 && styles.navBtnDisabled]} onPress={handlePrev} disabled={qIdx <= 0}>
              <Text style={styles.prevBtnText}>← PREV</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextBtnText}>
                {qIdx + 1 >= questions.length ? 'SUBMIT EXAM →' : 'NEXT QUESTION →'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: C.bgDeep },
  header:          { flexDirection: 'row', alignItems: 'center', paddingTop: 52, paddingHorizontal: 16, paddingBottom: 14, backgroundColor: C.bgCard, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn:         { width: 36, height: 36, backgroundColor: C.bgElevated, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  backText:        { fontSize: 16, color: C.textSec, fontWeight: '700' },
  examLabel:       { fontSize: 10, fontWeight: '800', color: C.cyan, letterSpacing: 1.5 },
  qCounter:        { fontSize: 13, color: C.textSec, marginTop: 2 },
  timerPill:       { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1.5 },
  timerText:       { fontSize: 16, fontWeight: '900' },
  streakPill:      { marginRight: 8, backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)' },
  streakPillText:  { fontSize: 14, fontWeight: '800', color: '#ff6b6b' },
  progressTrack:   { height: 3, backgroundColor: C.bgElevated },
  progressFill:    { height: '100%', backgroundColor: C.cyan },
  devPanel:         { backgroundColor: C.bgCard, borderBottomWidth: 1, borderBottomColor: C.cyanBorder, padding: 10, gap: 8 },
  devTitle:         { fontSize: 10, fontWeight: '900', color: C.cyan, letterSpacing: 1.2 },
  devRow:           { flexDirection: 'row', alignItems: 'center', gap: 8 },
  devBtn:           { backgroundColor: C.bgElevated, borderRadius: 8, borderWidth: 1, borderColor: C.cyanBorder, paddingHorizontal: 10, paddingVertical: 7 },
  devBtnText:       { fontSize: 11, fontWeight: '800', color: C.cyan },
  devDebug:         { flex: 1, fontSize: 11, color: C.textSec },
  xpPop:           { position: 'absolute', top: 120, alignSelf: 'center', zIndex: 99, backgroundColor: 'rgba(16,185,129,0.9)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 99 },
  xpPopText:       { fontSize: 16, fontWeight: '900', color: '#fff' },
  scroll:          { flex: 1 },
  scrollContent:   { padding: 16 },
  questionCard:    { backgroundColor: C.bgCard, borderRadius: 16, borderWidth: 1, borderColor: C.cyanBorder, padding: 20, marginBottom: 16 },
  qNumBadge:       { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: C.cyanBorder, backgroundColor: C.cyanDim, marginBottom: 12 },
  qNumText:        { fontSize: 12, fontWeight: '700', color: C.cyan },
  questionText:    { fontSize: 17, color: C.textPrimary, fontWeight: '600', lineHeight: 26 },
  optionsWrap:     { gap: 10, marginBottom: 16 },
  optCard:         { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: C.bgCard, borderRadius: 12, borderWidth: 1.5, padding: 14, gap: 12 },
  optLetter:       { width: 32, height: 32, borderRadius: 9, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  optLetterText:   { fontSize: 13, fontWeight: '800' },
  optText:         { flex: 1, fontSize: 15, lineHeight: 22 },
  checkMark:       { fontSize: 18, color: C.green, fontWeight: '800' },
  crossMark:       { fontSize: 18, color: C.red, fontWeight: '800' },
  explanationCard: { backgroundColor: C.bgCard, borderRadius: 14, borderWidth: 1.5, padding: 16, marginBottom: 10 },
  explanationLabel:{ fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  explanationText: { fontSize: 14, color: C.textSec, lineHeight: 22 },
  footer:          { padding: 16, paddingBottom: 32, backgroundColor: C.bgCard, borderTopWidth: 1, borderTopColor: C.border },
  footerMeta:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  footerScore:     { fontSize: 12, color: C.green, fontWeight: '700' },
  footerNeeded:    { fontSize: 12, color: C.textDim },
  footerActions:   { flexDirection: 'row', gap: 10 },
  prevBtn:         { paddingHorizontal: 16, paddingVertical: 16, borderRadius: 14, alignItems: 'center', backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border },
  prevBtnText:     { fontSize: 13, fontWeight: '800', color: C.textPrimary, letterSpacing: 0.5 },
  navBtnDisabled:  { opacity: 0.45 },
  nextBtn:         { flex: 1, paddingVertical: 16, borderRadius: 14, alignItems: 'center', backgroundColor: C.cyan },
  nextBtnText:     { fontSize: 15, fontWeight: '800', color: '#000', letterSpacing: 0.5 },
});
