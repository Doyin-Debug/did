import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  Flame,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Shield,
  Snowflake,
  Forward,
  Heart,
  Info,
} from 'lucide-react';
import { Lifelines, Question, QuizMode, ThemeConfig } from '../types';

interface QuizCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  mode: QuizMode;
  timeLeft: number;
  totalBlitzTimeLeft?: number;
  livesLeft?: number;
  score: number;
  currentStreak: number;
  lifelines: Lifelines;
  onUseLifeline: (type: 'fiftyFifty' | 'freezeTime' | 'skip') => void;
  onSelectOption: (optionIndex: number) => void;
  onNextQuestion: () => void;
  selectedAnswer: number | null;
  isAnswerSubmitted: boolean;
  eliminatedOptions: number[];
  currentTheme: ThemeConfig;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  mode,
  timeLeft,
  totalBlitzTimeLeft,
  livesLeft = 3,
  score,
  currentStreak,
  lifelines,
  onUseLifeline,
  onSelectOption,
  onNextQuestion,
  selectedAnswer,
  isAnswerSubmitted,
  eliminatedOptions,
  currentTheme,
}) => {
  const isDark = currentTheme.isDark;

  // Option key shortcuts listener (1-4 or A-D or Space/Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswerSubmitted) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
          e.preventDefault();
          onNextQuestion();
        }
        return;
      }

      const key = e.key.toUpperCase();
      if (['1', 'A'].includes(key) && !eliminatedOptions.includes(0)) {
        onSelectOption(0);
      } else if (['2', 'B'].includes(key) && !eliminatedOptions.includes(1)) {
        onSelectOption(1);
      } else if (['3', 'C'].includes(key) && !eliminatedOptions.includes(2)) {
        onSelectOption(2);
      } else if (['4', 'D'].includes(key) && !eliminatedOptions.includes(3)) {
        onSelectOption(3);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswerSubmitted, onSelectOption, onNextQuestion, eliminatedOptions]);

  // Streak Multiplier text
  const getMultiplier = (streak: number) => {
    if (streak >= 4) return '2.0x Multiplier';
    if (streak === 3) return '1.5x Multiplier';
    if (streak === 2) return '1.2x Multiplier';
    return null;
  };

  const multiplierBadge = getMultiplier(currentStreak);

  // Time bar percentage calculation
  const getTimePercentage = () => {
    if (mode === 'blitz') {
      return ((totalBlitzTimeLeft ?? 60) / 60) * 100;
    }
    if (mode === 'practice') return 100;
    return (timeLeft / 15) * 100;
  };

  const isLowTime =
    mode === 'blitz' ? (totalBlitzTimeLeft ?? 60) <= 10 : timeLeft <= 4 && mode !== 'practice';

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      {/* Top Header Status Bar */}
      <div
        className={`rounded-2xl border p-4 shadow-sm mb-5 transition-colors ${
          isDark
            ? 'border-slate-800 bg-slate-900/90 text-slate-100'
            : 'border-stone-200 bg-white text-stone-900'
        }`}
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Progress / Question Number */}
          <div className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                isDark ? 'bg-white/10 text-cyan-300' : 'bg-indigo-50 text-indigo-700'
              }`}
            >
              {questionNumber}
            </span>
            <div
              className={`text-xs font-semibold ${
                isDark ? 'text-slate-300' : 'text-stone-600'
              }`}
            >
              {mode === 'survival'
                ? `Question ${questionNumber}`
                : mode === 'blitz'
                ? `Blitz #${questionNumber}`
                : `Question ${questionNumber} of ${totalQuestions}`}
            </div>
          </div>

          {/* Center Timer or Lives */}
          <div className="flex items-center gap-3">
            {mode === 'survival' ? (
              <div
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 border ${
                  isDark
                    ? 'bg-rose-950/50 border-rose-900/60 text-rose-300'
                    : 'bg-rose-50 border-rose-100 text-rose-700'
                }`}
              >
                <span className="text-xs font-bold mr-1">Lives:</span>
                {[1, 2, 3].map((heart) => (
                  <Heart
                    key={heart}
                    className={`h-4 w-4 transition-all ${
                      heart <= livesLeft
                        ? 'fill-rose-500 text-rose-500 scale-100'
                        : isDark
                        ? 'text-slate-700 scale-90'
                        : 'text-stone-300 scale-90'
                    }`}
                  />
                ))}
              </div>
            ) : mode === 'practice' ? (
              <div
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${
                  isDark
                    ? 'bg-emerald-950/50 border-emerald-900/60 text-emerald-300'
                    : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Practice Mode (Untimed)</span>
              </div>
            ) : (
              <div
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono font-bold border transition-colors ${
                  isLowTime
                    ? isDark
                      ? 'bg-rose-950/80 border-rose-800 text-rose-400 animate-pulse'
                      : 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse'
                    : isDark
                    ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                    : 'bg-stone-50 border-stone-200 text-stone-700'
                }`}
              >
                <Clock
                  className={`h-3.5 w-3.5 ${
                    isLowTime
                      ? 'text-rose-500'
                      : isDark
                      ? 'text-slate-400'
                      : 'text-stone-500'
                  }`}
                />
                <span>
                  {mode === 'blitz' ? `${totalBlitzTimeLeft}s` : `${timeLeft}s`}
                </span>
              </div>
            )}

            {/* Current Streak Indicator */}
            {currentStreak > 1 && (
              <div
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold border animate-bounce ${
                  isDark
                    ? 'bg-amber-950/70 border-amber-800 text-amber-300'
                    : 'bg-amber-50 border-amber-200 text-amber-700'
                }`}
              >
                <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span>{currentStreak} Streak!</span>
              </div>
            )}
          </div>

          {/* Score Display */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div
                className={`text-[10px] uppercase font-bold tracking-wider ${
                  isDark ? 'text-slate-400' : 'text-stone-400'
                }`}
              >
                Score
              </div>
              <div
                className={`text-sm font-black leading-none ${
                  isDark ? 'text-white' : 'text-stone-900'
                }`}
              >
                {score.toLocaleString()} pts
              </div>
            </div>
            {multiplierBadge && (
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-extrabold ${
                  isDark
                    ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                    : 'bg-indigo-100 text-indigo-800'
                }`}
              >
                {multiplierBadge}
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        {mode !== 'practice' && (
          <div
            className={`mt-3 h-1.5 w-full overflow-hidden rounded-full ${
              isDark ? 'bg-slate-800' : 'bg-stone-100'
            }`}
          >
            <motion.div
              className={`h-full transition-all duration-300 ${
                isLowTime ? 'bg-rose-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, getTimePercentage()))}%` }}
            />
          </div>
        )}
      </div>

      {/* Main Question Card */}
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className={`rounded-3xl border p-6 sm:p-8 shadow-xl transition-colors ${
          isDark
            ? 'border-slate-800 bg-slate-900/90 text-slate-100'
            : 'border-stone-200/90 bg-white text-stone-900'
        }`}
      >
        {/* Category & Difficulty Badges + Lifelines */}
        <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                isDark ? 'bg-slate-800 text-slate-300' : 'bg-stone-100 text-stone-700'
              }`}
            >
              {question.category}
            </span>
            <span
              className={`rounded-lg px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                question.difficulty === 'easy'
                  ? isDark
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                    : 'bg-emerald-50 text-emerald-700'
                  : question.difficulty === 'medium'
                  ? isDark
                    ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                    : 'bg-amber-50 text-amber-700'
                  : isDark
                  ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {question.difficulty}
            </span>
          </div>

          {/* Lifelines */}
          {(mode === 'classic' || mode === 'survival') && !isAnswerSubmitted && (
            <div className="flex items-center gap-1.5">
              <button
                id="btn-lifeline-5050"
                disabled={lifelines.fiftyFiftyUsed}
                onClick={() => onUseLifeline('fiftyFifty')}
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold transition-all ${
                  lifelines.fiftyFiftyUsed
                    ? 'opacity-25 cursor-not-allowed bg-slate-800 text-slate-500'
                    : isDark
                    ? 'bg-indigo-950 text-indigo-300 hover:bg-indigo-900 active:scale-95 border border-indigo-800'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:scale-95 border border-indigo-200'
                }`}
                title="50:50 - Eliminate two incorrect answers"
              >
                <span>50:50</span>
              </button>

              <button
                id="btn-lifeline-freeze"
                disabled={lifelines.freezeTimeUsed}
                onClick={() => onUseLifeline('freezeTime')}
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold transition-all ${
                  lifelines.freezeTimeUsed
                    ? 'opacity-25 cursor-not-allowed bg-slate-800 text-slate-500'
                    : isDark
                    ? 'bg-sky-950 text-sky-300 hover:bg-sky-900 active:scale-95 border border-sky-800'
                    : 'bg-sky-50 text-sky-700 hover:bg-sky-100 active:scale-95 border border-sky-200'
                }`}
                title="+15s Freeze Time Boost"
              >
                <Snowflake className="h-3 w-3" />
                <span>+15s</span>
              </button>

              <button
                id="btn-lifeline-skip"
                disabled={lifelines.skipUsed}
                onClick={() => onUseLifeline('skip')}
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold transition-all ${
                  lifelines.skipUsed
                    ? 'opacity-25 cursor-not-allowed bg-slate-800 text-slate-500'
                    : isDark
                    ? 'bg-amber-950 text-amber-300 hover:bg-amber-900 active:scale-95 border border-amber-800'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100 active:scale-95 border border-amber-200'
                }`}
                title="Skip this question without penalty"
              >
                <Forward className="h-3 w-3" />
                <span>Skip</span>
              </button>
            </div>
          )}
        </div>

        {/* Question Prompt */}
        <h2
          className={`text-lg sm:text-xl font-bold leading-snug mb-6 ${
            isDark ? 'text-white' : 'text-stone-900'
          }`}
        >
          {question.question}
        </h2>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {question.options.map((option, index) => {
            const letter = String.fromCharCode(65 + index); // A, B, C, D
            const isSelected = selectedAnswer === index;
            const isCorrect = index === question.correctAnswer;
            const isEliminated = eliminatedOptions.includes(index);

            let btnStyle = isDark
              ? 'border-slate-800 bg-slate-800/60 hover:bg-slate-800 hover:border-slate-700 text-slate-200'
              : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100/80 hover:border-stone-300 text-stone-800';

            let badgeStyle = isDark
              ? 'bg-slate-700 text-slate-300 group-hover:bg-slate-600'
              : 'bg-stone-200 text-stone-700 group-hover:bg-stone-300';

            if (isEliminated) {
              btnStyle =
                'opacity-20 pointer-events-none line-through border-slate-800 bg-transparent text-slate-500';
              badgeStyle = isDark ? 'bg-slate-800 text-slate-600' : 'bg-stone-100 text-stone-300';
            } else if (isAnswerSubmitted) {
              if (isCorrect) {
                btnStyle = isDark
                  ? 'border-emerald-500 bg-emerald-950/80 text-emerald-100 ring-2 ring-emerald-500/30'
                  : 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20';
                badgeStyle = 'bg-emerald-600 text-white';
              } else if (isSelected && !isCorrect) {
                btnStyle = isDark
                  ? 'border-rose-500 bg-rose-950/80 text-rose-100 ring-2 ring-rose-500/30'
                  : 'border-rose-500 bg-rose-50 text-rose-950 ring-2 ring-rose-500/20';
                badgeStyle = 'bg-rose-600 text-white';
              } else {
                btnStyle = isDark
                  ? 'opacity-30 border-slate-800 bg-slate-900 text-slate-500'
                  : 'opacity-40 border-stone-200 bg-stone-50 text-stone-600';
              }
            } else if (isSelected) {
              btnStyle = isDark
                ? 'border-indigo-400 bg-indigo-950/80 text-white ring-2 ring-indigo-400/30'
                : 'border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-600/30';
              badgeStyle = 'bg-indigo-600 text-white';
            }

            return (
              <button
                key={index}
                id={`btn-option-${index}`}
                disabled={isAnswerSubmitted || isEliminated}
                onClick={() => onSelectOption(index)}
                className={`group relative flex items-center justify-between p-4 rounded-2xl border-2 text-left font-medium transition-all ${btnStyle}`}
              >
                <div className="flex items-center gap-3 pr-2">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${badgeStyle}`}
                  >
                    {letter}
                  </span>
                  <span className="text-sm leading-snug">{option}</span>
                </div>

                {isAnswerSubmitted && isCorrect && (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                )}
                {isAnswerSubmitted && isSelected && !isCorrect && (
                  <XCircle className="h-5 w-5 shrink-0 text-rose-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Immediate Explanation Card */}
        <AnimatePresence>
          {isAnswerSubmitted && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div
                className={`rounded-2xl border p-4 mb-6 ${
                  selectedAnswer === question.correctAnswer
                    ? isDark
                      ? 'border-emerald-800/80 bg-emerald-950/60 text-emerald-200'
                      : 'border-emerald-200 bg-emerald-50/70 text-emerald-950'
                    : isDark
                    ? 'border-rose-800/80 bg-rose-950/60 text-rose-200'
                    : 'border-rose-200 bg-rose-50/70 text-rose-950'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {selectedAnswer === question.correctAnswer ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
                  ) : (
                    <Info className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
                  )}
                  <div className="text-xs sm:text-sm space-y-1.5">
                    <p className="font-bold">
                      {selectedAnswer === question.correctAnswer
                        ? 'Correct! Excellent deduction.'
                        : selectedAnswer === -1
                        ? 'Time is up! Here is the correct answer:'
                        : `Not quite! The correct answer is "${question.options[question.correctAnswer]}".`}
                    </p>
                    <p className="opacity-90 leading-relaxed">{question.explanation}</p>
                    {question.funFact && (
                      <div
                        className={`mt-2 flex items-start gap-1.5 rounded-xl p-2.5 text-xs border ${
                          isDark
                            ? 'bg-black/30 border-white/10 text-slate-300'
                            : 'bg-white/70 border-stone-200/50 text-stone-700'
                        }`}
                      >
                        <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-400 mt-0.5" />
                        <span>
                          <strong className={isDark ? 'text-white' : 'text-stone-900'}>
                            Did you know?
                          </strong>{' '}
                          {question.funFact}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Next Action Button */}
              <div className="flex items-center justify-between pt-2">
                <span
                  className={`text-xs hidden sm:inline ${
                    isDark ? 'text-slate-500' : 'text-stone-400'
                  }`}
                >
                  Tip: Press <kbd className="rounded px-1.5 py-0.5 text-[11px] font-mono border border-white/20">Enter</kbd> or <kbd className="rounded px-1.5 py-0.5 text-[11px] font-mono border border-white/20">Space</kbd> for next
                </span>
                <button
                  id="btn-next-question"
                  onClick={onNextQuestion}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-98 transition-all"
                >
                  <span>{questionNumber >= totalQuestions ? 'View Results' : 'Next Question'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
