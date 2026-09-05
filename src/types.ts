export type UserRole = 'student' | 'teacher';

export interface UserRoleInfo {
  role: UserRole;
  title: string;
  description: string;
}

export type Difficulty = 'all' | 'easy' | 'medium' | 'hard';

export type QuizMode = 'classic' | 'blitz' | 'survival' | 'practice';

export type ThemeId =
  | 'modern-light'
  | 'dark-midnight'
  | 'cyber-neon'
  | 'forest-emerald'
  | 'royal-sunset'
  | 'warm-solar';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  isDark: boolean;
  accentColor: string;
  bgClass: string;
  cardClass: string;
  borderClass: string;
  textClass: string;
  textMutedClass: string;
  previewGradient: string;
}

export interface Category {
  id: string;
  name: string;
  subjectGroup?: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  questionCount?: number;
}

export interface Question {
  id: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options: string[];
  correctAnswer: number; // 0-indexed into options
  explanation: string;
  funFact?: string;
}

export interface UserAnswer {
  questionId: string;
  question: string;
  options: string[];
  selectedAnswer: number; // -1 if skipped / timed out
  correctAnswer: number;
  isCorrect: boolean;
  explanation: string;
  timeSpentSeconds: number;
}

export interface QuizConfig {
  categoryId: string;
  difficulty: Difficulty;
  mode: QuizMode;
  questionCount: number;
  timePerQuestion: number; // in seconds (e.g. 15s)
}

export interface QuizResult {
  id: string;
  date: string;
  categoryTitle: string;
  categoryId: string;
  mode: QuizMode;
  difficulty: Difficulty;
  score: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  accuracy: number;
  maxStreak: number;
  totalTimeSeconds: number;
  userAnswers: UserAnswer[];
}

export interface Lifelines {
  fiftyFiftyUsed: boolean;
  freezeTimeUsed: boolean;
  skipUsed: boolean;
}

export interface CustomQuiz {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: string;
  questions: Question[];
}
