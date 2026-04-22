import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { C, MONO } from '../theme';
import { FINAL_EXAM_PASS } from '../data/finalExam';

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}

export default function FinalResultsScreen({ params, navigate }) {
  const { score, correct, total, xpEarned, passed, wrongAnswers, timeUsed, domainBreakdown } = params;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, tension: 70, friction: 6, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const getGrade = () => {
    if (score >= 850) return { label: 'OUTSTANDING', color: C.cyan,  emoji: '🏆' };
    if (score >= FINAL_EXAM_PASS) return { label: 'PASSED', color: C.green, emoji: '✅' };
    if (score >= 650) return { label: 'CLOSE — RETRY', color: C.amber, emoji: '📚' };
    return                { label: 'KEEP STUDYING', color: C.red,   emoji: '💪' };
  };

  const grade = getGrade();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Animated.View style={[styles.scoreWrap, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[styles.scoreCircle, { borderColor: grade.color }]}>
          <Text style={styles.scoreEmoji}>{grade.emoji}</Text>
          <Text style={[styles.scoreNum, { color: grade.color, fontFamily: MONO }]}>{score}</Text>
          <Text style={[styles.scoreGrade, { color: grade.color }]}>{grade.label}</Text>
        </View>
        <Text style={styles.examTitle}>NET+ Final Exam</Text>
        <Text style={styles.examSub}>{correct}/{total} correct  ·  {formatTime(timeUsed)} used</Text>
      </Animated.View>

      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: C.green }]}>{correct}</Text>
            <Text style={styles.statLabel}>CORRECT</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: C.red }]}>{total - correct}</Text>
            <Text style={styles.statLabel}>MISSED</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: C.amber }]}>+{xpEarned}</Text>
            <Text style={styles.statLabel}>XP EARNED</Text>
          </View>
        </View>

        {/* Pass/fail card */}
        <View style={[styles.statusCard, {
          borderColor: passed ? C.green + '55' : C.red + '55',
          backgroundColor: passed ? 'rgba(16,185,129,0.07)' : 'rgba(239,68,68,0.07)',
        }]}>
          <Text style={styles.statusIcon}>{passed ? '🎓' : '🔒'}</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.statusTitle, { color: passed ? C.green : C.red }]}>
              {passed ? 'Network+ Exam Passed!' : `Need ${FINAL_EXAM_PASS} to Pass`}
            </Text>
            <Text style={styles.statusSub}>
              {passed
                ? 'Great work. You have a solid grasp of Network+ objectives.'
                : `You scored ${score}. Review the missed questions and retake the exam.`}
            </Text>
          </View>
        </View>

        {domainBreakdown && (
          <>
            <Text style={styles.sectionLabel}>DOMAIN BREAKDOWN</Text>
            {Object.entries(domainBreakdown).map(([domainId, data]) => (
              <View key={domainId} style={styles.domainRow}>
                <Text style={styles.domainName}>{data.domainName}</Text>
                <Text style={styles.domainScore}>{data.correct}/{data.total}</Text>
              </View>
            ))}
          </>
        )}

        {/* Missed questions */}
        {wrongAnswers && wrongAnswers.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>MISSED QUESTIONS</Text>
            {wrongAnswers.map((q, i) => (
              <View key={i} style={styles.wrongCard}>
                <Text style={styles.wrongQ}>{q.question}</Text>
                <View style={styles.wrongAnswerRow}>
                  <View style={[styles.answerTag, { backgroundColor: 'rgba(239,68,68,0.1)', borderColor: C.red + '55' }]}>
                    <Text style={styles.answerTagLabel}>YOUR ANSWER</Text>
                    <Text style={[styles.answerTagText, { color: C.red }]}>{q.yourAnswer}</Text>
                  </View>
                  <View style={[styles.answerTag, { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: C.green + '55' }]}>
                    <Text style={styles.answerTagLabel}>CORRECT</Text>
                    <Text style={[styles.answerTagText, { color: C.green }]}>{q.correctAnswer}</Text>
                  </View>
                </View>
                <Text style={styles.wrongExplain}>{q.explanation}</Text>
              </View>
            ))}
          </>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: C.cyan, marginBottom: 10 }]} onPress={() => navigate('final-exam')}>
            <Text style={styles.actionBtnText}>🔄 RETAKE EXAM</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border }]} onPress={() => navigate('dashboard')}>
            <Text style={[styles.actionBtnText, { color: C.textPrimary }]}>🏠 BACK TO HOME</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: C.bgDeep },
  content:        { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 20 },
  scoreWrap:      { alignItems: 'center', marginBottom: 24 },
  scoreCircle:    { width: 160, height: 160, borderRadius: 80, borderWidth: 3, backgroundColor: C.bgCard, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  scoreEmoji:     { fontSize: 32, marginBottom: 4 },
  scoreNum:       { fontSize: 36, fontWeight: '900' },
  scoreGrade:     { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginTop: 2 },
  examTitle:      { fontSize: 18, fontWeight: '800', color: C.textPrimary },
  examSub:        { fontSize: 13, color: C.textSec, marginTop: 4 },
  statsRow:       { flexDirection: 'row', backgroundColor: C.bgCard, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 12, justifyContent: 'space-around' },
  statBox:        { alignItems: 'center', flex: 1 },
  statNum:        { fontSize: 24, fontWeight: '800', fontFamily: MONO },
  statLabel:      { fontSize: 9, color: C.textDim, fontWeight: '700', letterSpacing: 1, marginTop: 4 },
  statDivider:    { width: 1, backgroundColor: C.border },
  statusCard:     { borderRadius: 14, borderWidth: 1, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  statusIcon:     { fontSize: 30 },
  statusTitle:    { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  statusSub:      { fontSize: 13, color: C.textSec, lineHeight: 20 },
  sectionLabel:   { fontSize: 10, fontWeight: '800', color: C.textDim, letterSpacing: 1.5, marginBottom: 10 },
  domainRow:      { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: C.bgCard, borderRadius: 10, borderWidth: 1, borderColor: C.border, padding: 12, marginBottom: 8 },
  domainName:     { flex: 1, fontSize: 13, fontWeight: '700', color: C.textPrimary },
  domainScore:    { fontSize: 13, fontWeight: '900', color: C.cyan, fontFamily: MONO },
  wrongCard:      { backgroundColor: C.bgCard, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 10 },
  wrongQ:         { fontSize: 14, fontWeight: '600', color: C.textPrimary, lineHeight: 21, marginBottom: 10 },
  wrongAnswerRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  answerTag:      { flex: 1, borderRadius: 8, borderWidth: 1, padding: 8 },
  answerTagLabel: { fontSize: 9, fontWeight: '800', color: C.textDim, letterSpacing: 1, marginBottom: 3 },
  answerTagText:  { fontSize: 12, fontWeight: '600', lineHeight: 18 },
  wrongExplain:   { fontSize: 12, color: C.textSec, lineHeight: 19, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 8 },
  actions:        { marginTop: 16 },
  actionBtn:      { paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 0 },
  actionBtnText:  { fontSize: 14, fontWeight: '800', color: '#000', letterSpacing: 0.5 },
});
