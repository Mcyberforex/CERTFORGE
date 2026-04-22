export const RESUME_PROGRESS_KEY = 'netplus_resume_progress';

export function buildResumeProgress(screen, params = {}, extra = {}) {
  return {
    screen,
    params,
    currentDomain: params.domainId || null,
    currentTopic: params.topicId || null,
    lessonIndex: params.lessonIndex ?? null,
    savedAt: new Date().toISOString(),
    ...extra,
  };
}

export function buildQuizResumeProgress({
  isDaily,
  domainId,
  topicId,
  topicName,
  questions,
  quizState,
}) {
  const screen = isDaily ? 'daily-quiz' : 'quiz';
  const params = isDaily ? { domainId: 1 } : { domainId, topicId };

  return buildResumeProgress(screen, params, {
    quiz: {
      quizId: isDaily ? 'daily-quiz' : `${domainId}-${topicId}`,
      domainId,
      topicId,
      topicName: topicName || 'Daily Quiz',
      questionIds: questions.map(q => q.id),
      ...quizState,
    },
  });
}
