import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { C, S, MONO } from '../theme';
import { getTopic } from '../data/domainContent';

export default function LessonView({ domainId, topicId, lessonIndex, progress, completeLesson, navigate }) {
  const topic = getTopic(domainId, topicId);
  const lesson = topic.lessons[lessonIndex];
  const [promptAnswered, setPromptAnswered] = useState({});
  const [showXP, setShowXP] = useState(false);
  const nextTimerRef = useRef(null);

  const sections = lesson.sections;
  const isLastLesson = lessonIndex === topic.lessons.length - 1;
  const promptIndexes = sections
    .map((section, index) => section.type === 'prompt' ? index : null)
    .filter(index => index !== null);

  useEffect(() => {
    setPromptAnswered({});
    setShowXP(false);
    return () => clearTimeout(nextTimerRef.current);
  }, [domainId, topicId, lessonIndex]);

  const handlePromptSelect = (sectionIndex, optIdx) => {
    if (promptAnswered[sectionIndex]) return;
    const section = sections[sectionIndex];
    const correct = optIdx === section.correct;
    setPromptAnswered(prev => ({
      ...prev,
      [sectionIndex]: { selected: optIdx, correct },
    }));
  };

  const handleNext = () => {
    completeLesson(domainId, topicId, lesson.id, lesson.xp);

    const nextIdx = lessonIndex + 1;
    if (nextIdx < topic.lessons.length) {
      navigate('lesson', { domainId, topicId, lessonIndex: nextIdx });
    } else {
      setShowXP(true);
      nextTimerRef.current = setTimeout(() => {
        navigate('domain', { domainId });
      }, 1500);
    }
  };

  const handlePrev = () => {
    if (lessonIndex > 0) {
      navigate('lesson', { domainId, topicId, lessonIndex: lessonIndex - 1 });
    }
  };

  const canProceed = promptIndexes.every(index => promptAnswered[index]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('domain', { domainId })} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text style={[styles.topicLabel, { color: topic.color }]}>{topic.name}</Text>
          <Text style={styles.lessonTitle} numberOfLines={1}>{lesson.title}</Text>
        </View>
        <View style={styles.xpPill}>
          <Text style={styles.xpPillText}>+{lesson.xp} XP</Text>
        </View>
      </View>

      {/* Progress dots */}
      <View style={styles.dotsRow}>
        {topic.lessons.map((_, i) => (
          <View key={i} style={[styles.dot, i <= lessonIndex && { backgroundColor: topic.color }]} />
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* XP pop */}
        {showXP && (
          <View style={styles.xpPop}>
            <Text style={styles.xpPopText}>+{lesson.xp} XP Earned! 🎉</Text>
          </View>
        )}

        {sections.map((section, index) => (
          <SectionRenderer
            key={index}
            section={section}
            topicColor={topic.color}
            promptAnswered={promptAnswered[index]}
            onPromptSelect={(optIdx) => handlePromptSelect(index, optIdx)}
          />
        ))}
      </ScrollView>

      {/* Footer Nav */}
      <View style={styles.footer}>
        {lessonIndex > 0 && (
          <TouchableOpacity style={styles.prevBtn} onPress={handlePrev}>
            <Text style={styles.prevBtnText}>‹ PREV</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextBtn, !canProceed && styles.nextBtnDisabled, { backgroundColor: topic.color }]}
          onPress={handleNext}
          disabled={!canProceed}
        >
          <Text style={styles.nextBtnText}>
            {isLastLesson ? 'COMPLETE ✓' : 'NEXT LESSON ›'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SectionRenderer({ section, topicColor, promptAnswered, onPromptSelect }) {
  switch (section.type) {
    case 'text':
      return (
        <View style={styles.textBlock}>
          <Text style={styles.bodyText}>{section.content}</Text>
        </View>
      );

    case 'mnemonic':
      return (
        <View style={[styles.mnemonicCard, { borderColor: topicColor + '55' }]}>
          <Text style={[styles.mnemonicLabel, { color: topicColor }]}>{section.label}</Text>
          <Text style={[styles.mnemonicMain, { color: topicColor, fontFamily: MONO }]}>{section.content}</Text>
          {section.sub && <Text style={styles.mnemonicSub}>{section.sub}</Text>}
        </View>
      );

    case 'callout':
      return (
        <View style={[styles.calloutCard, { borderColor: topicColor + '44' }]}>
          <Text style={[styles.calloutLabel, { color: topicColor }]}>{section.label}</Text>
          <Text style={[styles.calloutText, { fontFamily: section.label?.includes('FORMULA') || section.label?.includes('EXAMPLE') || section.label?.includes('TRICK') ? MONO : undefined }]}>
            {section.content}
          </Text>
        </View>
      );

    case 'table':
      return (
        <View style={styles.tableWrap}>
          {/* Header row */}
          <View style={[styles.tableRow, styles.tableHeader, { backgroundColor: topicColor + '22' }]}>
            {section.headers.map((h, i) => (
              <Text key={i} style={[styles.tableHeaderCell, { color: topicColor }]}>{h}</Text>
            ))}
          </View>
          {section.rows.map((row, ri) => (
            <View key={ri} style={[styles.tableRow, ri % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd]}>
              {row.map((cell, ci) => (
                <Text key={ci} style={[styles.tableCell, ci === 0 && { fontFamily: MONO, color: topicColor, fontWeight: '700' }]}>
                  {cell}
                </Text>
              ))}
            </View>
          ))}
        </View>
      );

    case 'prompt':
      return (
        <View style={styles.promptCard}>
          <View style={[styles.promptHeader, { backgroundColor: topicColor + '15' }]}>
            <Text style={[styles.promptLabel, { color: topicColor }]}>⚡ QUICK CHECK</Text>
          </View>
          <Text style={styles.promptQuestion}>{section.question}</Text>
          <View style={styles.promptOptions}>
            {section.options.map((opt, i) => {
              const selected = promptAnswered?.selected === i;
              const isCorrect = i === section.correct;
              let bg = C.bgElevated;
              let border = C.border;
              let textColor = C.textPrimary;
              if (promptAnswered) {
                if (isCorrect) { bg = 'rgba(16,185,129,0.15)'; border = C.green; textColor = C.green; }
                else if (selected) { bg = 'rgba(239,68,68,0.15)'; border = C.red; textColor = C.red; }
              } else if (selected) {
                bg = topicColor + '22'; border = topicColor; textColor = topicColor;
              }
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.promptOpt, { backgroundColor: bg, borderColor: border }]}
                  onPress={() => onPromptSelect(i)}
                  disabled={!!promptAnswered}
                >
                  <View style={[styles.optLetter, { borderColor: border }]}>
                    <Text style={[styles.optLetterText, { color: border }]}>{['A','B','C','D'][i]}</Text>
                  </View>
                  <Text style={[styles.optText, { color: textColor }]}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {promptAnswered && (
            <View style={[styles.explanationBox, { borderColor: promptAnswered.correct ? C.green : C.red }]}>
              <Text style={[styles.explanationLabel, { color: promptAnswered.correct ? C.green : C.red }]}>
                {promptAnswered.correct ? '✓ CORRECT' : '✗ INCORRECT'}
              </Text>
              <Text style={styles.explanationText}>{section.explanation}</Text>
            </View>
          )}
        </View>
      );

    default:
      return null;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bgDeep },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: C.bgCard, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 28, color: C.textSec, lineHeight: 32 },
  topicLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 2 },
  lessonTitle: { fontSize: 15, fontWeight: '700', color: C.textPrimary },
  xpPill: { backgroundColor: 'rgba(245,158,11,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)' },
  xpPillText: { fontSize: 12, fontWeight: '800', color: C.amber },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 12, backgroundColor: C.bgCard, borderBottomWidth: 1, borderBottomColor: C.border },
  dot: { width: 8, height: 8, borderRadius: 99, backgroundColor: C.bgElevated },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 30 },
  xpPop: { backgroundColor: 'rgba(16,185,129,0.15)', borderRadius: 12, padding: 14, marginBottom: 16, alignItems: 'center', borderWidth: 1, borderColor: C.greenBorder },
  xpPopText: { fontSize: 18, fontWeight: '800', color: C.green },
  textBlock: { marginBottom: 16 },
  bodyText: { fontSize: 15, color: C.textPrimary, lineHeight: 26 },
  mnemonicCard: { backgroundColor: C.bgCard, borderRadius: 14, borderWidth: 1.5, padding: 16, marginBottom: 16 },
  mnemonicLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 8 },
  mnemonicMain: { fontSize: 17, fontWeight: '700', marginBottom: 8, lineHeight: 24 },
  mnemonicSub: { fontSize: 12, color: C.textSec, lineHeight: 20 },
  calloutCard: { backgroundColor: C.bgCard, borderRadius: 14, borderWidth: 1.5, padding: 16, marginBottom: 16 },
  calloutLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 8 },
  calloutText: { fontSize: 13, color: C.textSec, lineHeight: 22 },
  tableWrap: { backgroundColor: C.bgCard, borderRadius: 12, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: C.border },
  tableRow: { flexDirection: 'row' },
  tableHeader: { paddingVertical: 8 },
  tableHeaderCell: { flex: 1, fontSize: 10, fontWeight: '800', letterSpacing: 0.8, paddingHorizontal: 8 },
  tableRowEven: { backgroundColor: 'transparent' },
  tableRowOdd: { backgroundColor: 'rgba(255,255,255,0.02)' },
  tableCell: { flex: 1, fontSize: 12, color: C.textSec, paddingHorizontal: 8, paddingVertical: 7, lineHeight: 18 },
  promptCard: { backgroundColor: C.bgCard, borderRadius: 14, borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginBottom: 16 },
  promptHeader: { padding: 10, paddingHorizontal: 14 },
  promptLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  promptQuestion: { fontSize: 16, fontWeight: '600', color: C.textPrimary, padding: 14, lineHeight: 24 },
  promptOptions: { paddingHorizontal: 12, paddingBottom: 12, gap: 8 },
  promptOpt: { flexDirection: 'row', alignItems: 'flex-start', padding: 12, borderRadius: 10, borderWidth: 1.5, gap: 10 },
  optLetter: { width: 28, height: 28, borderRadius: 8, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  optLetterText: { fontSize: 12, fontWeight: '800' },
  optText: { fontSize: 14, lineHeight: 22, flex: 1 },
  explanationBox: { margin: 12, padding: 12, borderRadius: 10, borderWidth: 1.5, backgroundColor: 'rgba(255,255,255,0.03)' },
  explanationLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 6 },
  explanationText: { fontSize: 13, color: C.textSec, lineHeight: 20 },
  footer: { flexDirection: 'row', padding: 16, paddingBottom: 32, gap: 10, backgroundColor: C.bgCard, borderTopWidth: 1, borderTopColor: C.border },
  prevBtn: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12, backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border },
  prevBtnText: { fontSize: 13, fontWeight: '700', color: C.textSec },
  nextBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { fontSize: 14, fontWeight: '800', color: '#000', letterSpacing: 0.5 },
});
