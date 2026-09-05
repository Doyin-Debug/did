import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  CheckCircle2,
  XCircle,
  Filter,
} from 'lucide-react';
import { ThemeConfig, UserAnswer } from '../types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAnswers: UserAnswer[];
  currentTheme: ThemeConfig;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  userAnswers,
  currentTheme,
}) => {
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all');
  const isDark = currentTheme.isDark;

  if (!isOpen) return null;

  const filteredAnswers = userAnswers.filter((item) => {
    if (filter === 'correct') return item.isCorrect;
    if (filter === 'incorrect') return !item.isCorrect;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className={`flex max-h-[85vh] w-full max-w-2xl flex-col rounded-3xl shadow-2xl overflow-hidden border transition-colors ${
          isDark
            ? 'border-slate-800 bg-slate-900 text-slate-100'
            : 'border-stone-200 bg-white text-stone-900'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between border-b px-6 py-4 ${
            isDark
              ? 'border-slate-800 bg-slate-950/60'
              : 'border-stone-200 bg-stone-50/70'
          }`}
        >
          <div>
            <h2
              className={`text-lg font-bold ${
                isDark ? 'text-white' : 'text-stone-900'
              }`}
            >
              Quiz Answers Review
            </h2>
            <p
              className={`text-xs ${
                isDark ? 'text-slate-400' : 'text-stone-500'
              }`}
            >
              Detailed breakdown of questions, your selections, and explanations
            </p>
          </div>
          <button
            id="btn-close-review"
            onClick={onClose}
            className={`rounded-lg p-1.5 transition-colors ${
              isDark
                ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                : 'text-stone-400 hover:bg-stone-200/60 hover:text-stone-700'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div
          className={`flex items-center gap-2 border-b px-6 py-2.5 ${
            isDark ? 'border-slate-800 bg-slate-900' : 'border-stone-100 bg-white'
          }`}
        >
          <span
            className={`text-xs font-semibold mr-1 flex items-center gap-1 ${
              isDark ? 'text-slate-400' : 'text-stone-400'
            }`}
          >
            <Filter className="h-3 w-3" /> Filter:
          </span>
          <button
            onClick={() => setFilter('all')}
            className={`rounded-xl px-3 py-1 text-xs font-semibold transition-all ${
              filter === 'all'
                ? isDark
                  ? 'bg-white text-black'
                  : 'bg-stone-900 text-white'
                : isDark
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All ({userAnswers.length})
          </button>
          <button
            onClick={() => setFilter('correct')}
            className={`rounded-xl px-3 py-1 text-xs font-semibold transition-all ${
              filter === 'correct'
                ? 'bg-emerald-600 text-white'
                : isDark
                ? 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Correct ({userAnswers.filter((a) => a.isCorrect).length})
          </button>
          <button
            onClick={() => setFilter('incorrect')}
            className={`rounded-xl px-3 py-1 text-xs font-semibold transition-all ${
              filter === 'incorrect'
                ? 'bg-rose-600 text-white'
                : isDark
                ? 'bg-rose-950/60 text-rose-300 hover:bg-rose-900/60'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Missed ({userAnswers.filter((a) => !a.isCorrect).length})
          </button>
        </div>

        {/* Questions Scrollable List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredAnswers.length === 0 ? (
            <div className="py-12 text-center text-sm opacity-60">
              No questions found under this filter.
            </div>
          ) : (
            filteredAnswers.map((item, index) => {
              return (
                <div
                  key={item.questionId || index}
                  className={`rounded-2xl border p-4 transition-all ${
                    item.isCorrect
                      ? isDark
                        ? 'border-emerald-900/60 bg-emerald-950/20'
                        : 'border-emerald-200 bg-emerald-50/30'
                      : isDark
                      ? 'border-rose-900/60 bg-rose-950/20'
                      : 'border-rose-200 bg-rose-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded text-[11px] font-bold ${
                          isDark
                            ? 'bg-slate-800 text-slate-300'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <h3
                        className={`font-bold text-sm ${
                          isDark ? 'text-white' : 'text-stone-900'
                        }`}
                      >
                        {item.question}
                      </h3>
                    </div>
                    {item.isCorrect ? (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-bold text-emerald-400 shrink-0">
                        <CheckCircle2 className="h-3 w-3" /> Correct
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 text-[11px] font-bold text-rose-400 shrink-0">
                        <XCircle className="h-3 w-3" /> Missed
                      </span>
                    )}
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-3 text-xs">
                    {item.options.map((opt, optIdx) => {
                      const isUserChoice = item.selectedAnswer === optIdx;
                      const isCorrectChoice = item.correctAnswer === optIdx;

                      let rowClass = isDark
                        ? 'border-slate-800 bg-slate-800/50 text-slate-300'
                        : 'border-stone-200 bg-white text-stone-600';

                      if (isCorrectChoice) {
                        rowClass = isDark
                          ? 'border-emerald-500 bg-emerald-950/80 text-emerald-100 font-bold'
                          : 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                      } else if (isUserChoice && !isCorrectChoice) {
                        rowClass = isDark
                          ? 'border-rose-500 bg-rose-950/80 text-rose-100 font-bold line-through'
                          : 'border-rose-500 bg-rose-50 text-rose-950 font-bold line-through';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`flex items-center justify-between p-2 rounded-xl border ${rowClass}`}
                        >
                          <span>
                            {String.fromCharCode(65 + optIdx)}. {opt}
                          </span>
                          {isCorrectChoice && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                          {isUserChoice && !isCorrectChoice && <XCircle className="h-3.5 w-3.5 text-rose-500" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Callout */}
                  <div
                    className={`rounded-xl p-3 text-xs border ${
                      isDark
                        ? 'bg-slate-800/80 text-slate-300 border-slate-700/60'
                        : 'bg-stone-100/90 text-stone-700 border-stone-200/60'
                    }`}
                  >
                    <strong
                      className={`block mb-0.5 ${
                        isDark ? 'text-white' : 'text-stone-900'
                      }`}
                    >
                      Rationale:
                    </strong>
                    {item.explanation}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`border-t p-4 text-right ${
            isDark ? 'border-slate-800 bg-slate-950/60' : 'border-stone-200 bg-stone-50'
          }`}
        >
          <button
            onClick={onClose}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition-colors"
          >
            Close Review
          </button>
        </div>
      </motion.div>
    </div>
  );
};
