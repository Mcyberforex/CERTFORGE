import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { C, DOMAIN_COLORS } from '../theme';
import { buildWeakAreas } from '../utils/weakAreas';
import { getTopic } from '../data/domainContent';

export default function WeakAreasReviewView({ progress, navigate, masterNote }) {
  const weakAreas = useMemo(() => buildWeakAreas(progress), [progress]);
  const activeMisses = weakAreas.reduce((total, area) => total + area.notes.length, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigate('dashboard')}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text style={styles.title}>Weak Areas Review</Text>
          <Text style={styles.sub}>{weakAreas.length} topics · {activeMisses} missed questions</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {weakAreas.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No weak areas yet</Text>
            <Text style={styles.emptySub}>
              Missed quiz questions and quiz scores below 80% will build this review automatically.
            </Text>
          </View>
        )}

        {weakAreas.map(area => (
          <WeakAreaCard
            key={`${area.domainId}-${area.topicId}`}
            area={area}
            navigate={navigate}
            masterNote={masterNote}
          />
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function WeakAreaCard({ area, navigate, masterNote }) {
  const topic = getTopic(area.domainId, area.topicId);
  const accent = topic?.color || DOMAIN_COLORS[area.domainId - 1]?.accent || C.cyan;
  const starterLesson = topic?.lessons?.[0];
  const conceptText = starterLesson?.sections?.find(section => section.type === 'text')?.content;

  return (
    <View style={[styles.areaCard, { borderColor: accent + '55' }]}>
      <View style={styles.areaHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.domainLabel, { color: accent }]}>{area.domainName}</Text>
          <Text style={styles.topicTitle}>{area.topicName}</Text>
        </View>
        <View style={[styles.countPill, { borderColor: accent + '55', backgroundColor: accent + '18' }]}>
          <Text style={[styles.countText, { color: accent }]}>
            {area.notes.length} missed
          </Text>
        </View>
      </View>

      {area.quizScore !== null && (
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>QUIZ SCORE TO FIX</Text>
          <Text style={styles.scoreText}>{area.quizScore}% · goal is 80%+</Text>
        </View>
      )}

      {conceptText && (
        <View style={styles.lessonBox}>
          <Text style={[styles.lessonLabel, { color: accent }]}>REVIEW FOCUS</Text>
          <Text style={styles.lessonTitle}>{starterLesson.title}</Text>
          <Text style={styles.lessonText}>{conceptText}</Text>
        </View>
      )}

      {area.notes.length > 0 ? area.notes.map(note => (
        <View key={note.id} style={styles.missBox}>
          <Text style={styles.missQuestion}>{note.question}</Text>
          <View style={styles.answerRow}>
            <View style={styles.wrongAnswer}>
              <Text style={styles.answerLabel}>YOUR ANSWER</Text>
              <Text style={styles.wrongText}>{note.yourAnswer}</Text>
            </View>
            <View style={styles.correctAnswer}>
              <Text style={styles.answerLabel}>CORRECT</Text>
              <Text style={styles.correctText}>{note.correctAnswer}</Text>
            </View>
          </View>
          <Text style={styles.explanation}>{note.explanation}</Text>
          <TouchableOpacity style={styles.masterBtn} onPress={() => masterNote?.(note.id)}>
            <Text style={styles.masterBtnText}>GOT IT</Text>
          </TouchableOpacity>
        </View>
      )) : (
        <View style={styles.missBox}>
          <Text style={styles.explanation}>
            This topic is here because the last saved quiz score is below passing. Review the lesson, then retake the quiz.
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, { borderColor: accent + '66', backgroundColor: accent + '18' }]}
          onPress={() => navigate('lesson', { domainId: area.domainId, topicId: area.topicId, lessonIndex: 0 })}
        >
          <Text style={[styles.actionText, { color: accent }]}>STUDY LESSON</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigate('quiz', { domainId: area.domainId, topicId: area.topicId })}
        >
          <Text style={styles.actionText}>RETAKE QUIZ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bgDeep },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 52, paddingHorizontal: 16, paddingBottom: 14, backgroundColor: C.bgCard, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { width: 36, height: 36, backgroundColor: C.bgElevated, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  backText: { fontSize: 24, color: C.textSec, lineHeight: 30 },
  title: { fontSize: 18, fontWeight: '800', color: C.textPrimary },
  sub: { fontSize: 12, color: C.textSec, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: C.textPrimary, marginBottom: 8 },
  emptySub: { fontSize: 14, color: C.textSec, textAlign: 'center', lineHeight: 22 },
  areaCard: { backgroundColor: C.bgCard, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 14 },
  areaHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  domainLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 3 },
  topicTitle: { fontSize: 17, fontWeight: '800', color: C.textPrimary },
  countPill: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
  countText: { fontSize: 11, fontWeight: '800' },
  scoreBox: { backgroundColor: C.redDim, borderRadius: 10, borderWidth: 1, borderColor: C.redBorder, padding: 10, marginBottom: 10 },
  scoreLabel: { fontSize: 9, fontWeight: '800', color: C.red, letterSpacing: 1, marginBottom: 4 },
  scoreText: { fontSize: 13, color: C.textPrimary, fontWeight: '700' },
  lessonBox: { backgroundColor: C.bgElevated, borderRadius: 10, padding: 12, marginBottom: 10 },
  lessonLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1.1, marginBottom: 5 },
  lessonTitle: { fontSize: 14, fontWeight: '800', color: C.textPrimary, marginBottom: 6 },
  lessonText: { fontSize: 13, color: C.textSec, lineHeight: 21 },
  missBox: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 10, borderWidth: 1, borderColor: C.borderSub, padding: 12, marginBottom: 10 },
  missQuestion: { fontSize: 14, fontWeight: '700', color: C.textPrimary, lineHeight: 21, marginBottom: 10 },
  answerRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  wrongAnswer: { flex: 1, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: C.redBorder },
  correctAnswer: { flex: 1, backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: C.greenBorder },
  answerLabel: { fontSize: 9, fontWeight: '800', color: C.textDim, letterSpacing: 1, marginBottom: 4 },
  wrongText: { fontSize: 12, color: C.red, fontWeight: '700', lineHeight: 18 },
  correctText: { fontSize: 12, color: C.green, fontWeight: '700', lineHeight: 18 },
  explanation: { fontSize: 13, color: C.textSec, lineHeight: 21 },
  masterBtn: { alignSelf: 'flex-start', marginTop: 10, backgroundColor: C.greenDim, borderRadius: 8, borderWidth: 1, borderColor: C.greenBorder, paddingHorizontal: 12, paddingVertical: 6 },
  masterBtnText: { fontSize: 11, fontWeight: '800', color: C.green },
  actions: { flexDirection: 'row', gap: 10, marginTop: 2 },
  actionBtn: { flex: 1, borderRadius: 10, borderWidth: 1, borderColor: C.border, backgroundColor: C.bgElevated, paddingVertical: 10, alignItems: 'center' },
  actionText: { fontSize: 11, fontWeight: '800', color: C.textSec, letterSpacing: 0.8 },
});
