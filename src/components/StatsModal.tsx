import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Trophy,
  Trash2,
  Users,
  Award,
  Flame,
  Cloud,
  Medal,
} from 'lucide-react';
import { OverallStats, getQuizHistory, clearAllHistory } from '../utils/storage';
import { QuizResult, ThemeConfig } from '../types';
import { LeaderboardEntry, subscribeToLeaderboard, UserProfile } from '../firebase';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: OverallStats;
  onStatsCleared: () => void;
  currentTheme: ThemeConfig;
  userProfile?: UserProfile | null;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  onStatsCleared,
  currentTheme,
  userProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'my-stats' | 'leaderboard'>('my-stats');
  const [history, setHistory] = useState<QuizResult[]>(() => getQuizHistory());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);

  const isDark = currentTheme.isDark;

  useEffect(() => {
    if (isOpen) {
      setHistory(getQuizHistory());
      const unsubscribe = subscribeToLeaderboard((entries) => {
        setLeaderboard(entries);
        setIsLoadingLeaderboard(false);
      });
      return () => unsubscribe();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClear = () => {
    if (window.confirm('Are you sure you want to reset your local quiz statistics and history?')) {
      clearAllHistory();
      setHistory([]);
      onStatsCleared();
    }
  };

  const overallAccuracy =
    stats.totalQuestionsAnswered > 0
      ? Math.round((stats.totalCorrect / stats.totalQuestionsAnswered) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className={`flex max-h-[88vh] w-full max-w-2xl flex-col rounded-3xl shadow-2xl overflow-hidden border transition-colors ${
          isDark
            ? 'border-slate-800 bg-slate-900 text-slate-100'
            : 'border-stone-200 bg-white text-stone-900'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between border-b px-6 py-4 ${
            isDark ? 'border-slate-800 bg-slate-950/60' : 'border-stone-200 bg-stone-50/70'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Trophy className="h-4 w-4" />
            </div>
            <div>
              <h2
                className={`text-base font-bold ${
                  isDark ? 'text-white' : 'text-stone-900'
                }`}
              >
                Performance & Rankings
              </h2>
              <p
                className={`text-xs ${
                  isDark ? 'text-slate-400' : 'text-stone-500'
                }`}
              >
                Connected to Firebase Firestore Cloud
              </p>
            </div>
          </div>
          <button
            id="btn-close-stats"
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

        {/* Tab Navigation */}
        <div className={`flex border-b px-6 pt-3 gap-3 ${isDark ? 'border-slate-800' : 'border-stone-200'}`}>
          <button
            onClick={() => setActiveTab('my-stats')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'my-stats'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>My Records & Logs</span>
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'leaderboard'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Global Cloud Leaderboard</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'my-stats' ? (
            <>
              {/* Cloud Sync Banner */}
              <div
                className={`flex items-center justify-between rounded-2xl border p-3.5 text-xs ${
                  isDark
                    ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
                    : 'border-emerald-200 bg-emerald-50/80 text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-emerald-400" />
                  <div>
                    <span className="font-bold">Firestore Cloud Sync Active:</span> Results and high scores are automatically backed up.
                  </div>
                </div>
                {userProfile && (
                  <span className="rounded-lg bg-emerald-500/20 px-2 py-0.5 font-extrabold text-[11px]">
                    {userProfile.totalScore.toLocaleString()} pts saved
                  </span>
                )}
              </div>

              {/* Key Stat Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div
                  className={`rounded-2xl border p-3.5 ${
                    isDark ? 'border-slate-800 bg-slate-800/60' : 'border-stone-200 bg-stone-50/60'
                  }`}
                >
                  <div className="text-xs opacity-70 font-medium">Quizzes Played</div>
                  <div className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-stone-900'}`}>
                    {stats.quizzesPlayed}
                  </div>
                </div>

                <div
                  className={`rounded-2xl border p-3.5 ${
                    isDark ? 'border-slate-800 bg-slate-800/60' : 'border-stone-200 bg-stone-50/60'
                  }`}
                >
                  <div className="text-xs opacity-70 font-medium">Highest Score</div>
                  <div className="text-2xl font-black text-indigo-400 mt-1">
                    {stats.highestScore.toLocaleString()}
                  </div>
                </div>

                <div
                  className={`rounded-2xl border p-3.5 ${
                    isDark ? 'border-slate-800 bg-slate-800/60' : 'border-stone-200 bg-stone-50/60'
                  }`}
                >
                  <div className="text-xs opacity-70 font-medium">Overall Accuracy</div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    {overallAccuracy}%
                  </div>
                </div>

                <div
                  className={`rounded-2xl border p-3.5 ${
                    isDark ? 'border-slate-800 bg-slate-800/60' : 'border-stone-200 bg-stone-50/60'
                  }`}
                >
                  <div className="text-xs opacity-70 font-medium">Total Questions</div>
                  <div className={`text-xl font-bold mt-1 ${isDark ? 'text-white' : 'text-stone-900'}`}>
                    {stats.totalQuestionsAnswered}
                  </div>
                </div>

                <div
                  className={`rounded-2xl border p-3.5 ${
                    isDark ? 'border-slate-800 bg-slate-800/60' : 'border-stone-200 bg-stone-50/60'
                  }`}
                >
                  <div className="text-xs opacity-70 font-medium">Correct Answers</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">{stats.totalCorrect}</div>
                </div>

                <div
                  className={`rounded-2xl border p-3.5 ${
                    isDark ? 'border-slate-800 bg-slate-800/60' : 'border-stone-200 bg-stone-50/60'
                  }`}
                >
                  <div className="text-xs opacity-70 font-medium">Best Streak</div>
                  <div className="text-xl font-bold text-amber-400 mt-1">{stats.bestStreak} 🔥</div>
                </div>
              </div>

              {/* Recent Quiz Logs */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-stone-900'}`}>
                    Recent Quiz Logs
                  </h3>
                  <span className="text-xs opacity-60">{history.length} records</span>
                </div>

                {history.length === 0 ? (
                  <div
                    className={`rounded-2xl border border-dashed p-8 text-center text-xs ${
                      isDark ? 'border-slate-800 text-slate-500' : 'border-stone-200 text-stone-500'
                    }`}
                  >
                    No quiz history yet. Complete a quiz to see your game logs here!
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {history.slice(0, 15).map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between rounded-xl border p-3 text-xs ${
                          isDark
                            ? 'border-slate-800 bg-slate-800/40 text-slate-200'
                            : 'border-stone-200 bg-white text-stone-900'
                        }`}
                      >
                        <div>
                          <div className="font-bold">
                            {item.categoryTitle} •{' '}
                            <span className="uppercase text-[11px] opacity-70">
                              {item.mode}
                            </span>
                          </div>
                          <div className="text-[11px] opacity-60 mt-0.5">
                            {item.date} • {item.correctCount}/{item.totalQuestions} correct
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-extrabold">{item.score} pts</div>
                          <div className="text-[11px] font-semibold text-emerald-400">
                            {item.accuracy}% acc
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Cloud Leaderboard Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">Real-time Global Rankings</h3>
                  <p className="text-xs text-slate-400">Top players across all QUIZ PRO challenges</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Firestore Sync
                </div>
              </div>

              {isLoadingLeaderboard ? (
                <div className="flex flex-col items-center justify-center p-12 text-slate-400 text-xs gap-2">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                  Loading leaderboard from Firebase...
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-xs text-slate-400">
                  No scores submitted yet. Play a quiz to be the first champion on the leaderboard!
                </div>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {leaderboard.map((entry, index) => {
                    const isTop1 = index === 0;
                    const isTop2 = index === 1;
                    const isTop3 = index === 2;

                    return (
                      <div
                        key={entry.id || entry.userId}
                        className={`flex items-center justify-between rounded-2xl border p-3.5 text-xs transition-all ${
                          isTop1
                            ? 'border-amber-400/40 bg-amber-500/10'
                            : isTop2
                            ? 'border-slate-400/30 bg-slate-400/5'
                            : isTop3
                            ? 'border-amber-700/30 bg-amber-700/5'
                            : isDark
                            ? 'border-slate-800 bg-slate-800/40'
                            : 'border-stone-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-xl font-black text-sm">
                            {isTop1 ? (
                              <span className="text-amber-400">🥇</span>
                            ) : isTop2 ? (
                              <span className="text-slate-300">🥈</span>
                            ) : isTop3 ? (
                              <span className="text-amber-600">🥉</span>
                            ) : (
                              <span className="text-slate-400">#{index + 1}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-sm flex items-center gap-1.5">
                              <span>{entry.displayName || 'Quiz Pioneer'}</span>
                              {entry.bestStreak > 3 && (
                                <span className="flex items-center text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded-md">
                                  <Flame className="h-2.5 w-2.5 mr-0.5" />
                                  {entry.bestStreak}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] opacity-60 mt-0.5">
                              {entry.quizzesPlayed} quizzes • {entry.accuracy}% accuracy
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-base font-black text-amber-400">
                            {entry.totalScore.toLocaleString()}
                          </div>
                          <div className="text-[10px] font-semibold text-slate-400 uppercase">
                            Points
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-between border-t p-4 ${
            isDark ? 'border-slate-800 bg-slate-950/60' : 'border-stone-200 bg-stone-50'
          }`}
        >
          {activeTab === 'my-stats' ? (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Reset Local Stats</span>
            </button>
          ) : (
            <div className="text-xs text-slate-400">
              Live updates enabled via Firestore
            </div>
          )}
          <button
            onClick={onClose}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
