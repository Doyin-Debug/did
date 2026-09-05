import { CustomQuiz, QuizResult } from '../types';

const STORAGE_KEYS = {
  HISTORY: 'quiz_app_history_v1',
  CUSTOM_QUIZZES: 'quiz_app_custom_quizzes_v1',
  STATS: 'quiz_app_stats_v1',
};

export interface OverallStats {
  quizzesPlayed: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  bestStreak: number;
  highestScore: number;
}

export function getQuizHistory(): QuizResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveQuizResult(result: QuizResult): void {
  try {
    const history = getQuizHistory();
    history.unshift(result);
    // Keep last 50 results
    if (history.length > 50) history.pop();
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));

    // Update overall stats
    const stats = getOverallStats();
    stats.quizzesPlayed += 1;
    stats.totalQuestionsAnswered += result.totalQuestions;
    stats.totalCorrect += result.correctCount;
    stats.bestStreak = Math.max(stats.bestStreak, result.maxStreak);
    stats.highestScore = Math.max(stats.highestScore, result.score);
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save quiz result', e);
  }
}

export function getOverallStats(): OverallStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!raw) {
      return {
        quizzesPlayed: 0,
        totalQuestionsAnswered: 0,
        totalCorrect: 0,
        bestStreak: 0,
        highestScore: 0,
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      quizzesPlayed: 0,
      totalQuestionsAnswered: 0,
      totalCorrect: 0,
      bestStreak: 0,
      highestScore: 0,
    };
  }
}

export function getCustomQuizzes(): CustomQuiz[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_QUIZZES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCustomQuiz(quiz: CustomQuiz): void {
  try {
    const quizzes = getCustomQuizzes();
    const index = quizzes.findIndex((q) => q.id === quiz.id);
    if (index >= 0) {
      quizzes[index] = quiz;
    } else {
      quizzes.unshift(quiz);
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOM_QUIZZES, JSON.stringify(quizzes));
  } catch (e) {
    console.error('Failed to save custom quiz', e);
  }
}

export function deleteCustomQuiz(quizId: string): void {
  try {
    const quizzes = getCustomQuizzes().filter((q) => q.id !== quizId);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_QUIZZES, JSON.stringify(quizzes));
  } catch (e) {
    console.error('Failed to delete custom quiz', e);
  }
}

export function clearAllHistory(): void {
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
  localStorage.removeItem(STORAGE_KEYS.STATS);
}
