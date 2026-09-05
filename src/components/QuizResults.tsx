import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Flame,
  BookOpen,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { QuizResult, ThemeConfig } from '../types';
import { soundManager } from '../utils/audio';

interface QuizResultsProps {
  result: QuizResult;
  onPlayAgain: () => void;
  onNewQuiz: () => void;
  onOpenReview: () => void;
  onRetryMissed: () => void;
  currentTheme: ThemeConfig;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  result,
  onPlayAgain,
  onNewQuiz,
  onOpenReview,
  onRetryMissed,
  currentTheme,
}) => {
  const [copied, setCopied] = useState(false);
  const isDark = currentTheme.isDark;

  useEffect(() => {
    if (result.accuracy >= 60) {
      soundManager.playVictory();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#f59e0b', '#10b981', '#ec4899'],
        });
      } catch {
        // Confetti fallback
      }
    }
  }, [result.accuracy]);

  const getRank = (accuracy: number) => {
    if (accuracy === 100)
      return {
        title: 'Trivia Grandmaster',
        color: isDark
          ? 'text-amber-400 bg-amber-950/60 border-amber-800'
          : 'text-amber-600 bg-amber-50 border-amber-200',
      };
    if (accuracy >= 80)
      return {
        title: 'Mastermind Scholar',
        color: isDark
          ? 'text-indigo-300 bg-indigo-950/60 border-indigo-800'
          : 'text-indigo-600 bg-indigo-50 border-indigo-200',
      };
    if (accuracy >= 60)
      return {
        title: 'Knowledge Explorer',
        color: isDark
          ? 'text-emerald-300 bg-emerald-950/60 border-emerald-800'
          : 'text-emerald-600 bg-emerald-50 border-emerald-200',
      };
    if (accuracy >= 40)
      return {
        title: 'Curious Learner',
        color: isDark
          ? 'text-sky-300 bg-sky-950/60 border-sky-800'
          : 'text-sky-600 bg-sky-50 border-sky-200',
      };
    return {
      title: 'Trivia Apprentice',
      color: isDark
        ? 'text-slate-300 bg-slate-800 border-slate-700'
        : 'text-stone-600 bg-stone-100 border-stone-200',
    };
  };

  const rank = getRank(result.accuracy);
  const missedCount = result.incorrectCount + result.skippedCount;

  const handleShare = () => {
    const text = `🧠 QUIZ PRO Scorecard!\n🏆 Score: ${result.score.toLocaleString()} pts\n🎯 Accuracy: ${result.accuracy}%\n🔥 Max Streak: ${result.maxStreak}\n📚 Subject: ${result.categoryTitle}\nTry beating my score!`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`rounded-3xl border p-6 sm:p-10 shadow-2xl text-center transition-colors ${
          isDark
            ? 'border-slate-800 bg-slate-900/95 text-slate-100'
            : 'border-stone-200 bg-white text-stone-900'
        }`}
      >
        {/* Top Trophy Icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-amber-950 shadow-lg shadow-amber-500/20">
          <Trophy className="h-8 w-8" />
        </div>

        {/* Rank Badge */}
        <div
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold border ${rank.color} mb-2`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>{rank.title}</span>
        </div>

        <h1
          className={`text-2xl sm:text-3xl font-black tracking-tight ${
            isDark ? 'text-white' : 'text-stone-900'
          }`}
        >
          Quiz Completed!
        </h1>
        <p
          className={`text-xs sm:text-sm mt-1 ${
            isDark ? 'text-slate-400' : 'text-stone-500'
          }`}
        >
          {result.categoryTitle} • {result.mode.toUpperCase()}
        </p>

        {/* Score & Accuracy Hero */}
        <div className="my-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-6 text-white shadow-xl border border-indigo-500/20">
          <div className="text-xs uppercase tracking-widest text-indigo-200 font-bold">
            Total Score
          </div>
          <div className="text-4xl sm:text-5xl font-black tracking-tight text-white my-1">
            {result.score.toLocaleString()}
            <span className="text-base sm:text-lg font-medium text-indigo-300 ml-1">pts</span>
          </div>
          <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-white/10 text-xs text-indigo-100 font-medium">
            <span>
              Accuracy: <strong className="text-white text-sm">{result.accuracy}%</strong>
            </span>
            <span>•</span>
            <span>
              Correct:{' '}
              <strong className="text-emerald-400 text-sm">
                {result.correctCount}/{result.totalQuestions}
              </strong>
            </span>
          </div>
        </div>

        {/* 4 Key Stat Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6 text-left">
          <div
            className={`rounded-2xl border p-3.5 transition-colors ${
              isDark
                ? 'border-slate-800 bg-slate-800/60'
                : 'border-stone-200 bg-stone-50/70'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-medium mb-1 opacity-70">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Correct</span>
            </div>
            <div
              className={`text-lg font-bold ${
                isDark ? 'text-white' : 'text-stone-900'
              }`}
            >
              {result.correctCount}
            </div>
          </div>

          <div
            className={`rounded-2xl border p-3.5 transition-colors ${
              isDark
                ? 'border-slate-800 bg-slate-800/60'
                : 'border-stone-200 bg-stone-50/70'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-medium mb-1 opacity-70">
              <XCircle className="h-3.5 w-3.5 text-rose-500" />
              <span>Incorrect</span>
            </div>
            <div
              className={`text-lg font-bold ${
                isDark ? 'text-white' : 'text-stone-900'
              }`}
            >
              {result.incorrectCount}
            </div>
          </div>

          <div
            className={`rounded-2xl border p-3.5 transition-colors ${
              isDark
                ? 'border-slate-800 bg-slate-800/60'
                : 'border-stone-200 bg-stone-50/70'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-medium mb-1 opacity-70">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              <span>Max Streak</span>
            </div>
            <div
              className={`text-lg font-bold ${
                isDark ? 'text-white' : 'text-stone-900'
              }`}
            >
              {result.maxStreak} 🔥
            </div>
          </div>

          <div
            className={`rounded-2xl border p-3.5 transition-colors ${
              isDark
                ? 'border-slate-800 bg-slate-800/60'
                : 'border-stone-200 bg-stone-50/70'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-medium mb-1 opacity-70">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              <span>Time</span>
            </div>
            <div
              className={`text-lg font-bold ${
                isDark ? 'text-white' : 'text-stone-900'
              }`}
            >
              {result.totalTimeSeconds}s
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              id="btn-play-again"
              onClick={onPlayAgain}
              className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-98 transition-all"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Play Again</span>
            </button>

            <button
              id="btn-review-answers"
              onClick={onOpenReview}
              className={`flex items-center justify-center gap-2 rounded-2xl border-2 py-3.5 px-4 text-sm font-bold active:scale-98 transition-all ${
                isDark
                  ? 'border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700 hover:border-slate-600'
                  : 'border-stone-200 bg-white text-stone-800 hover:bg-stone-50 hover:border-stone-300'
              }`}
            >
              <BookOpen className="h-4 w-4 text-indigo-400" />
              <span>Review All Answers</span>
            </button>
          </div>

          {missedCount > 0 && (
            <button
              id="btn-retry-missed"
              onClick={onRetryMissed}
              className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3 px-4 text-xs font-bold transition-colors ${
                isDark
                  ? 'bg-amber-950/60 border border-amber-800 text-amber-300 hover:bg-amber-900/60'
                  : 'bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Practice {missedCount} Missed Question{missedCount > 1 ? 's' : ''}</span>
            </button>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              id="btn-new-category"
              onClick={onNewQuiz}
              className={`text-xs font-semibold transition-colors ${
                isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              ← Choose Different Subject
            </button>

            <button
              id="btn-share-score"
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span>{copied ? 'Score copied to clipboard!' : 'Share Score'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
