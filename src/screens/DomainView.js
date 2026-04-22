import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, AppState,
} from 'react-native';
import { C, S, DOMAIN_COLORS, MONO } from '../theme';
import { DOMAINS } from '../data/domains';
import { DOMAIN_TOPIC_ORDER, getDomainTopics, getTopic } from '../data/domainContent';

export default function DomainView({ domainId, progress, navigate, startDomainTimer, pauseDomainTimer }) {
  const domain         = DOMAINS.find(d => d.id === domainId);
  const colors         = DOMAIN_COLORS[domainId - 1];
  const domainProgress = progress.domains[domainId];

  const topicOrder = DOMAIN_TOPIC_ORDER[domainId] || [];
  const topics = getDomainTopics(domainId);

  // Force re-render every second so live timer updates
  const [, tick] = useState(0);

  useEffect(() => {
    startDomainTimer?.(domainId);

    const appSub = AppState.addEventListener('change', state => {
      if (state === 'background' || state === 'inactive') {
        pauseDomainTimer?.(domainId);
      } else if (state === 'active') {
        startDomainTimer?.(domainId);
      }
    });

    const interval = setInterval(() => tick(n => n + 1), 1000);

    return () => {
      pauseDomainTimer?.(domainId);
      appSub.remove();
      clearInterval(interval);
    };
  }, [domainId]);

  const getTopicProgress = (topicId) => {
    const tp = domainProgress?.topics?.[topicId];
    if (!tp) return { lessons: 0, totalLessons: 0, quizScore: null, pbqDone: false };
    const topicData = getTopic(domainId, topicId);
    return {
      lessons: tp.lessonsCompleted.length,
      totalLessons: topicData?.lessons.length || 0,
      quizScore: tp.quizScore,
      pbqDone: tp.pbqCompleted,
    };
  };

  const allTopicsStats  = topicOrder.map(id => getTopicProgress(id));
  const totalScore      = allTopicsStats.reduce((sum, t) => sum + (t.quizScore || 0), 0);
  const avgScore        = topicOrder.length > 0 ? Math.round(totalScore / topicOrder.length) : 0;
  const topicsPassed    = allTopicsStats.filter(t => (t.quizScore || 0) >= 80).length;

  // Live timer computation
  const timerData = progress.domainTimers?.[domainId];
  const liveMs = timerData
    ? (timerData.totalMs + (timerData.sessionStartMs ? Date.now() - timerData.sessionStartMs : 0))
    : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigate('dashboard')}>
        <Text style={styles.backText}>‹ HOME</Text>
      </TouchableOpacity>

      <View style={[styles.domainHeader, { borderColor: colors.border }]}>
        <Text style={styles.domainIcon}>{domain.icon}</Text>
        <View style={[styles.domainBadge, { backgroundColor: colors.dim, borderColor: colors.border }]}>
          <Text style={[styles.domainBadgeText, { color: colors.accent }]}>DOMAIN {domain.id}</Text>
        </View>
        <Text style={styles.domainName}>{domain.name}</Text>
        <Text style={styles.domainSub}>{domain.subtitle}</Text>

        <View style={[S.row, { justifyContent: 'space-around', marginTop: 16, width: '100%' }]}>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: colors.accent }]}>{topicsPassed}/{topicOrder.length}</Text>
            <Text style={styles.statLabel}>PASSED</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: colors.accent }]}>{avgScore}%</Text>
            <Text style={styles.statLabel}>AVG SCORE</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: colors.accent }]}>
              {progress.domains[domainId]
                ? topicOrder.reduce((sum, id) => sum + (domainProgress?.topics?.[id]?.lessonsCompleted?.length || 0), 0)
                : 0}
            </Text>
            <Text style={styles.statLabel}>LESSONS</Text>
          </View>
        </View>

        {/* Domain Timer */}
        <View style={[styles.timerRow, { borderTopColor: colors.border }]}>
          <View style={styles.timerItem}>
            <Text style={[styles.timerValue, { color: timerData?.completed ? C.green : colors.accent, fontFamily: MONO }]}>
              {formatTimer(liveMs)}
            </Text>
            <Text style={styles.timerLabel}>
              {timerData?.completed ? '✓ COMPLETE' : 'TIME ACTIVE'}
            </Text>
          </View>
          {timerData?.startedAt && (
            <>
              <View style={styles.statDivider} />
              <View style={styles.timerItem}>
                <Text style={[styles.timerValue, { color: colors.accent, fontFamily: MONO }]}>
                  {getDaysLabel(timerData.startedAt, timerData.completedAt)}
                </Text>
                <Text style={styles.timerLabel}>
                  {timerData.completed ? 'TO COMPLETE' : 'SINCE START'}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Topics */}
      <Text style={styles.sectionLabel}>TRAINING MODULES</Text>

      {topics.map((topic) => {
        const tp     = getTopicProgress(topic.id);
        const passed = (tp.quizScore || 0) >= 80;
        const topicColors = { accent: topic.color, dim: topic.color + '22', border: topic.color + '44' };

        return (
          <View key={topic.id} style={[styles.topicCard, { borderColor: topicColors.border }]}>
            {/* Topic Header */}
            <View style={[S.row, { marginBottom: 14 }]}>
              <View style={[styles.topicIcon, { backgroundColor: topicColors.dim }]}>
                <Text style={styles.topicEmoji}>{topic.icon}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={[S.row, { justifyContent: 'space-between' }]}>
                  <Text style={[styles.topicName, { color: topic.color }]}>{topic.name}</Text>
                  {passed && (
                    <View style={styles.passedBadge}>
                      <Text style={styles.passedText}>✓ {tp.quizScore}%</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.topicMeta}>
                  {topic.lessons.length} lessons · {topic.quiz.length} questions · {topic.pbqs.length} PBQs
                </Text>
              </View>
            </View>

            {/* Lesson Progress */}
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Lessons: {tp.lessons}/{tp.totalLessons}</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, {
                  width: tp.totalLessons > 0 ? `${Math.round((tp.lessons / tp.totalLessons) * 100)}%` : '0%',
                  backgroundColor: topic.color,
                }]} />
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: topicColors.dim, borderColor: topicColors.border, flex: 1 }]}
                onPress={() => navigate('lesson', { domainId, topicId: topic.id, lessonIndex: 0 })}
              >
                <Text style={styles.actionBtnIcon}>📖</Text>
                <Text style={[styles.actionBtnText, { color: topic.color }]}>
                  {tp.lessons >= tp.totalLessons ? 'REVIEW' : 'LEARN'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: topicColors.dim, borderColor: topicColors.border, flex: 1, marginLeft: 8 }]}
                onPress={() => navigate('quiz', { domainId, topicId: topic.id })}
              >
                <Text style={styles.actionBtnIcon}>🧠</Text>
                <Text style={[styles.actionBtnText, { color: topic.color }]}>QUIZ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: topicColors.dim, borderColor: topicColors.border, flex: 1, marginLeft: 8 }]}
                onPress={() => navigate('pbq', { domainId, topicId: topic.id })}
              >
                <Text style={styles.actionBtnIcon}>{tp.pbqDone ? '✅' : '🎯'}</Text>
                <Text style={[styles.actionBtnText, { color: topic.color }]}>PBQ</Text>
              </TouchableOpacity>
            </View>

            {/* Quiz score bar */}
            {tp.quizScore !== null && (
              <View style={styles.quizScoreRow}>
                <Text style={styles.progressLabel}>Quiz Best: {tp.quizScore}%</Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, {
                    width: `${tp.quizScore}%`,
                    backgroundColor: tp.quizScore >= 80 ? C.green : C.red,
                  }]} />
                </View>
                <View style={[styles.scoreLine, { left: '80%', backgroundColor: 'rgba(255,255,255,0.3)' }]} />
              </View>
            )}
          </View>
        );
      })}

      {/* Notes link */}
      {progress.notes.filter(n => !n.mastered).length > 0 && (
        <TouchableOpacity style={styles.notesCard} onPress={() => navigate('notes')}>
          <Text style={styles.notesCardIcon}>📋</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.notesCardTitle}>Review Your Notes</Text>
            <Text style={styles.notesCardSub}>{progress.notes.filter(n => !n.mastered).length} missed questions saved</Text>
          </View>
          <Text style={styles.notesCardArrow}>›</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function formatTimer(ms) {
  if (!ms || ms < 1000) return '0m 0s';
  const totalSecs = Math.floor(ms / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

function getDaysLabel(startedAt, completedAt) {
  if (!startedAt) return '—';
  const start = new Date(startedAt);
  const end   = completedAt ? new Date(completedAt) : new Date();
  const days  = Math.floor((end - start) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  return `${days}d`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bgDeep },
  content: { paddingHorizontal: 16, paddingTop: 56, paddingBottom: 20 },
  backBtn: { marginBottom: 16 },
  backText: { fontSize: 13, fontWeight: '700', color: C.cyan, letterSpacing: 0.5 },
  domainHeader: { backgroundColor: C.bgCard, borderRadius: 16, borderWidth: 1, padding: 20, alignItems: 'center', marginBottom: 20 },
  domainIcon: { fontSize: 44, marginBottom: 12 },
  domainBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, borderWidth: 1, marginBottom: 8 },
  domainBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  domainName: { fontSize: 22, fontWeight: '800', color: C.textPrimary, textAlign: 'center', marginBottom: 4 },
  domainSub: { fontSize: 12, color: C.textSec, textAlign: 'center' },
  statBox: { alignItems: 'center', flex: 1 },
  statNum: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 9, color: C.textDim, fontWeight: '700', letterSpacing: 1, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: C.border },
  timerRow: {
    flexDirection: 'row', width: '100%', marginTop: 16, paddingTop: 14,
    borderTopWidth: 1, justifyContent: 'space-around',
  },
  timerItem: { alignItems: 'center', flex: 1 },
  timerValue: { fontSize: 18, fontWeight: '800' },
  timerLabel: { fontSize: 9, color: C.textDim, fontWeight: '700', letterSpacing: 1, marginTop: 2 },
  sectionLabel: { fontSize: 10, fontWeight: '800', color: C.textDim, letterSpacing: 1.5, marginBottom: 12 },
  topicCard: { backgroundColor: C.bgCard, borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 12 },
  topicIcon: { width: 44, height: 44, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  topicEmoji: { fontSize: 22 },
  topicName: { fontSize: 16, fontWeight: '700' },
  topicMeta: { fontSize: 12, color: C.textSec, marginTop: 2 },
  passedBadge: { backgroundColor: 'rgba(16,185,129,0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  passedText: { fontSize: 11, fontWeight: '700', color: C.green },
  progressRow: { marginBottom: 12 },
  quizScoreRow: { marginTop: 8 },
  progressLabel: { fontSize: 11, color: C.textSec, marginBottom: 5 },
  progressTrack: { height: 4, backgroundColor: C.bgElevated, borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 99 },
  scoreLine: { position: 'absolute', top: 0, width: 1.5, height: '100%' },
  buttonRow: { flexDirection: 'row' },
  actionBtn: { padding: 10, borderRadius: 10, borderWidth: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  actionBtnIcon: { fontSize: 16, marginRight: 6 },
  actionBtnText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  notesCard: { backgroundColor: C.bgCard, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)', padding: 16, flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  notesCardIcon: { fontSize: 26 },
  notesCardTitle: { fontSize: 15, fontWeight: '700', color: C.textPrimary },
  notesCardSub: { fontSize: 12, color: C.amber, marginTop: 2 },
  notesCardArrow: { fontSize: 22, color: C.amber },
});
