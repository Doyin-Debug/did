import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Trophy,
  PlusCircle,
  RotateCcw,
  Sparkles,
  Sun,
  Moon,
  Palette,
  Check,
  User,
  LogOut,
  LogIn,
  Cloud,
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { ThemeConfig, ThemeId } from '../types';
import { THEMES } from '../utils/theme';
import { UserProfile, loginWithGoogle, logoutUser } from '../firebase';

interface NavbarProps {
  onOpenStats: () => void;
  onOpenCustomQuiz: () => void;
  onHomeClick: () => void;
  isQuizActive: boolean;
  onResetQuiz?: () => void;
  customQuizCount?: number;
  currentTheme: ThemeConfig;
  onSelectTheme: (themeId: ThemeId) => void;
  userProfile?: UserProfile | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenStats,
  onOpenCustomQuiz,
  onHomeClick,
  isQuizActive,
  onResetQuiz,
  customQuizCount = 0,
  currentTheme,
  onSelectTheme,
  userProfile,
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const handleToggleSound = () => {
    const nextState = soundManager.toggleMute();
    setIsMuted(nextState);
    if (!nextState) {
      soundManager.playClick();
    }
  };

  const handleQuickThemeToggle = () => {
    soundManager.playClick();
    if (currentTheme.isDark) {
      onSelectTheme('modern-light');
    } else {
      onSelectTheme('dark-midnight');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsAuthLoading(true);
      await loginWithGoogle();
      setShowUserMenu(false);
    } catch (e) {
      console.error('Google sign in error:', e);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
      setShowUserMenu(false);
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  return (
    <header
      className={`sticky top-0 z-30 w-full border-b backdrop-blur-md transition-colors duration-200 ${
        currentTheme.isDark
          ? 'border-white/10 bg-black/40 text-slate-100'
          : 'border-stone-200/80 bg-white/90 text-stone-900'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <button
          id="btn-brand-home"
          onClick={onHomeClick}
          className="group flex items-center gap-2.5 text-left focus:outline-none"
        >
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md transition-transform group-hover:scale-105"
            style={{ backgroundColor: currentTheme.accentColor }}
          >
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span
                className={`font-black tracking-tight text-lg leading-none ${
                  currentTheme.isDark ? 'text-white' : 'text-stone-900'
                }`}
              >
                QUIZ
              </span>
              <span className="rounded-lg px-2 py-0.5 text-xs font-extrabold uppercase tracking-wide bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 shadow-sm">
                PRO
              </span>
            </div>
            <p
              className={`text-[11px] font-medium leading-none mt-1 ${
                currentTheme.isDark ? 'text-slate-400' : 'text-stone-500'
              }`}
            >
              Knowledge & Trivia Arena
            </p>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {isQuizActive && onResetQuiz && (
            <button
              id="btn-exit-quiz"
              onClick={onResetQuiz}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                currentTheme.isDark
                  ? 'border-white/15 text-slate-300 hover:bg-white/10 hover:text-white'
                  : 'border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
              title="Quit to Menu"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Exit Quiz</span>
            </button>
          )}

          <button
            id="btn-custom-quiz"
            onClick={onOpenCustomQuiz}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              currentTheme.isDark
                ? 'border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'
                : 'border-stone-200 bg-stone-50/70 text-stone-700 hover:bg-stone-100'
            }`}
          >
            <PlusCircle className="h-3.5 w-3.5" style={{ color: currentTheme.accentColor }} />
            <span className="hidden xs:inline">Create Quiz</span>
            {customQuizCount > 0 && (
              <span
                className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  currentTheme.isDark ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                {customQuizCount}
              </span>
            )}
          </button>

          <button
            id="btn-open-stats"
            onClick={onOpenStats}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              currentTheme.isDark
                ? 'border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'
                : 'border-stone-200 bg-stone-50/70 text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Stats & Rank</span>
          </button>

          {/* Theme Switcher Dropdown */}
          <div className="relative">
            <button
              id="btn-theme-picker"
              onClick={() => setShowThemePicker(!showThemePicker)}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                currentTheme.isDark
                  ? 'border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'
                  : 'border-stone-200 bg-stone-50/70 text-stone-700 hover:bg-stone-100'
              }`}
              title="Change UI Theme"
            >
              <Palette className="h-3.5 w-3.5" style={{ color: currentTheme.accentColor }} />
              <span className="hidden md:inline">{currentTheme.name}</span>
            </button>

            {showThemePicker && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowThemePicker(false)}
                />
                <div
                  className={`absolute right-0 mt-2 z-50 w-64 rounded-2xl border p-2.5 shadow-2xl backdrop-blur-xl transition-all ${
                    currentTheme.isDark
                      ? 'border-slate-800 bg-slate-900/98 text-slate-100'
                      : 'border-stone-200 bg-white/98 text-stone-900'
                  }`}
                >
                  <div className="px-2.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Select UI Theme
                  </div>
                  <div className="space-y-1">
                    {THEMES.map((t) => {
                      const isSelected = t.id === currentTheme.id;
                      return (
                        <button
                          key={t.id}
                          id={`btn-select-theme-${t.id}`}
                          onClick={() => {
                            soundManager.playClick();
                            onSelectTheme(t.id);
                            setShowThemePicker(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                            isSelected
                              ? currentTheme.isDark
                                ? 'bg-white/15 text-white ring-1 ring-white/20'
                                : 'bg-indigo-50 text-indigo-900 ring-1 ring-indigo-200'
                              : currentTheme.isDark
                              ? 'text-slate-300 hover:bg-white/10'
                              : 'text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className="h-4 w-4 rounded-full shadow-xs border border-white/30"
                              style={{ backgroundColor: t.accentColor }}
                            />
                            <span>{t.name}</span>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Light / Dark Toggle */}
          <button
            id="btn-quick-theme-toggle"
            onClick={handleQuickThemeToggle}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
              currentTheme.isDark
                ? 'border-white/15 text-amber-300 hover:bg-white/10'
                : 'border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
            title={currentTheme.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme mode"
          >
            {currentTheme.isDark ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </button>

          {/* Sound Mute Toggle */}
          <button
            id="btn-toggle-sound"
            onClick={handleToggleSound}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
              currentTheme.isDark
                ? 'border-white/15 text-slate-300 hover:bg-white/10'
                : 'border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
            title={isMuted ? 'Unmute audio' : 'Mute audio'}
            aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-slate-400" />
            ) : (
              <Volume2 className="h-4 w-4" style={{ color: currentTheme.accentColor }} />
            )}
          </button>

          {/* Firebase Auth & Cloud Sync Button */}
          <div className="relative">
            <button
              id="btn-user-profile"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`flex items-center gap-1.5 rounded-lg border p-1 sm:px-2.5 sm:py-1 text-xs font-semibold transition-all ${
                currentTheme.isDark
                  ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-950/40'
                  : 'border-emerald-200 bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100'
              }`}
              title="Firebase Cloud Account"
            >
              {userProfile?.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt={userProfile.displayName}
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-[11px]">
                  {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : <Cloud className="h-3.5 w-3.5" />}
                </div>
              )}
              <span className="hidden lg:inline max-w-[90px] truncate">
                {userProfile?.displayName || 'Cloud Connected'}
              </span>
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div
                  className={`absolute right-0 mt-2 z-50 w-72 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${
                    currentTheme.isDark
                      ? 'border-slate-800 bg-slate-900 text-slate-100'
                      : 'border-stone-200 bg-white text-stone-900'
                  }`}
                >
                  <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Cloud className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm leading-tight">
                        {userProfile?.displayName || 'Quiz Pioneer'}
                      </div>
                      <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Firebase Firestore Synced
                      </div>
                    </div>
                  </div>

                  <div className="py-3 space-y-1 text-xs">
                    <div className="flex justify-between py-1 px-1 text-slate-400">
                      <span>Total Cloud Score</span>
                      <span className="font-bold text-amber-400">
                        {(userProfile?.totalScore || 0).toLocaleString()} pts
                      </span>
                    </div>
                    <div className="flex justify-between py-1 px-1 text-slate-400">
                      <span>Quizzes Completed</span>
                      <span className="font-bold text-slate-200">
                        {userProfile?.quizzesPlayed || 0}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 space-y-2">
                    {userProfile?.isAnonymous !== false ? (
                      <button
                        onClick={handleGoogleSignIn}
                        disabled={isAuthLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
                      >
                        <LogIn className="h-3.5 w-3.5" />
                        <span>Sign in with Google</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-colors"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
