import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, Alert, Platform,
} from 'react-native';
import { C, S, DOMAIN_COLORS, getLevel, getLevelProgress, getLevelXP, XP_PER_LEVEL } from '../theme';
import { DOMAINS, DAILY_TIPS } from '../data/domains';
import { buildWeakAreas } from '../utils/weakAreas';

const { width } = Dimensions.get('window');

const DOMAIN1_TOPIC_IDS = ['osi', 'tcpip', 'ports', 'subnetting'];

export default function Dashboard({ progress, navigate, onboardingAlways, toggleOnboardingAlways, devUnlockAll, toggleDevUnlockAll, resetProgress, pendingResume }) {
  const level    = getLevel(progress.xp);
  const levelPct = getLevelProgress(progress.xp);
  const levelXP  = getLevelXP(progress.xp);

  const todayTip = useMemo(() => {
    const idx = new Date().getDate() % DAILY_TIPS.length;
    return DAILY_TIPS[idx];
  }, []);

  const isDailyDone = (() => {
    const today = new Date().toDateString();
    return progress.dailyQuiz.lastDate === today && progress.dailyQuiz.todayCompleted;
  })();

  const activeNotes = progress.notes.filter(n => !n.mastered);
  const weakAreas = useMemo(() => buildWeakAreas(progress), [progress]);
  const weakMisses = weakAreas.reduce((total, area) => total + area.notes.length, 0);
  const resumeQuiz = pendingResume?.quiz ? pendingResume : null;
  const resumeQuestion = resumeQuiz?.quiz?.currentQuestionIndex !== undefined
    ? resumeQuiz.quiz.currentQuestionIndex + 1
    : null;

  const confirmResetProgress = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (window.confirm('Are you sure you want to reset all progress?')) {
        resetProgress?.();
      }
      return;
    }

    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset all progress?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => resetProgress?.() },
      ]
    );
  };

  // Final exam is unlocked once all Domain 1 topics are passed at >= 80%
  const domain1 = progress.domains[1];
  const finalExamUnlocked = devUnlockAll || DOMAIN1_TOPIC_IDS.every(
    t => (domain1?.topics?.[t]?.quizScore || 0) >= 80
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>NET<Text style={styles.logoPlus}>+</Text> Study</Text>
          <Text style={styles.logoSub}>CompTIA Network+ Training</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.introToggle, onboardingAlways && styles.introToggleOn]}
            onPress={() => toggleOnboardingAlways?.(!onboardingAlways)}
          >
            <Text style={[styles.introToggleText, onboardingAlways && { color: C.cyan }]}>
              {onboardingAlways ? '🔄 INTRO ON' : '🔄 INTRO OFF'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.introToggle, devUnlockAll && styles.introToggleOn]}
            onPress={() => toggleDevUnlockAll?.(!devUnlockAll)}
          >
            <Text style={[styles.introToggleText, devUnlockAll && { color: C.cyan }]}>
              {devUnlockAll ? '🛠 DEVELOPER TOOL' : '🛠 DEVELOPER OFF'}
            </Text>
          </TouchableOpacity>
          {devUnlockAll && (
            <TouchableOpacity style={[styles.introToggle, styles.resetToggle]} onPress={confirmResetProgress}>
              <Text style={[styles.introToggleText, styles.resetToggleText]}>RESET</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.notesBtn} onPress={() => navigate('notes')}>
            <Text style={styles.notesBtnIcon}>📋</Text>
            {activeNotes.length > 0 && (
              <View style={styles.notesBadge}>
                <Text style={styles.notesBadgeText}>{activeNotes.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* XP Bar */}
      <View style={styles.xpCard}>
        <View style={[S.row, { justifyContent: 'space-between', marginBottom: 8 }]}>
          <View style={S.row}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelNum}>{level}</Text>
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.levelLabel}>LEVEL {level}</Text>
              <Text style={styles.xpText}>{levelXP} / {XP_PER_LEVEL} XP</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.totalXP}>{progress.xp} XP</Text>
            <Text style={styles.totalLabel}>TOTAL</Text>
          </View>
        </View>
        <View style={styles.xpTrack}>
          <View style={[styles.xpFill, { width: `${Math.round(levelPct * 100)}%` }]} />
        </View>
        <View style={[S.row, { justifyContent: 'space-between', marginTop: 6 }]}>
          <Text style={styles.xpSub}>Level {level}</Text>
          <Text style={styles.xpSub}>Level {level + 1} — {XP_PER_LEVEL - levelXP} XP away</Text>
        </View>
      </View>

      {/* Daily Tip */}
      <View style={styles.tipCard}>
        <View style={[S.row, { marginBottom: 8 }]}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipLabel}>DAILY TIP</Text>
        </View>
        <Text style={styles.tipText}>{todayTip}</Text>
      </View>

      {/* Daily Quiz */}
      <TouchableOpacity
        style={[styles.dailyCard, isDailyDone && styles.dailyDone]}
        onPress={() => !isDailyDone && navigate('daily-quiz')}
        activeOpacity={isDailyDone ? 1 : 0.7}
      >
        <View style={{ flex: 1 }}>
          <View style={[S.row, { marginBottom: 4 }]}>
            <Text style={styles.dailyIcon}>{isDailyDone ? '✅' : '⚡'}</Text>
            <Text style={styles.dailyTitle}>{isDailyDone ? 'Daily Quiz Complete!' : 'Daily Quiz'}</Text>
          </View>
          <Text style={styles.dailySub}>
            {isDailyDone
              ? `Streak: ${progress.dailyQuiz.streak} day${progress.dailyQuiz.streak !== 1 ? 's' : ''} 🔥`
              : '15 questions · Mix of all topics · +200 XP'}
          </Text>
        </View>
        {!isDailyDone && (
          <View style={styles.dailyArrow}>
            <Text style={styles.dailyArrowText}>›</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Resume Quiz */}
      {resumeQuiz && (
        <TouchableOpacity
          style={styles.resumeCard}
          onPress={() => navigate(resumeQuiz.screen, resumeQuiz.params)}
          activeOpacity={0.75}
        >
          <View style={{ flex: 1 }}>
            <View style={[S.row, { marginBottom: 4 }]}>
              <Text style={styles.resumeIcon}>↩</Text>
              <Text style={styles.resumeTitle}>Resume Quiz</Text>
            </View>
            <Text style={styles.resumeSub}>
              {resumeQuiz.quiz.topicName || 'Saved Quiz'}
              {resumeQuestion ? ` · Question ${resumeQuestion}` : ''}
            </Text>
          </View>
          <View style={styles.resumeArrow}>
            <Text style={styles.resumeArrowText}>›</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Weak Areas Review */}
      <TouchableOpacity
        style={styles.weakCard}
        onPress={() => navigate('weak-areas')}
        activeOpacity={0.75}
      >
        <View style={{ flex: 1 }}>
          <View style={[S.row, { marginBottom: 4 }]}>
            <Text style={styles.weakIcon}>🎯</Text>
            <Text style={styles.weakTitle}>Weak Areas Review</Text>
          </View>
          <Text style={styles.weakSub}>
            {weakAreas.length > 0
              ? `${weakAreas.length} topics · ${weakMisses} missed questions · updates as you quiz`
              : 'Missed questions and low scores will build this lesson over time'}
          </Text>
        </View>
        <View style={styles.weakArrow}>
          <Text style={styles.weakArrowText}>›</Text>
        </View>
      </TouchableOpacity>

      {/* Domain Grid */}
      <Text style={styles.sectionLabel}>TRAINING DOMAINS</Text>

      {DOMAINS.map((domain, idx) => {
        const colors        = DOMAIN_COLORS[idx];
        const domainProgress = progress.domains[domain.id];
        const normalUnlockCondition = domainProgress?.unlocked || false;
        const isUnlocked    = devUnlockAll || normalUnlockCondition;
        const hasContent    = domain.topics.length > 0;
        const showComingSoon = !hasContent;

        const topicsDone = domain.topics.length > 0
          ? domain.topics.filter(t => {
              const tp = domainProgress?.topics?.[t];
              return tp && (tp.quizScore || 0) >= 80;
            }).length
          : 0;
        const totalTopics = domain.topics.length;
        const pct = totalTopics > 0 ? topicsDone / totalTopics : 0;

        return (
          <TouchableOpacity
            key={domain.id}
            style={[styles.domainCard, { borderColor: isUnlocked ? colors.border : 'rgba(255,255,255,0.06)' }]}
            onPress={() => isUnlocked && hasContent && navigate('domain', { domainId: domain.id })}
            activeOpacity={isUnlocked && hasContent ? 0.7 : 1}
          >
            {!isUnlocked && (
              <View style={styles.lockOverlay}>
                <Text style={styles.lockIcon}>🔒</Text>
              </View>
            )}

            <View style={[S.row, { marginBottom: 12 }]}>
              <View style={[styles.domainIcon, { backgroundColor: isUnlocked ? colors.dim : 'rgba(255,255,255,0.04)' }]}>
                <Text style={styles.domainIconEmoji}>{domain.icon}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={[S.row, { justifyContent: 'space-between' }]}>
                  <Text style={[styles.domainNum, { color: isUnlocked ? colors.accent : C.textDim }]}>
                    Domain {domain.id}
                  </Text>
                  {showComingSoon && isUnlocked && (
                    <View style={[styles.badge, { backgroundColor: colors.dim, borderColor: colors.border }]}>
                      <Text style={[styles.badgeText, { color: colors.accent }]}>NO CONTENT</Text>
                    </View>
                  )}
                  {!isUnlocked && (
                    <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }]}>
                      <Text style={[styles.badgeText, { color: C.textDim }]}>LOCKED</Text>
                    </View>
                  )}
                  {isUnlocked && hasContent && topicsDone >= totalTopics && totalTopics > 0 && (
                    <View style={[styles.badge, { backgroundColor: C.greenDim, borderColor: C.greenBorder }]}>
                      <Text style={[styles.badgeText, { color: C.green }]}>DONE</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.domainName, { color: isUnlocked ? C.textPrimary : C.textDim }]}>{domain.name}</Text>
                <Text style={[styles.domainSub, { color: isUnlocked ? C.textSec : C.textDim }]}>{domain.subtitle}</Text>
              </View>
            </View>

            <Text style={[styles.domainDesc, { color: isUnlocked ? C.textSec : C.textDim }]}>{domain.description}</Text>

            {isUnlocked && totalTopics > 0 && (
              <View style={{ marginTop: 12 }}>
                <View style={[S.row, { justifyContent: 'space-between', marginBottom: 6 }]}>
                  <Text style={[styles.progressLabel, { color: colors.accent }]}>
                    {topicsDone}/{totalTopics} topics passed
                  </Text>
                  <Text style={[styles.progressLabel, { color: colors.accent }]}>{Math.round(pct * 100)}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${Math.round(pct * 100)}%`, backgroundColor: colors.accent }]} />
                </View>
              </View>
            )}

            {isUnlocked && hasContent && (
              <TouchableOpacity
                style={[styles.startBtn, { backgroundColor: colors.dim, borderColor: colors.border }]}
                onPress={() => navigate('domain', { domainId: domain.id })}
              >
                <Text style={[styles.startBtnText, { color: colors.accent }]}>
                  {topicsDone > 0 ? 'CONTINUE ›' : 'START TRAINING ›'}
                </Text>
              </TouchableOpacity>
            )}

            {!isUnlocked && (
              <View style={styles.unlockHint}>
                <Text style={styles.unlockHintText}>Pass Domain {domain.id - 1} to unlock</Text>
              </View>
            )}
            {isUnlocked && !hasContent && (
              <View style={styles.unlockHint}>
                <Text style={styles.unlockHintText}>Content not added yet</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      {/* ── NET+ FINAL EXAM ── */}
      <Text style={styles.sectionLabel}>NET+ FINAL EXAM</Text>

      {finalExamUnlocked ? (
        <TouchableOpacity
          style={styles.finalExamCard}
          onPress={() => navigate('final-exam')}
          activeOpacity={0.8}
        >
          <View style={styles.finalExamLeft}>
            <Text style={styles.finalExamIcon}>🎓</Text>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.finalExamTitle}>Network+ Final Exam</Text>
              <Text style={styles.finalExamSub}>90 questions  ·  90 minute timer  ·  Need 80% to pass</Text>
            </View>
          </View>
          <View style={styles.finalExamBadge}>
            <Text style={styles.finalExamBadgeText}>START →</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={[styles.finalExamCard, styles.finalExamLocked]}>
          <View style={styles.finalExamLeft}>
            <Text style={styles.finalExamIcon}>🔒</Text>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.finalExamTitle, { color: C.textDim }]}>Network+ Final Exam</Text>
              <Text style={[styles.finalExamSub, { color: C.textDim }]}>Pass all Domain 1 topics at 80%+ to unlock</Text>
            </View>
          </View>
          <View style={styles.finalExamProgress}>
            <Text style={styles.finalExamProgressText}>
              {DOMAIN1_TOPIC_IDS.filter(t => (domain1?.topics?.[t]?.quizScore || 0) >= 80).length}/4
            </Text>
            <Text style={styles.finalExamProgressLabel}>TOPICS</Text>
          </View>
        </View>
      )}

      {/* ── SEC+ COMING SOON ── */}
      <Text style={[styles.sectionLabel, { marginTop: 8 }]}>COMING SOON</Text>
      <View style={styles.secCard}>
        <View style={styles.secHeader}>
          <Text style={styles.secIcon}>🛡️</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.secTitle}>SEC+ Content</Text>
            <Text style={styles.secSub}>CompTIA Security+ Training</Text>
          </View>
          <View style={styles.secBadge}>
            <Text style={styles.secBadgeText}>SOON</Text>
          </View>
        </View>
        <Text style={styles.secDesc}>
          Threats & Attacks · Cryptography · Identity & Access · PKI · Network Security · Compliance
        </Text>
        <Text style={styles.secNote}>
          We're focused on getting you through Net+ first. SEC+ drops once this cert is locked in. 💪
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bgDeep },
  content: { paddingHorizontal: 16, paddingTop: 56, paddingBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  logo: { fontSize: 26, fontWeight: '900', color: C.textPrimary, letterSpacing: -0.5 },
  logoPlus: { color: C.cyan },
  logoSub: { fontSize: 11, color: C.textDim, letterSpacing: 0.5, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  introToggle: {
    paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)', backgroundColor: C.bgCard,
  },
  introToggleOn: { borderColor: C.cyanBorder, backgroundColor: C.cyanDim },
  introToggleText: { fontSize: 10, fontWeight: '700', color: C.textDim, letterSpacing: 0.5 },
  resetToggle: { borderColor: C.redBorder, backgroundColor: C.redDim },
  resetToggleText: { color: C.red },
  notesBtn: { width: 44, height: 44, backgroundColor: C.bgCard, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  notesBtnIcon: { fontSize: 20 },
  notesBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: C.red, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  notesBadgeText: { fontSize: 9, color: '#fff', fontWeight: '800' },
  xpCard: { backgroundColor: C.bgCard, borderRadius: 14, borderWidth: 1, borderColor: C.cyanBorder, padding: 16, marginBottom: 12 },
  levelBadge: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.cyanDim, borderWidth: 1.5, borderColor: C.cyan, alignItems: 'center', justifyContent: 'center' },
  levelNum: { fontSize: 20, fontWeight: '800', color: C.cyan },
  levelLabel: { fontSize: 10, fontWeight: '700', color: C.cyan, letterSpacing: 1 },
  xpText: { fontSize: 13, color: C.textSec, marginTop: 1 },
  totalXP: { fontSize: 18, fontWeight: '800', color: C.cyan },
  totalLabel: { fontSize: 9, color: C.textDim, letterSpacing: 1, fontWeight: '700' },
  xpTrack: { height: 8, backgroundColor: C.bgElevated, borderRadius: 99, overflow: 'hidden' },
  xpFill: { height: '100%', backgroundColor: C.cyan, borderRadius: 99 },
  xpSub: { fontSize: 11, color: C.textDim },
  tipCard: { backgroundColor: C.bgCard, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)', padding: 16, marginBottom: 12 },
  tipIcon: { fontSize: 18, marginRight: 8 },
  tipLabel: { fontSize: 10, fontWeight: '800', color: C.amber, letterSpacing: 1.5 },
  tipText: { fontSize: 14, color: C.textSec, lineHeight: 21 },
  dailyCard: { backgroundColor: C.bgCard, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(124,58,237,0.3)', padding: 16, marginBottom: 20, flexDirection: 'row', alignItems: 'center' },
  dailyDone: { borderColor: 'rgba(16,185,129,0.3)' },
  dailyIcon: { fontSize: 22, marginRight: 10 },
  dailyTitle: { fontSize: 16, fontWeight: '700', color: C.textPrimary },
  dailySub: { fontSize: 13, color: C.textSec, marginTop: 2 },
  dailyArrow: { width: 32, height: 32, backgroundColor: C.purpleDim, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  dailyArrowText: { fontSize: 22, color: C.purple, fontWeight: '700', lineHeight: 26 },
  resumeCard: { backgroundColor: C.bgCard, borderRadius: 14, borderWidth: 1, borderColor: C.greenBorder, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  resumeIcon: { fontSize: 22, marginRight: 10, color: C.green },
  resumeTitle: { fontSize: 16, fontWeight: '700', color: C.textPrimary },
  resumeSub: { fontSize: 13, color: C.textSec, marginTop: 2 },
  resumeArrow: { width: 32, height: 32, backgroundColor: C.greenDim, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  resumeArrowText: { fontSize: 22, color: C.green, fontWeight: '700', lineHeight: 26 },
  weakCard: { backgroundColor: C.bgCard, borderRadius: 14, borderWidth: 1, borderColor: C.amberBorder, padding: 16, marginBottom: 20, flexDirection: 'row', alignItems: 'center' },
  weakIcon: { fontSize: 22, marginRight: 10 },
  weakTitle: { fontSize: 16, fontWeight: '700', color: C.textPrimary },
  weakSub: { fontSize: 13, color: C.textSec, marginTop: 2 },
  weakArrow: { width: 32, height: 32, backgroundColor: C.amberDim, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  weakArrowText: { fontSize: 22, color: C.amber, fontWeight: '700', lineHeight: 26 },
  sectionLabel: { fontSize: 10, fontWeight: '800', color: C.textDim, letterSpacing: 1.5, marginBottom: 12 },
  domainCard: { backgroundColor: C.bgCard, borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12, overflow: 'hidden' },
  lockOverlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(6,6,15,0.5)', alignItems: 'flex-start', justifyContent: 'flex-end', padding: 16, zIndex: 1 },
  lockIcon: { fontSize: 28 },
  domainIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  domainIconEmoji: { fontSize: 24 },
  domainNum: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  domainName: { fontSize: 16, fontWeight: '700', marginTop: 2 },
  domainSub: { fontSize: 11, marginTop: 2 },
  domainDesc: { fontSize: 13, lineHeight: 19 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  badgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  progressLabel: { fontSize: 11, fontWeight: '700' },
  progressTrack: { height: 4, backgroundColor: C.bgElevated, borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 99 },
  startBtn: { marginTop: 14, padding: 10, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  startBtnText: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  unlockHint: { marginTop: 12, padding: 8, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 8, alignItems: 'center' },
  unlockHintText: { fontSize: 12, color: C.textDim },
  // Final exam
  finalExamCard: { backgroundColor: C.bgCard, borderRadius: 16, borderWidth: 1.5, borderColor: C.cyanBorder, padding: 16, marginBottom: 20 },
  finalExamLocked: { borderColor: 'rgba(255,255,255,0.08)', opacity: 0.7 },
  finalExamLeft: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  finalExamIcon: { fontSize: 36 },
  finalExamTitle: { fontSize: 17, fontWeight: '800', color: C.textPrimary, marginBottom: 4 },
  finalExamSub: { fontSize: 12, color: C.textSec },
  finalExamBadge: { backgroundColor: C.cyan, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  finalExamBadgeText: { fontSize: 13, fontWeight: '900', color: '#000' },
  finalExamProgress: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center' },
  finalExamProgressText: { fontSize: 18, fontWeight: '800', color: C.textDim },
  finalExamProgressLabel: { fontSize: 9, fontWeight: '700', color: C.textDim, letterSpacing: 1 },
  // SEC+
  secCard: { backgroundColor: C.bgCard, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 16, marginBottom: 12, opacity: 0.75 },
  secHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  secIcon: { fontSize: 32 },
  secTitle: { fontSize: 16, fontWeight: '700', color: C.textPrimary },
  secSub: { fontSize: 11, color: C.textSec, marginTop: 2 },
  secBadge: { backgroundColor: 'rgba(124,58,237,0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(124,58,237,0.3)' },
  secBadgeText: { fontSize: 9, fontWeight: '800', color: C.purple, letterSpacing: 1 },
  secDesc: { fontSize: 13, color: C.textSec, lineHeight: 20, marginBottom: 8 },
  secNote: { fontSize: 12, color: C.textDim, lineHeight: 18, fontStyle: 'italic' },
});
