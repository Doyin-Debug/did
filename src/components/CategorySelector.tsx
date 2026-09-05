import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Zap,
  ShieldAlert,
  BookOpen,
  Play,
  Layers,
  Clock,
  CheckCircle2,
  Trash2,
  Search,
  Check,
} from 'lucide-react';
import { CATEGORIES } from '../data/defaultQuestions';
import { CustomQuiz, Difficulty, QuizConfig, QuizMode, ThemeConfig } from '../types';
import { IconRenderer } from './IconRenderer';
import { soundManager } from '../utils/audio';

interface CategorySelectorProps {
  config: QuizConfig;
  onConfigChange: (newConfig: Partial<QuizConfig>) => void;
  onStartQuiz: (customQuestions?: any[]) => void;
  customQuizzes: CustomQuiz[];
  onDeleteCustomQuiz: (id: string) => void;
  onPlayCustomQuiz: (quiz: CustomQuiz) => void;
  totalAvailableQuestions: number;
  currentTheme: ThemeConfig;
}

const MODES: { id: QuizMode; title: string; subtitle: string; icon: any }[] = [
  {
    id: 'classic',
    title: 'Classic Mode',
    subtitle: '10 Questions • 15s Timer • Score Multipliers',
    icon: Layers,
  },
  {
    id: 'blitz',
    title: 'Speed Blitz',
    subtitle: '60s Total Clock • Rapid Fire Answers',
    icon: Zap,
  },
  {
    id: 'survival',
    title: 'Survival Mode',
    subtitle: '3 Lives • Keep Playing Until 3 Strikes',
    icon: ShieldAlert,
  },
  {
    id: 'practice',
    title: 'Study & Practice',
    subtitle: 'Untimed • Deep Explanations • Zero Pressure',
    icon: BookOpen,
  },
];

const DIFFICULTIES: { id: Difficulty; label: string }[] = [
  { id: 'all', label: 'All Levels' },
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
];

