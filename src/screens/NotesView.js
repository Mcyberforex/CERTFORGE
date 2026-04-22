import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { C } from '../theme';
import { TOPIC_LABELS } from '../data/domainContent';


export default function NotesView({ progress, masterNote, navigate }) {
  const [filter, setFilter] = useState('active'); // 'active' | 'mastered'

  const notes = progress.notes.filter(n => filter === 'active' ? !n.mastered : n.mastered);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigate('dashboard')}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text style={styles.title}>Study Notes</Text>
          <Text style={styles.sub}>{progress.notes.filter(n => !n.mastered).length} active · {progress.notes.filter(n => n.mastered).length} mastered</Text>
        </View>
      </View>

      {/* Filter tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, filter === 'active' && styles.tabActive]} onPress={() => setFilter('active')}>
          <Text style={[styles.tabText, filter === 'active' && styles.tabTextActive]}>
            MISSED ({progress.notes.filter(n => !n.mastered).length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, filter === 'mastered' && styles.tabActive]} onPress={() => setFilter('mastered')}>
          <Text style={[styles.tabText, filter === 'mastered' && styles.tabTextActive]}>
            MASTERED ({progress.notes.filter(n => n.mastered).length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {notes.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>{filter === 'active' ? '🎉' : '📋'}</Text>
            <Text style={styles.emptyTitle}>
              {filter === 'active' ? 'No active notes!' : 'No mastered notes yet'}
            </Text>
            <Text style={styles.emptySub}>
              {filter === 'active'
                ? 'When you miss a quiz question, it\'s automatically saved here.'
                : 'Mark notes as mastered after reviewing them.'}
            </Text>
          </View>
        )}

        {notes.map(note => (
          <View key={note.id} style={[styles.noteCard, note.mastered && styles.noteCardMastered]}>
            <View style={styles.noteHeader}>
              <View style={styles.topicTag}>
                <Text style={styles.topicTagText}>{TOPIC_LABELS[note.topicId] || note.topicId}</Text>
              </View>
              {!note.mastered && (
                <TouchableOpacity style={styles.masterBtn} onPress={() => masterNote(note.id)}>
                  <Text style={styles.masterBtnText}>GOT IT ✓</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.noteQuestion}>{note.question}</Text>

            <View style={styles.answerRow}>
              <View style={styles.wrongAnswer}>
                <Text style={styles.answerLabel}>YOUR ANSWER</Text>
                <Text style={styles.wrongAnswerText}>{note.yourAnswer}</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
              <View style={styles.correctAnswer}>
                <Text style={styles.answerLabel}>CORRECT</Text>
                <Text style={styles.correctAnswerText}>{note.correctAnswer}</Text>
              </View>
            </View>

            <View style={styles.explanationBox}>
              <Text style={styles.explanationText}>{note.explanation}</Text>
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  tabs: { flexDirection: 'row', backgroundColor: C.bgCard, borderBottomWidth: 1, borderBottomColor: C.border },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: C.amber },
  tabText: { fontSize: 11, fontWeight: '700', color: C.textDim, letterSpacing: 1 },
  tabTextActive: { color: C.amber },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: C.textPrimary, marginBottom: 8 },
  emptySub: { fontSize: 14, color: C.textSec, textAlign: 'center', lineHeight: 22 },
  noteCard: { backgroundColor: C.bgCard, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 12 },
  noteCardMastered: { opacity: 0.6, borderColor: 'rgba(16,185,129,0.2)' },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  topicTag: { backgroundColor: C.bgElevated, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  topicTagText: { fontSize: 11, color: C.textSec, fontWeight: '600' },
  masterBtn: { backgroundColor: 'rgba(16,185,129,0.15)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  masterBtnText: { fontSize: 11, fontWeight: '800', color: C.green },
  noteQuestion: { fontSize: 14, fontWeight: '600', color: C.textPrimary, lineHeight: 21, marginBottom: 12 },
  answerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 8 },
  wrongAnswer: { flex: 1, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: C.red + '44' },
  correctAnswer: { flex: 1, backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: C.green + '44' },
  answerLabel: { fontSize: 9, fontWeight: '800', color: C.textDim, letterSpacing: 1, marginBottom: 4 },
  wrongAnswerText: { fontSize: 12, color: C.red, fontWeight: '600', lineHeight: 18 },
  correctAnswerText: { fontSize: 12, color: C.green, fontWeight: '600', lineHeight: 18 },
  arrow: { fontSize: 18, color: C.textDim, alignSelf: 'center' },
  explanationBox: { backgroundColor: C.bgElevated, borderRadius: 8, padding: 10, borderLeftWidth: 2, borderLeftColor: C.cyan },
  explanationText: { fontSize: 12, color: C.textSec, lineHeight: 19 },
});
