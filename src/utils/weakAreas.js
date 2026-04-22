import { DOMAINS } from '../data/domains.js';
import { DOMAIN_TOPIC_IDS, TOPIC_LABELS } from '../data/domainContent.js';

const PASSING_SCORE = 80;

const topicDomainMap = Object.entries(DOMAIN_TOPIC_IDS).reduce((map, [domainId, topicIds]) => {
  topicIds.forEach(topicId => {
    map[topicId] = Number(domainId);
  });
  return map;
}, {});

export function buildWeakAreas(progress) {
  const areas = {};

  (progress.notes || []).forEach(note => {
    if (note.mastered) return;
    const domainId = topicDomainMap[note.topicId] || 1;
    const key = `${domainId}-${note.topicId}`;
    areas[key] = areas[key] || makeArea(domainId, note.topicId);
    areas[key].notes.push(note);
  });

  Object.entries(progress.domains || {}).forEach(([domainId, domainProgress]) => {
    Object.entries(domainProgress?.topics || {}).forEach(([topicId, topicProgress]) => {
      const quizScore = topicProgress?.quizScore;
      if (quizScore === null || quizScore === undefined || quizScore >= PASSING_SCORE) return;
      const key = `${domainId}-${topicId}`;
      areas[key] = areas[key] || makeArea(Number(domainId), topicId);
      areas[key].quizScore = quizScore;
    });
  });

  return Object.values(areas).sort((a, b) => {
    const missedDiff = b.notes.length - a.notes.length;
    if (missedDiff !== 0) return missedDiff;
    return (a.quizScore ?? PASSING_SCORE) - (b.quizScore ?? PASSING_SCORE);
  });
}

function makeArea(domainId, topicId) {
  const domain = DOMAINS.find(item => item.id === domainId);
  return {
    domainId,
    topicId,
    topicName: TOPIC_LABELS[topicId] || topicId,
    domainName: domain?.name || `Domain ${domainId}`,
    quizScore: null,
    notes: [],
  };
}