const SUBJECT_GROUPS = [
  'All Subjects',
  'STEM & Sciences',
  'Humanities & Social',
  'Arts & Recreation',
];

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  config,
  onConfigChange,
  onStartQuiz,
  customQuizzes,
  onDeleteCustomQuiz,
  onPlayCustomQuiz,
  totalAvailableQuestions,
  currentTheme,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('All Subjects');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleCategorySelect = (categoryId: string) => {
    soundManager.playClick();
    onConfigChange({ categoryId });
  };

  const handleModeSelect = (mode: QuizMode) => {
    soundManager.playClick();
    onConfigChange({ mode });
  };

  const handleDifficultySelect = (difficulty: Difficulty) => {
    soundManager.playClick();
    onConfigChange({ difficulty });
  };

  // Filter categories by subject group tab and search query
  const filteredCategories = useMemo(() => {
    return CATEGORIES.filter((cat) => {
      const matchesGroup =
        selectedGroup === 'All Subjects' ||
        cat.subjectGroup === selectedGroup ||
        cat.id === 'all';

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        cat.name.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q);

      return matchesGroup && matchesSearch;
    });
  }, [selectedGroup, searchQuery]);

  const selectedCategoryObj =
    CATEGORIES.find((c) => c.id === config.categoryId) || CATEGORIES[0];

  const isDark = currentTheme.isDark;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      {/* Clean Modern Bright Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 shadow-xl border transition-all ${
          isDark
            ? 'bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900 border-indigo-500/20 text-white shadow-indigo-950/40'
            : 'bg-gradient-to-br from-white via-indigo-50/50 to-amber-50/40 border-stone-200/90 text-stone-900 shadow-stone-200/50'
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            {/* Logo & Badge */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 text-white shadow-lg shadow-indigo-500/25">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-none font-sans">
                  QUIZ
                </h1>
                <span className="rounded-xl px-2.5 py-1 text-sm font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 shadow-sm">
                  PRO
                </span>
              </div>
            </div>

            {/* Short Welcome Message */}
            <p
              className={`text-base sm:text-lg font-semibold leading-snug mb-2 ${
                isDark ? 'text-indigo-200' : 'text-indigo-950'
              }`}
            >
              Welcome to QUIZ PRO!
            </p>
            <p
              className={`text-xs sm:text-sm leading-relaxed mb-4 ${
                isDark ? 'text-slate-300' : 'text-stone-600'
              }`}
            >
              Choose your favorite subject, pick your difficulty level, and set your question count to test your knowledge and track your mastery.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold border ${
                  isDark
                    ? 'bg-indigo-950/60 border-indigo-800/60 text-indigo-300'
                    : 'bg-white border-indigo-100 text-indigo-700 shadow-sm'
                }`}
              >
                <Layers className="h-3 w-3 text-indigo-500" />
                17+ Subjects
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold border ${
                  isDark
                    ? 'bg-amber-950/40 border-amber-800/40 text-amber-300'
                    : 'bg-white border-amber-100 text-amber-700 shadow-sm'
                }`}
              >
                <Zap className="h-3 w-3 text-amber-500" />
                Custom Difficulties
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold border ${
                  isDark
                    ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'
                    : 'bg-white border-emerald-100 text-emerald-700 shadow-sm'
                }`}
              >
                <Clock className="h-3 w-3 text-emerald-500" />
                Selectable Lengths
              </span>
            </div>
          </div>

          {/* Quick Launch CTA Card */}
          <div
            className={`flex flex-col items-start md:items-end justify-center rounded-2xl p-5 border shrink-0 ${
              isDark
                ? 'bg-slate-900/90 border-slate-800 text-slate-100'
                : 'bg-white/95 border-stone-200/90 text-stone-900 shadow-md shadow-stone-100'
            }`}
          >
            <div className="text-left md:text-right mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-500">
                Ready to play
              </span>
              <div className="font-extrabold text-sm sm:text-base truncate max-w-[200px]">
                {selectedCategoryObj.name}
              </div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                {config.questionCount} Questions • {config.difficulty.toUpperCase()}
              </div>
            </div>

            <button
              id="btn-quick-start"
              onClick={() => onStartQuiz()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3 text-sm font-extrabold text-stone-950 shadow-md shadow-amber-500/20 hover:brightness-105 active:scale-98 transition-all w-full md:w-auto"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Start Quiz</span>
            </button>
          </div>
        </div>

        {/* Decorative blur elements */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />
      </motion.div>

      {/* 1. Subject Selection Section */}
      <div className="mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                1
              </span>
              <h2
                className={`text-base sm:text-lg font-bold ${
                  isDark ? 'text-slate-100' : 'text-stone-900'
                }`}
              >
                Select Subject ({CATEGORIES.length} Topics Available)
              </h2>
            </div>
            <p
              className={`text-xs ml-8 ${
                isDark ? 'text-slate-400' : 'text-stone-500'
              }`}
            >
              Choose a discipline or challenge yourself across all topics
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search
              className={`absolute left-3 top-2.5 h-4 w-4 ${
                isDark ? 'text-slate-400' : 'text-stone-400'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subjects (e.g. Physics, Law)..."
              className={`w-full rounded-xl border pl-9 pr-3 py-2 text-xs font-medium focus:outline-none transition-all shadow-sm ${
                isDark
                  ? 'border-slate-800 bg-slate-900/90 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500'
                  : 'border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:border-indigo-600'
              }`}
            />
          </div>
        </div>

        {/* Subject Group Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-4">
          {SUBJECT_GROUPS.map((group) => {
            const isTabActive = selectedGroup === group;
            return (
              <button
                key={group}
                onClick={() => {
                  soundManager.playClick();
                  setSelectedGroup(group);
                }}
                className={`whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  isTabActive
                    ? isDark
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-stone-900 text-white shadow-sm'
                    : isDark
                    ? 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                    : 'bg-white text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-stone-200 shadow-xs'
                }`}
              >
                {group}
              </button>
            );
          })}
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredCategories.map((cat) => {
            const isSelected = config.categoryId === cat.id;
            return (
              <button
                key={cat.id}
                id={`btn-cat-${cat.id}`}
                onClick={() => handleCategorySelect(cat.id)}
                className={`group relative flex items-start gap-3.5 p-4 rounded-2xl border-2 text-left transition-all ${
                  isSelected
                    ? isDark
                      ? 'border-indigo-400 bg-indigo-950/60 shadow-md ring-2 ring-indigo-400/30'
                      : 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-600/20'
                    : isDark
                    ? `${currentTheme.cardClass} ${currentTheme.borderClass} hover:border-white/20`
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/70 shadow-xs'
                }`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${cat.gradient} text-white shadow-sm`}
                >
                  <IconRenderer name={cat.icon} className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-1.5">
                    <h3
                      className={`font-bold text-sm truncate ${
                        isDark ? 'text-slate-100' : 'text-stone-900'
                      }`}
                    >
                      {cat.name}
                    </h3>
                  </div>
                  <p
                    className={`text-xs line-clamp-2 mt-0.5 leading-snug ${
                      isDark ? 'text-slate-400' : 'text-stone-500'
                    }`}
                  >
                    {cat.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="absolute top-3.5 right-3.5">
                    <CheckCircle2
                      className={`h-4 w-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {filteredCategories.length === 0 && (
          <div
            className={`rounded-2xl border border-dashed p-8 text-center text-xs ${
              isDark
                ? 'border-slate-800 text-slate-400'
                : 'border-stone-200 text-stone-500 bg-white'
            }`}
          >
            No subjects match your search "{searchQuery}".
          </div>
        )}
      </div>

      {/* 2 & 3. Difficulty Level & Number of Questions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Difficulty */}
        <div
          className={`rounded-3xl border p-5 transition-all ${currentTheme.cardClass} ${currentTheme.borderClass}`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-stone-950">
                2
              </span>
              <label
                className={`text-sm font-bold ${
                  isDark ? 'text-slate-100' : 'text-stone-900'
                }`}
              >
                Choose Difficulty
              </label>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isDark ? 'bg-white/10 text-amber-300' : 'bg-amber-50 text-amber-800'
              }`}
            >
              {config.difficulty.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {DIFFICULTIES.map((diff) => {
              const isSelected = config.difficulty === diff.id;
              return (
                <button
                  key={diff.id}
                  id={`btn-diff-${diff.id}`}
                  onClick={() => handleDifficultySelect(diff.id)}
                  className={`rounded-2xl py-2.5 text-xs font-bold transition-all ${
                    isSelected
                      ? isDark
                        ? 'bg-amber-400 text-stone-950 shadow-md shadow-amber-400/20'
                        : 'bg-stone-900 text-white shadow-sm'
                      : isDark
                      ? 'bg-white/10 text-slate-200 hover:bg-white/15'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
                  }`}
                >
                  {diff.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Number of Questions */}
        <div
          className={`rounded-3xl border p-5 transition-all ${currentTheme.cardClass} ${currentTheme.borderClass}`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                3
              </span>
              <label
                className={`text-sm font-bold ${
                  isDark ? 'text-slate-100' : 'text-stone-900'
                }`}
              >
                Number of Questions
              </label>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isDark ? 'bg-white/10 text-emerald-300' : 'bg-emerald-50 text-emerald-800'
              }`}
            >
              {config.questionCount} Questions
            </span>
          </div>

          {config.mode === 'classic' || config.mode === 'practice' ? (
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map((count) => {
                const isSelected = config.questionCount === count;
                return (
                  <button
                    key={count}
                    id={`btn-count-${count}`}
                    onClick={() => {
                      soundManager.playClick();
                      onConfigChange({ questionCount: count });
                    }}
                    className={`rounded-2xl py-2.5 text-xs font-bold transition-all ${
                      isSelected
                        ? isDark
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                          : 'bg-stone-900 text-white shadow-sm'
                        : isDark
                        ? 'bg-white/10 text-slate-200 hover:bg-white/15'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
                    }`}
                  >
                    {count} Qs
                  </button>
                );
              })}
            </div>
          ) : (
            <div
              className={`flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs ${
                isDark
                  ? 'bg-white/5 text-slate-300'
                  : 'bg-stone-50 text-stone-600'
              }`}
            >
              <Clock className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>
                {config.mode === 'blitz'
                  ? '60s countdown clock with continuous fast-paced questions.'
                  : 'Answer until 3 strikes (mistakes) occur.'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Game Mode Picker */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
              4
            </span>
            <h2
              className={`text-base sm:text-lg font-bold ${
                isDark ? 'text-slate-100' : 'text-stone-900'
              }`}
            >
              Select Game Mode
            </h2>
          </div>
          <span
            className={`text-xs font-medium ${
              isDark ? 'text-slate-400' : 'text-stone-500'
            }`}
          >
            Choose your challenge style
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {MODES.map((mode) => {
            const Icon = mode.icon;
            const isSelected = config.mode === mode.id;
            return (
              <button
                key={mode.id}
                id={`btn-mode-${mode.id}`}
                onClick={() => handleModeSelect(mode.id)}
                className={`relative flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all ${
                  isSelected
                    ? isDark
                      ? 'border-indigo-400 bg-indigo-950/60 shadow-md ring-2 ring-indigo-400/30'
                      : 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-600/20'
                    : isDark
                    ? `${currentTheme.cardClass} ${currentTheme.borderClass} hover:border-white/20`
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/60 shadow-xs'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2
                      className={`h-4 w-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}
                    />
                  </div>
                )}
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl mb-3 ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : isDark
                      ? 'bg-white/10 text-slate-200'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <h3
                  className={`font-bold text-sm ${
                    isDark ? 'text-slate-100' : 'text-stone-900'
                  }`}
                >
                  {mode.title}
                </h3>
                <p
                  className={`text-xs mt-1 leading-snug ${
                    isDark ? 'text-slate-400' : 'text-stone-500'
                  }`}
                >
                  {mode.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Quizzes Section if created */}
      {customQuizzes.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2
              className={`text-base sm:text-lg font-bold ${
                isDark ? 'text-slate-100' : 'text-stone-900'
              }`}
            >
              Your Custom Quizzes
            </h2>
            <span className="text-xs text-indigo-400 font-semibold">
              {customQuizzes.length} saved
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {customQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className={`flex flex-col justify-between rounded-2xl border p-4 shadow-sm transition-colors ${
                  isDark
                    ? 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
                    : 'border-stone-200 bg-white hover:border-indigo-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                        isDark
                          ? 'bg-indigo-950/80 text-indigo-300'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {quiz.questions.length} Qs
                    </span>
                    <button
                      onClick={() => onDeleteCustomQuiz(quiz.id)}
                      className="text-stone-400 hover:text-rose-600 transition-colors"
                      title="Delete quiz"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <h3
                    className={`font-bold text-sm mt-1 ${
                      isDark ? 'text-slate-100' : 'text-stone-900'
                    }`}
                  >
                    {quiz.title}
                  </h3>
                  <p
                    className={`text-xs line-clamp-2 mt-0.5 ${
                      isDark ? 'text-slate-400' : 'text-stone-500'
                    }`}
                  >
                    {quiz.description}
                  </p>
                </div>

                <button
                  onClick={() => onPlayCustomQuiz(quiz)}
                  className={`mt-3 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-colors ${
                    isDark
                      ? 'bg-indigo-950/80 text-indigo-200 hover:bg-indigo-900'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Play Custom Quiz</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Start Button Anchor */}
      <div
        className={`mt-10 flex flex-col sm:flex-row items-center justify-between rounded-3xl p-6 text-white shadow-2xl gap-4 border ${
          isDark
            ? 'bg-slate-900/90 border-slate-800'
            : 'bg-stone-900 border-stone-800'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider text-amber-400 font-extrabold">
              QUIZ PRO Session Configured
            </span>
          </div>
          <div className="text-lg font-bold">
            {selectedCategoryObj.name} • {config.questionCount} Questions
          </div>
          <div className="text-xs text-stone-400">
            Difficulty: {config.difficulty.toUpperCase()} • Mode: {config.mode.toUpperCase()}
          </div>
        </div>

        <button
          id="btn-start-configured-quiz"
          onClick={() => onStartQuiz()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-8 py-4 text-sm font-extrabold text-stone-950 shadow-lg shadow-amber-500/20 hover:brightness-105 active:scale-98 transition-all"
        >
          <Play className="h-4 w-4 fill-current" />
          <span>Start QUIZ PRO</span>
        </button>
      </div>
    </div>
  );
};
