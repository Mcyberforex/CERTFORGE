import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { C, MONO } from '../theme';
import { getTopic } from '../data/domainContent';

const PBQ_TYPE_LABELS = { order: 'Ordering', match: 'Matching', scenario: 'Scenario' };
const PBQ_TYPE_ICONS  = { order: '↕️', match: '🔗', scenario: '📋' };

export default function PBQView({ domainId, topicId, completePBQ, navigate }) {
  const topic = getTopic(domainId, topicId);
  const pbqs  = topic.pbqs;
  const [selected, setSelected] = useState(null);

  if (selected !== null) {
    const pbq    = pbqs[selected];
    const onBack = () => setSelected(null);
    if (pbq.type === 'order')   return <OrderPBQ    pbq={pbq} topic={topic} domainId={domainId} topicId={topicId} completePBQ={completePBQ} navigate={navigate} onBack={onBack} />;
    if (pbq.type === 'match')   return <MatchPBQ    pbq={pbq} topic={topic} domainId={domainId} topicId={topicId} completePBQ={completePBQ} navigate={navigate} onBack={onBack} />;
    return                             <ScenarioPBQ pbq={pbq} topic={topic} domainId={domainId} topicId={topicId} completePBQ={completePBQ} navigate={navigate} onBack={onBack} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('domain', { domainId })} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text style={[styles.pbqLabel, { color: topic.color }]}>🎯 PBQs — {topic.name}</Text>
          <Text style={styles.pbqTitle}>Performance-Based Questions</Text>
        </View>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.instrBox, { borderColor: topic.color + '33' }]}>
          <Text style={[styles.instrText, { color: topic.color }]}>
            📌 PBQs simulate real exam tasks. Each one tests hands-on understanding. Tap a challenge below to begin.
          </Text>
        </View>
        {pbqs.map((pbq, i) => (
          <TouchableOpacity
            key={pbq.id}
            style={[styles.pbqCard, { borderColor: topic.color + '44' }]}
            onPress={() => setSelected(i)}
            activeOpacity={0.75}
          >
            <View style={[styles.pbqCardIcon, { backgroundColor: topic.color + '22' }]}>
              <Text style={{ fontSize: 26 }}>{PBQ_TYPE_ICONS[pbq.type]}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.pbqCardTitle, { color: topic.color }]}>{pbq.title}</Text>
              <Text style={styles.pbqCardMeta}>{PBQ_TYPE_LABELS[pbq.type]}  ·  +{pbq.xp} XP</Text>
            </View>
            <Text style={[styles.pbqCardArrow, { color: topic.color }]}>›</Text>
          </TouchableOpacity>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

/* ─────────────────────────────────────────────────────────
   MATCH PBQ — tap left to select, tap right to assign
───────────────────────────────────────────────────────── */
function MatchPBQ({ pbq, topic, domainId, topicId, completePBQ, navigate, onBack }) {
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [matches,      setMatches]      = useState({}); // leftId → rightId
  const [submitted,    setSubmitted]    = useState(false);
  const [score,        setScore]        = useState(null);

  const getRightLabel = (rightId) =>
    rightId ? (pbq.rightItems.find(r => r.id === rightId)?.label || '') : '';

  const handleTapLeft = (item) => {
    if (submitted) return;
    if (selectedLeft === item.id) {
      // Deselect
      setSelectedLeft(null);
    } else {
      // Unlink any existing match for this left item, then select it
      if (matches[item.id]) {
        setMatches(m => { const n = { ...m }; delete n[item.id]; return n; });
      }
      setSelectedLeft(item.id);
    }
  };

  const handleTapRight = (item) => {
    if (submitted || !selectedLeft) return;
    setMatches(m => ({ ...m, [selectedLeft]: item.id }));
    setSelectedLeft(null);
  };

  const handleSubmit = () => {
    const total = Object.keys(pbq.correctMatches).length;
    let correct = 0;
    Object.entries(matches).forEach(([leftId, rightId]) => {
      if (pbq.correctMatches[leftId] === rightId) correct++;
    });
    const pct = Math.round((correct / total) * 100);
    setScore({ correct, total, pct });
    setSubmitted(true);
    if (pct >= 70) completePBQ(domainId, topicId, pbq.xp);
  };

  const allMatched  = Object.keys(matches).length === pbq.leftItems.length;
  const selectedLabel = selectedLeft ? pbq.leftItems.find(i => i.id === selectedLeft)?.label : null;

  return (
    <PBQShell topic={topic} pbq={pbq} domainId={domainId} navigate={navigate} onBack={onBack}>

      {/* Context hint bar */}
      {!submitted && (
        <View style={[styles.hintBar, {
          borderColor: topic.color + '44',
          backgroundColor: selectedLeft ? topic.color + '18' : topic.color + '0d',
        }]}>
          <Text style={[styles.hintBarText, { color: topic.color }]}>
            {selectedLeft
              ? `✦  "${selectedLabel}" selected — tap a target on the right`
              : '① Tap an item on the LEFT   →   ② Tap its match on the RIGHT'}
          </Text>
        </View>
      )}

      <View style={styles.matchGrid}>
        {/* ── Left column ── */}
        <View style={{ flex: 1 }}>
          <Text style={styles.colLabel}>ITEMS</Text>
          {pbq.leftItems.map(item => {
            const isSel     = selectedLeft === item.id;
            const isMatched = !!matches[item.id];
            const rightId   = matches[item.id];
            const isCorrect = submitted && pbq.correctMatches[item.id] === rightId;
            const isWrong   = submitted && isMatched && !isCorrect;

            const borderColor = submitted
              ? (isCorrect ? C.green : isWrong ? C.red : C.border)
              : isSel ? topic.color : isMatched ? topic.color + '77' : C.border;

            const bgColor = submitted
              ? (isCorrect ? 'rgba(16,185,129,0.1)' : isWrong ? 'rgba(239,68,68,0.12)' : C.bgCard)
              : isSel ? topic.color + '22' : isMatched ? topic.color + '0d' : C.bgCard;

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleTapLeft(item)}
                disabled={submitted}
                activeOpacity={0.7}
                style={[styles.matchItemLeft, { borderColor, backgroundColor: bgColor,
                  transform: [{ scale: isSel ? 1.025 : 1 }],
                }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.matchItemText, {
                    color: submitted
                      ? (isCorrect ? C.green : isWrong ? C.red : C.textDim)
                      : isSel ? topic.color : C.textPrimary,
                  }]}>
                    {item.label}
                  </Text>

                  {/* Match tag — shows when matched but not yet submitted */}
                  {!submitted && isMatched && (
                    <Text style={[styles.matchTag, { color: topic.color + 'bb' }]} numberOfLines={1}>
                      → {getRightLabel(rightId)}
                    </Text>
                  )}

                  {/* Result tag — shows after submit */}
                  {submitted && isMatched && (
                    <Text style={[styles.matchTag, { color: isCorrect ? C.green : C.red }]} numberOfLines={1}>
                      {isCorrect ? '✓' : '✗'} {getRightLabel(rightId)}
                    </Text>
                  )}

                  {submitted && !isMatched && (
                    <Text style={[styles.matchTag, { color: C.textDim }]}>Not matched</Text>
                  )}
                </View>

                {/* Selection indicator */}
                {isSel && (
                  <View style={[styles.selBadge, { backgroundColor: topic.color }]}>
                    <Text style={styles.selBadgeText}>›</Text>
                  </View>
                )}

                {submitted && isCorrect && <Text style={styles.resultCheck}>✓</Text>}
                {submitted && isWrong   && <Text style={styles.resultWrong}>✗</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Divider ── */}
        <View style={styles.matchDivider} />

        {/* ── Right column ── */}
        <View style={{ flex: 1 }}>
          <Text style={styles.colLabel}>MATCH TO</Text>
          {pbq.rightItems.map(item => {
            const matchedLeftIds = Object.keys(matches).filter(k => matches[k] === item.id);
            const isUsed    = matchedLeftIds.length > 0;
            const isTarget  = !!selectedLeft && !submitted;

            const borderColor = submitted
              ? C.border
              : isTarget ? topic.color + 'aa' : isUsed ? topic.color + '55' : C.border;

            const bgColor = submitted
              ? C.bgCard
              : isTarget ? topic.color + '18' : isUsed ? topic.color + '0a' : C.bgCard;

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleTapRight(item)}
                disabled={submitted || !selectedLeft}
                activeOpacity={selectedLeft ? 0.7 : 1}
                style={[styles.matchItemRight, { borderColor, backgroundColor: bgColor,
                  transform: [{ scale: isTarget ? 1.015 : 1 }],
                }]}
              >
                <Text style={[styles.matchItemText, {
                  color: submitted
                    ? C.textSec
                    : isTarget ? topic.color : isUsed ? C.textPrimary : C.textSec,
                }]}>
                  {item.label}
                </Text>

                {/* Count badge — how many left items are matched to this right item */}
                {isUsed && !submitted && (
                  <View style={[styles.countBadge, { backgroundColor: topic.color }]}>
                    <Text style={styles.countBadgeText}>{matchedLeftIds.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Corrections after submit */}
      {submitted && pbq.leftItems.some(item => {
        const rid = matches[item.id];
        return !rid || pbq.correctMatches[item.id] !== rid;
      }) && (
        <View style={styles.correctionsBox}>
          <Text style={styles.correctionsTitle}>CORRECTIONS</Text>
          {pbq.leftItems.map(item => {
            const rid      = matches[item.id];
            const isWrong  = !rid || pbq.correctMatches[item.id] !== rid;
            if (!isWrong) return null;
            return (
              <Text key={item.id} style={styles.correctionRow}>
                <Text style={{ color: C.red }}>✗ {item.label}</Text>
                <Text style={{ color: C.textDim }}>  →  </Text>
                <Text style={{ color: C.green }}>{getRightLabel(pbq.correctMatches[item.id])}</Text>
              </Text>
            );
          })}
        </View>
      )}

      <ScoreAndButton
        submitted={submitted}
        score={score}
        canSubmit={allMatched}
        topic={topic}
        pbq={pbq}
        domainId={domainId}
        navigate={navigate}
        onSubmit={handleSubmit}
      />
    </PBQShell>
  );
}

/* ─────────────────────────────────────────────────────────
   ORDER PBQ — tap pool item to select, tap slot to place
───────────────────────────────────────────────────────── */
function OrderPBQ({ pbq, topic, domainId, topicId, completePBQ, navigate, onBack }) {
  const slotCount = pbq.correctOrder.length;

  const [board, setBoard]         = useState(() => ({
    slots: new Array(slotCount).fill(null),
    pool:  shuffle([...pbq.items]),
  }));
  const [selectedId, setSelectedId] = useState(null);
  const [submitted,  setSubmitted]  = useState(false);
  const [score,      setScore]      = useState(null);

  const tapPool = (item) => {
    if (submitted) return;
    setSelectedId(prev => prev === item.id ? null : item.id);
  };

  const tapSlot = (slotIdx) => {
    if (submitted) return;

    if (selectedId) {
      // Place the selected pool item into this slot
      const item = board.pool.find(i => i.id === selectedId);
      if (!item) return;
      const displaced = board.slots[slotIdx]; // may be null
      setBoard(prev => {
        const newSlots = [...prev.slots];
        const newPool  = prev.pool.filter(i => i.id !== selectedId);
        newSlots[slotIdx] = item;
        if (displaced) newPool.push(displaced);
        return { slots: newSlots, pool: newPool };
      });
      setSelectedId(null);
    } else {
      // No selection — return slot item to pool
      const item = board.slots[slotIdx];
      if (!item) return;
      setBoard(prev => {
        const newSlots = [...prev.slots];
        newSlots[slotIdx] = null;
        return { slots: newSlots, pool: [...prev.pool, item] };
      });
    }
  };

  const handleSubmit = () => {
    const { slots } = board;
    let correct = 0;
    slots.forEach((item, i) => { if (item && item.id === pbq.correctOrder[i]) correct++; });
    const pct = Math.round((correct / slotCount) * 100);
    setScore({ correct, total: slotCount, pct });
    setSubmitted(true);
    if (pct >= 70) completePBQ(domainId, topicId, pbq.xp);
  };

  const { slots, pool } = board;
  const filledSlots     = slots.filter(Boolean).length;
  const selectedLabel   = selectedId ? pool.find(i => i.id === selectedId)?.label : null;

  return (
    <PBQShell topic={topic} pbq={pbq} domainId={domainId} navigate={navigate} onBack={onBack}>

      {/* Context hint bar */}
      {!submitted && (
        <View style={[styles.hintBar, {
          borderColor: topic.color + '44',
          backgroundColor: selectedId ? topic.color + '18' : topic.color + '0d',
        }]}>
          <Text style={[styles.hintBarText, { color: topic.color }]}>
            {selectedId
              ? `✦  "${selectedLabel}" selected — tap a numbered slot to place it`
              : '① Tap an item from the pool below   →   ② Tap a slot to place it'}
          </Text>
        </View>
      )}

      {/* Ordered slots */}
      <Text style={styles.zoneLabel}>YOUR ORDER</Text>
      <View style={styles.orderedZone}>
        {pbq.correctOrder.map((correctId, slotIdx) => {
          const item      = slots[slotIdx];
          const isCorrect = submitted && item && item.id === correctId;
          const isWrong   = submitted && item && item.id !== correctId;
          const isTarget  = !!selectedId && !submitted;

          const borderColor = submitted
            ? (item ? (isCorrect ? C.green : C.red) : C.border)
            : item ? topic.color + '77' : isTarget ? topic.color : C.border;

          const bgColor = submitted
            ? (isCorrect ? 'rgba(16,185,129,0.1)' : isWrong ? 'rgba(239,68,68,0.12)' : 'transparent')
            : item ? topic.color + '0d' : isTarget ? topic.color + '18' : 'transparent';

          return (
            <TouchableOpacity
              key={slotIdx}
              onPress={() => tapSlot(slotIdx)}
              disabled={submitted && !item}
              activeOpacity={0.75}
              style={[styles.slot, { borderColor, backgroundColor: bgColor,
                borderStyle: !item ? 'dashed' : 'solid',
              }]}
            >
              {/* Slot number badge */}
              <View style={[styles.slotNum, {
                backgroundColor: submitted
                  ? (isCorrect ? 'rgba(16,185,129,0.2)' : isWrong ? 'rgba(239,68,68,0.2)' : C.bgElevated)
                  : topic.color + '22',
              }]}>
                <Text style={[styles.slotNumText, {
                  color: submitted
                    ? (isCorrect ? C.green : isWrong ? C.red : C.textDim)
                    : topic.color,
                  fontFamily: MONO,
                }]}>
                  {slotIdx + 1}
                </Text>
              </View>

              {/* Slot content */}
              <View style={{ flex: 1 }}>
                {item ? (
                  <>
                    <Text style={[styles.itemLabel, {
                      color: submitted ? (isCorrect ? C.green : C.red) : C.textPrimary,
                    }]}>
                      {item.label}
                    </Text>
                    {item.sublabel ? (
                      <Text style={styles.itemSublabel}>{item.sublabel}</Text>
                    ) : null}
                    {submitted && isWrong && (
                      <Text style={styles.correctHint}>
                        ✓ {pbq.items.find(i => i.id === correctId)?.label}
                      </Text>
                    )}
                  </>
                ) : (
                  <Text style={[styles.emptySlot, { color: isTarget ? topic.color : C.textDim }]}>
                    {isTarget ? 'Tap to place here →' : 'Empty slot'}
                  </Text>
                )}
              </View>

              {/* Right-side indicators */}
              {item && !submitted && (
                <Text style={styles.removeHint}>✕</Text>
              )}
              {submitted && isCorrect && <Text style={styles.resultCheck}>✓</Text>}
              {submitted && isWrong   && <Text style={styles.resultWrong}>✗</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Pool */}
      {pool.length > 0 && !submitted && (
        <>
          <Text style={[styles.zoneLabel, { marginTop: 18 }]}>ITEM POOL</Text>
          <View style={styles.pool}>
            {pool.map(item => {
              const isSel = selectedId === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => tapPool(item)}
                  activeOpacity={0.7}
                  style={[styles.poolItem, {
                    borderColor: isSel ? topic.color : topic.color + '44',
                    backgroundColor: isSel ? topic.color + '22' : topic.color + '0d',
                    transform: [{ scale: isSel ? 1.02 : 1 }],
                  }]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.poolItemLabel, {
                      color: isSel ? topic.color : C.textPrimary,
                    }]}>
                      {item.label}
                    </Text>
                    {item.sublabel ? (
                      <Text style={styles.poolItemSub}>{item.sublabel}</Text>
                    ) : null}
                  </View>
                  {isSel && (
                    <View style={[styles.selBadge, { backgroundColor: topic.color }]}>
                      <Text style={styles.selBadgeText}>SELECTED</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      <ScoreAndButton
        submitted={submitted}
        score={score}
        canSubmit={filledSlots >= slotCount}
        topic={topic}
        pbq={pbq}
        domainId={domainId}
        navigate={navigate}
        onSubmit={handleSubmit}
      />
    </PBQShell>
  );
}

/* ─────────────────────────────────────────────────────────
   SCENARIO PBQ — tap-based multi-question
───────────────────────────────────────────────────────── */
function ScenarioPBQ({ pbq, topic, domainId, topicId, completePBQ, navigate, onBack }) {
  const [answers,   setAnswers]   = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score,     setScore]     = useState(null);

  const handleSelect = (qIdx, optIdx) => {
    if (submitted) return;
    setAnswers(a => ({ ...a, [qIdx]: optIdx }));
  };

  const handleSubmit = () => {
    let correct = 0;
    pbq.questions.forEach((q, i) => { if (answers[i] === q.correct) correct++; });
    const pct = Math.round((correct / pbq.questions.length) * 100);
    setScore({ correct, total: pbq.questions.length, pct });
    setSubmitted(true);
    if (pct >= 70) completePBQ(domainId, topicId, pbq.xp);
  };

  const allAnswered = Object.keys(answers).length === pbq.questions.length;

  return (
    <PBQShell topic={topic} pbq={pbq} domainId={domainId} navigate={navigate} onBack={onBack}>
      <View style={[styles.scenarioBox, { borderColor: topic.color + '44' }]}>
        <Text style={[styles.scenarioLabel, { color: topic.color }]}>📋 SCENARIO</Text>
        <Text style={[styles.scenarioText, { fontFamily: MONO }]}>{pbq.scenario}</Text>
      </View>

      {pbq.questions.map((q, qi) => {
        const sel = answers[qi];
        return (
          <View key={qi} style={styles.scenarioQCard}>
            <Text style={styles.scenarioQ}>{qi + 1}. {q.question}</Text>
            {q.options.map((opt, oi) => {
              const isSelected = sel === oi;
              const isCorrect  = oi === q.correct;
              let border = C.border, bg = C.bgElevated, txtColor = C.textPrimary;
              if (submitted) {
                if (isCorrect)       { border = C.green; bg = 'rgba(16,185,129,0.1)'; txtColor = C.green; }
                else if (isSelected) { border = C.red;   bg = 'rgba(239,68,68,0.1)';  txtColor = C.red; }
              } else if (isSelected) {
                border = topic.color; bg = topic.color + '22'; txtColor = topic.color;
              }
              return (
                <TouchableOpacity
                  key={oi}
                  style={[styles.scenarioOpt, { borderColor: border, backgroundColor: bg }]}
                  onPress={() => handleSelect(qi, oi)}
                  disabled={submitted}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.scenarioOptText, { color: txtColor }]}>{opt}</Text>
                  {submitted && isCorrect  && <Text style={{ color: C.green, fontWeight: '800' }}>✓</Text>}
                  {submitted && isSelected && !isCorrect && <Text style={{ color: C.red, fontWeight: '800' }}>✗</Text>}
                </TouchableOpacity>
              );
            })}
            {submitted && <Text style={styles.scenarioExplain}>{q.explanation}</Text>}
          </View>
        );
      })}

      <ScoreAndButton
        submitted={submitted}
        score={score}
        canSubmit={allAnswered}
        topic={topic}
        pbq={pbq}
        domainId={domainId}
        navigate={navigate}
        onSubmit={handleSubmit}
        submitLabel="SUBMIT ANSWERS"
      />
    </PBQShell>
  );
}

/* ─────────────────────────────────────────────────────────
   SHARED: Score box + submit/back button
───────────────────────────────────────────────────────── */
function ScoreAndButton({ submitted, score, canSubmit, topic, pbq, domainId, navigate, onSubmit, submitLabel = 'SUBMIT ANSWER' }) {
  return (
    <>
      {submitted && score && (
        <View style={[styles.scoreBox, { borderColor: score.pct >= 70 ? C.green : C.red }]}>
          <Text style={[styles.scoreTitle, { color: score.pct >= 70 ? C.green : C.red }]}>
            {score.pct >= 70 ? '🎉 PASSED' : '📚 REVIEW NEEDED'}
          </Text>
          <Text style={styles.scoreNum}>{score.correct}/{score.total} correct — {score.pct}%</Text>
          {score.pct >= 70 && <Text style={styles.xpEarned}>+{pbq.xp} XP Earned!</Text>}
        </View>
      )}
      <View style={styles.btnRow}>
        {!submitted ? (
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: topic.color, opacity: canSubmit ? 1 : 0.35 }]}
            onPress={onSubmit}
            disabled={!canSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.submitBtnText}>{submitLabel}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border }]}
            onPress={() => navigate('domain', { domainId })}
            activeOpacity={0.8}
          >
            <Text style={[styles.submitBtnText, { color: C.textPrimary }]}>BACK TO DOMAIN ›</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   PBQ SHELL WRAPPER
───────────────────────────────────────────────────────── */
function PBQShell({ topic, pbq, domainId, navigate, onBack, children }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack || (() => navigate('domain', { domainId }))} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text style={[styles.pbqLabel, { color: topic.color }]}>🎯 PBQ — {topic.name}</Text>
          <Text style={styles.pbqTitle}>{pbq.title}</Text>
        </View>
        <View style={[styles.xpBadge, { backgroundColor: topic.color + '22', borderColor: topic.color + '55' }]}>
          <Text style={[styles.xpBadgeText, { color: topic.color }]}>+{pbq.xp} XP</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.instrBox, { borderColor: topic.color + '33' }]}>
          <Text style={[styles.instrText, { color: topic.color }]}>📌 {pbq.instructions}</Text>
        </View>
        {children}
        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}

/* ─────────────────────────────────────────────────────────
   UTILS
───────────────────────────────────────────────────────── */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ─────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  // ── Shell & list screen
  container:      { flex: 1, backgroundColor: C.bgDeep },
  header:         { flexDirection: 'row', alignItems: 'center', paddingTop: 52, paddingHorizontal: 16, paddingBottom: 14, backgroundColor: C.bgCard, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn:        { width: 36, height: 36, backgroundColor: C.bgElevated, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  backText:       { fontSize: 24, color: C.textSec, lineHeight: 30 },
  pbqLabel:       { fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  pbqTitle:       { fontSize: 14, fontWeight: '700', color: C.textPrimary, marginTop: 2 },
  xpBadge:        { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  xpBadgeText:    { fontSize: 12, fontWeight: '800' },
  scroll:         { flex: 1 },
  scrollContent:  { padding: 16 },
  instrBox:       { backgroundColor: C.bgCard, borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 14 },
  instrText:      { fontSize: 14, fontWeight: '600', lineHeight: 22 },
  pbqCard:        { backgroundColor: C.bgCard, borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  pbqCardIcon:    { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  pbqCardTitle:   { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  pbqCardMeta:    { fontSize: 12, color: C.textSec },
  pbqCardArrow:   { fontSize: 24, fontWeight: '700' },

  // ── Hint bar (dynamic instruction above each PBQ type)
  hintBar:        { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14 },
  hintBarText:    { fontSize: 13, fontWeight: '600', textAlign: 'center', lineHeight: 18 },

  // ── MATCH
  matchGrid:      { flexDirection: 'row', marginBottom: 16 },
  matchDivider:   { width: 1, backgroundColor: C.border, marginHorizontal: 10, marginTop: 22 },
  colLabel:       { fontSize: 9, fontWeight: '800', color: C.textDim, letterSpacing: 1.2, textAlign: 'center', marginBottom: 6 },
  matchItemLeft:  { backgroundColor: C.bgCard, borderRadius: 10, borderWidth: 1.5, padding: 10, marginBottom: 6, flexDirection: 'row', alignItems: 'center', minHeight: 48 },
  matchItemRight: { backgroundColor: C.bgCard, borderRadius: 10, borderWidth: 1.5, padding: 10, marginBottom: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48 },
  matchItemText:  { fontSize: 13, fontWeight: '700', flex: 1, lineHeight: 18 },
  matchTag:       { fontSize: 11, marginTop: 3, fontWeight: '600' },
  countBadge:     { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, marginLeft: 4 },
  countBadgeText: { fontSize: 11, fontWeight: '800', color: '#000' },

  // ── ORDER
  zoneLabel:      { fontSize: 10, fontWeight: '800', color: C.textDim, letterSpacing: 1.2, marginBottom: 8 },
  orderedZone:    { gap: 6, marginBottom: 4 },
  slot:           { flexDirection: 'row', alignItems: 'center', borderRadius: 11, borderWidth: 1.5, padding: 11, gap: 10, minHeight: 54 },
  slotNum:        { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  slotNumText:    { fontSize: 14, fontWeight: '800' },
  itemLabel:      { fontSize: 14, fontWeight: '600', color: C.textPrimary },
  itemSublabel:   { fontSize: 11, color: C.textDim, marginTop: 2 },
  correctHint:    { fontSize: 11, color: C.green, marginTop: 3, fontWeight: '600' },
  emptySlot:      { fontSize: 13, color: C.textDim, fontStyle: 'italic' },
  removeHint:     { fontSize: 12, color: C.textDim, marginLeft: 4 },
  pool:           { gap: 8 },
  poolItem:       { padding: 13, borderRadius: 11, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center' },
  poolItemLabel:  { fontSize: 14, fontWeight: '700' },
  poolItemSub:    { fontSize: 11, color: C.textDim, marginTop: 2 },

  // ── Selection badge (used in both Match and Order)
  selBadge:       { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, marginLeft: 6 },
  selBadgeText:   { fontSize: 10, fontWeight: '800', color: '#000', letterSpacing: 0.5 },

  // ── Result icons
  resultCheck:    { fontSize: 18, color: C.green, fontWeight: '800', marginLeft: 4 },
  resultWrong:    { fontSize: 18, color: C.red,   fontWeight: '800', marginLeft: 4 },

  // ── Corrections box (Match PBQ post-submit)
  correctionsBox:   { backgroundColor: 'rgba(239,68,68,0.06)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)', padding: 14, marginBottom: 12 },
  correctionsTitle: { fontSize: 10, fontWeight: '800', color: C.red, letterSpacing: 1.2, marginBottom: 8 },
  correctionRow:    { fontSize: 13, lineHeight: 22 },

  // ── SCENARIO
  scenarioBox:    { backgroundColor: C.bgCard, borderRadius: 12, borderWidth: 1.5, padding: 16, marginBottom: 16 },
  scenarioLabel:  { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 8 },
  scenarioText:   { fontSize: 13, color: C.textSec, lineHeight: 22 },
  scenarioQCard:  { backgroundColor: C.bgCard, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 12 },
  scenarioQ:      { fontSize: 15, fontWeight: '600', color: C.textPrimary, lineHeight: 22, marginBottom: 10 },
  scenarioOpt:    { borderRadius: 9, borderWidth: 1.5, padding: 10, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scenarioOptText:{ fontSize: 13, flex: 1, lineHeight: 20 },
  scenarioExplain:{ fontSize: 12, color: C.textDim, marginTop: 8, lineHeight: 18, fontStyle: 'italic' },

  // ── Shared score + button
  scoreBox:       { backgroundColor: C.bgCard, borderRadius: 14, borderWidth: 1.5, padding: 20, alignItems: 'center', marginTop: 8, marginBottom: 8 },
  scoreTitle:     { fontSize: 22, fontWeight: '900', marginBottom: 6 },
  scoreNum:       { fontSize: 16, color: C.textSec },
  xpEarned:       { fontSize: 16, color: C.amber, fontWeight: '700', marginTop: 6 },
  btnRow:         { marginTop: 8 },
  submitBtn:      { paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  submitBtnText:  { fontSize: 15, fontWeight: '800', color: '#000', letterSpacing: 0.5 },
});
