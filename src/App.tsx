import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CategorySelector } from './components/CategorySelector';
import { QuizCard } from './components/QuizCard';
import { QuizResults } from './components/QuizResults';
import { ReviewModal } from './components/ReviewModal';
import { StatsModal } from './components/StatsModal';
import { CustomQuizModal } from './components/CustomQuizModal';
import { DEFAULT_QUESTIONS, CATEGORIES } from './data/defaultQuestions';
import {
  CustomQuiz,
  Lifelines,
  Question,
  QuizConfig,
  QuizResult,
  ThemeConfig,
  ThemeId,
  UserAnswer,
} from './types';
import {
  getCustomQuizzes,
  getOverallStats,
  saveCustomQuiz,
  deleteCustomQuiz,
  saveQuizResult,
} from './utils/storage';
import { getSavedTheme, getThemeConfig, saveTheme } from './utils/theme';
import { soundManager } from './utils/audio';
import {
  auth,
  onAuthStateChanged,
  ensureAuth,
  syncUserProfile,
  UserProfile,
  saveCloudQuizResult,
  saveCloudCustomQuiz,
  deleteCloudCustomQuiz,
  subscribeToCustomQuizzes,
} from './firebase';

export default function App() {
  // Theme state
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(() => getSavedTheme());

  // Firebase user profile
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // App navigation state
  const [appState, setAppState] = useState<'menu' | 'quiz' | 'results'>('menu');

  // Quiz configuration
  const [config, setConfig] = useState<QuizConfig>({
    categoryId: 'all',
    difficulty: 'all',
    mode: 'classic',
    questionCount: 10,
    timePerQuestion: 15,
  });

  // Active quiz session states
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [lifelines, setLifelines] = useState<Lifelines>({
    fiftyFiftyUsed: false,
    freezeTimeUsed: false,
    skipUsed: false,
  });

  // Scoring & Stats for current quiz
  const [score, setScore] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [totalBlitzTimeLeft, setTotalBlitzTimeLeft] = useState(60);
  const [livesLeft, setLivesLeft] = useState(3);
  const [quizStartTime, setQuizStartTime] = useState<number>(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

  // Completed result
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  // Modals
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isCustomQuizOpen, setIsCustomQuizOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Storage data
  const [customQuizzes, setCustomQuizzes] = useState<CustomQuiz[]>([]);
  const [stats, setStats] = useState(getOverallStats());

  // Initialize Firebase Auth & Real-time Listeners
  useEffect(() => {
    ensureAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      const profile = await syncUserProfile(user);
      setUserProfile(profile);
    });

    const unsubQuizzes = subscribeToCustomQuizzes((cloudList) => {
      if (cloudList && cloudList.length > 0) {
        const localList = getCustomQuizzes();
        const mergedMap = new Map<string, CustomQuiz>();
        cloudList.forEach((q) => mergedMap.set(q.id, q));
        localList.forEach((q) => {
          if (!mergedMap.has(q.id)) mergedMap.set(q.id, q);
        });
        setCustomQuizzes(Array.from(mergedMap.values()));
      }
    });

    return () => {
      unsubscribeAuth();
      unsubQuizzes();
    };
  }, []);

  // Load custom quizzes & stats on mount
  useEffect(() => {
    setCustomQuizzes(getCustomQuizzes());
    setStats(getOverallStats());
  }, []);

  // Synchronize document root and body theme styles
  useEffect(() => {
    const active = getThemeConfig(currentTheme?.id);
    const root = document.documentElement;
    if (active.isDark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    document.body.className = `${active.bgClass} min-h-screen transition-colors duration-300`;
  }, [currentTheme]);

  const handleSelectTheme = (themeId: ThemeId) => {
    const updated = saveTheme(themeId);
    setCurrentTheme(updated);
  };

  // Timer Effect
  useEffect(() => {
    if (appState !== 'quiz') return;

    // Blitz mode global 60s clock
    if (config.mode === 'blitz') {
      const blitzTimer = setInterval(() => {
        setTotalBlitzTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(blitzTimer);
            finishQuiz(userAnswers, score, maxStreak);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(blitzTimer);
    }

    // Classic & Survival modes per-question countdown
    if (config.mode === 'classic' || config.mode === 'survival') {
      if (isAnswerSubmitted) return;

      const questionTimer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(questionTimer);
            handleTimeExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(questionTimer);
    }
  }, [appState, config.mode, isAnswerSubmitted, userAnswers, score, maxStreak]);

  // Start a new quiz session
  const handleStartQuiz = (customQuestionSet?: Question[]) => {
    soundManager.playStart();
    let pool: Question[] = [];

    if (customQuestionSet && customQuestionSet.length > 0) {
      pool = [...customQuestionSet];
    } else {
      // Filter from DEFAULT_QUESTIONS
      pool = DEFAULT_QUESTIONS.filter((q) => {
        const matchCat = config.categoryId === 'all' || q.category === config.categoryId;
        const matchDiff = config.difficulty === 'all' || q.difficulty === config.difficulty;
        return matchCat && matchDiff;
      });

      // Fallback if empty filter
      if (pool.length === 0) {
        pool = DEFAULT_QUESTIONS.filter(
          (q) => config.categoryId === 'all' || q.category === config.categoryId
        );
      }
      if (pool.length === 0) {
        pool = DEFAULT_QUESTIONS;
      }
    }

    // Shuffle pool
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(config.questionCount, shuffled.length));

    setActiveQuestions(selected);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setEliminatedOptions([]);
    setLifelines({
      fiftyFiftyUsed: false,
      freezeTimeUsed: false,
      skipUsed: false,
    });

    setScore(0);
    setCurrentStreak(0);
    setMaxStreak(0);
    setUserAnswers([]);
    setLivesLeft(3);
    setTimeLeft(config.timePerQuestion);
    setTotalBlitzTimeLeft(60);

    setQuizStartTime(Date.now());
    setQuestionStartTime(Date.now());
    setAppState('quiz');
  };

  // Select an answer option
  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    soundManager.playClick();
    setSelectedAnswer(index);
    handleSubmitAnswer(index);
  };

  // Submit Answer
  const handleSubmitAnswer = (chosenIndex: number) => {
    setIsAnswerSubmitted(true);
    const currentQ = activeQuestions[currentIndex];
    if (!currentQ) return;

    const isCorrect = chosenIndex === currentQ.correctAnswer;
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);

    // Calculate score
    let pointsAwarded = 0;
    let newStreak = currentStreak;
    let newMaxStreak = maxStreak;

    if (isCorrect) {
      soundManager.playCorrect();
      newStreak += 1;
      if (newStreak > newMaxStreak) {
        newMaxStreak = newStreak;
      }

      // Base points by difficulty
      const basePoints =
        currentQ.difficulty === 'hard' ? 300 : currentQ.difficulty === 'medium' ? 200 : 100;

      // Speed bonus: max 100 points for fast answers
      const speedFactor = Math.max(0, (config.timePerQuestion - timeSpent) / config.timePerQuestion);
      const speedBonus = Math.round(speedFactor * 100);

      // Streak multiplier bonus
      const streakBonus = Math.min(newStreak * 25, 200);

      pointsAwarded = basePoints + speedBonus + streakBonus;
      setScore((prev) => prev + pointsAwarded);
      setCurrentStreak(newStreak);
      setMaxStreak(newMaxStreak);
    } else {
      soundManager.playIncorrect();
      newStreak = 0;
      setCurrentStreak(0);

      if (config.mode === 'survival') {
        const remainingLives = livesLeft - 1;
        setLivesLeft(remainingLives);
        if (remainingLives <= 0) {
          // Game over
          setTimeout(() => {
            const finalAnswers: UserAnswer[] = [
              ...userAnswers,
              {
                questionId: currentQ.id,
                question: currentQ.question,
                options: currentQ.options,
                selectedAnswer: chosenIndex,
                correctAnswer: currentQ.correctAnswer,
                isCorrect: false,
                explanation: currentQ.explanation,
                timeSpentSeconds: timeSpent,
              },
            ];
            finishQuiz(finalAnswers, score, newMaxStreak);
          }, 1200);
          return;
        }
      }
    }

    const answerRecord: UserAnswer = {
      questionId: currentQ.id,
      question: currentQ.question,
      options: currentQ.options,
      selectedAnswer: chosenIndex,
      correctAnswer: currentQ.correctAnswer,
      isCorrect,
      explanation: currentQ.explanation,
      timeSpentSeconds: timeSpent,
    };

    setUserAnswers((prev) => [...prev, answerRecord]);
  };

  // Time expired for question
  const handleTimeExpired = () => {
    if (isAnswerSubmitted) return;
    soundManager.playTimeUp();
    setIsAnswerSubmitted(true);
    setSelectedAnswer(-1); // -1 means timed out

    const currentQ = activeQuestions[currentIndex];
    if (!currentQ) return;

    setCurrentStreak(0);

    if (config.mode === 'survival') {
      const remaining = livesLeft - 1;
      setLivesLeft(remaining);
      if (remaining <= 0) {
        setTimeout(() => {
          const finalAnswers: UserAnswer[] = [
            ...userAnswers,
            {
              questionId: currentQ.id,
              question: currentQ.question,
              options: currentQ.options,
              selectedAnswer: -1,
              correctAnswer: currentQ.correctAnswer,
              isCorrect: false,
              explanation: `${currentQ.explanation} (Time expired)`,
              timeSpentSeconds: config.timePerQuestion,
            },
          ];
          finishQuiz(finalAnswers, score, maxStreak);
        }, 1200);
        return;
      }
    }

    const answerRecord: UserAnswer = {
      questionId: currentQ.id,
      question: currentQ.question,
      options: currentQ.options,
      selectedAnswer: -1,
      correctAnswer: currentQ.correctAnswer,
      isCorrect: false,
      explanation: `${currentQ.explanation} (Time expired)`,
      timeSpentSeconds: config.timePerQuestion,
    };

    setUserAnswers((prev) => [...prev, answerRecord]);
  };

  // Next Question
  const handleNextQuestion = () => {
    soundManager.playClick();
    const nextIdx = currentIndex + 1;

    if (nextIdx < activeQuestions.length) {
      setCurrentIndex(nextIdx);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
      setEliminatedOptions([]);
      setTimeLeft(config.timePerQuestion);
      setQuestionStartTime(Date.now());
    } else {
      finishQuiz(userAnswers, score, maxStreak);
    }
  };

  // Finish Quiz Session
  const finishQuiz = (answers: UserAnswer[], finalScore: number, highestStreak: number) => {
    soundManager.playComplete();
    const totalQ = answers.length;
    const correct = answers.filter((a) => a.isCorrect).length;
    const incorrect = answers.filter((a) => !a.isCorrect && a.selectedAnswer !== -1).length;
    const skipped = answers.filter((a) => a.selectedAnswer === -1).length;
    const accuracy = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;
    const totalTime = Math.round((Date.now() - quizStartTime) / 1000);

    const catObj = CATEGORIES.find((c) => c.id === config.categoryId);

    const resultData: QuizResult = {
      id: `result-${Date.now()}`,
      date: new Date().toLocaleDateString(),
      categoryTitle: catObj ? catObj.name : 'Custom Quiz',
      categoryId: config.categoryId,
      mode: config.mode,
      difficulty: config.difficulty,
      score: finalScore,
      totalQuestions: totalQ,
      correctCount: correct,
      incorrectCount: incorrect,
      skippedCount: skipped,
      accuracy,
      maxStreak: highestStreak,
      totalTimeSeconds: totalTime,
      userAnswers: answers,
    };

    setQuizResult(resultData);
    saveQuizResult(resultData);
    saveCloudQuizResult(resultData); // Sync with Firestore!
    setStats(getOverallStats());
    setAppState('results');
  };

  // Lifelines handler
  const handleUseLifeline = (type: 'fiftyFifty' | 'freezeTime' | 'skip') => {
    soundManager.playLifeline();
    const currentQ = activeQuestions[currentIndex];
    if (!currentQ) return;

    if (type === 'fiftyFifty') {
      const wrongIndices = currentQ.options
        .map((_, idx) => idx)
        .filter((idx) => idx !== currentQ.correctAnswer);
      const shuffledWrong = wrongIndices.sort(() => 0.5 - Math.random());
      const toEliminate = shuffledWrong.slice(0, 2);

      setEliminatedOptions(toEliminate);
      setLifelines((prev) => ({ ...prev, fiftyFiftyUsed: true }));
    } else if (type === 'freezeTime') {
      setTimeLeft((prev) => prev + 15);
      setLifelines((prev) => ({ ...prev, freezeTimeUsed: true }));
    } else if (type === 'skip') {
      setLifelines((prev) => ({ ...prev, skipUsed: true }));
      // Advance to next question without score penalty
      const answerRecord: UserAnswer = {
        questionId: currentQ.id,
        question: currentQ.question,
        options: currentQ.options,
        selectedAnswer: -1,
        correctAnswer: currentQ.correctAnswer,
        isCorrect: false,
        explanation: `${currentQ.explanation} (Skipped with Lifeline)`,
        timeSpentSeconds: Math.round((Date.now() - questionStartTime) / 1000),
      };
      const updatedAnswers = [...userAnswers, answerRecord];
      setUserAnswers(updatedAnswers);

      const nextIdx = currentIndex + 1;
      if (nextIdx < activeQuestions.length) {
        setCurrentIndex(nextIdx);
        setSelectedAnswer(null);
        setIsAnswerSubmitted(false);
        setEliminatedOptions([]);
        setTimeLeft(config.timePerQuestion);
        setQuestionStartTime(Date.now());
      } else {
        finishQuiz(updatedAnswers, score, maxStreak);
      }
    }
  };

  // Retry missed questions
  const handleRetryMissed = () => {
    if (!quizResult) return;
    const missedAnswerIds = quizResult.userAnswers
      .filter((a) => !a.isCorrect)
      .map((a) => a.questionId);

    const missedQuestions = activeQuestions.filter((q) =>
      missedAnswerIds.includes(q.id)
    );

    if (missedQuestions.length > 0) {
      handleStartQuiz(missedQuestions);
    }
  };

  // Custom Quiz creation & play
  const handleSaveCustomQuiz = (quiz: CustomQuiz) => {
    saveCustomQuiz(quiz);
    saveCloudCustomQuiz(quiz); // Sync with Firestore!
    setCustomQuizzes(getCustomQuizzes());
  };

  const handleDeleteCustomQuiz = (quizId: string) => {
    deleteCustomQuiz(quizId);
    deleteCloudCustomQuiz(quizId); // Sync with Firestore!
    setCustomQuizzes(getCustomQuizzes());
  };

  const handlePlayCustomQuiz = (quiz: CustomQuiz) => {
    setConfig((prev) => ({
      ...prev,
      categoryId: quiz.category || 'all',
      questionCount: quiz.questions.length,
    }));
    handleStartQuiz(quiz.questions);
  };

  const activeTheme = getThemeConfig(currentTheme?.id);

  return (
    <div
      className={`min-h-screen flex flex-col font-sans antialiased transition-colors duration-300 ${activeTheme.bgClass} ${activeTheme.textClass} selection:bg-indigo-500 selection:text-white`}
    >
      {/* Top Navigation */}
      <Navbar
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenCustomQuiz={() => setIsCustomQuizOpen(true)}
        onHomeClick={() => {
          soundManager.playClick();
          setAppState('menu');
        }}
        isQuizActive={appState === 'quiz'}
        onResetQuiz={() => {
          if (window.confirm('Quit this quiz session and return to menu?')) {
            setAppState('menu');
          }
        }}
        customQuizCount={customQuizzes.length}
        currentTheme={activeTheme}
        onSelectTheme={handleSelectTheme}
        userProfile={userProfile}
      />

      {/* Main App Body */}
      <main className="flex-1 pb-12">
        {appState === 'menu' && (
          <CategorySelector
            config={config}
            onConfigChange={(newCfg) => setConfig((prev) => ({ ...prev, ...newCfg }))}
            onStartQuiz={() => handleStartQuiz()}
            customQuizzes={customQuizzes}
            onDeleteCustomQuiz={handleDeleteCustomQuiz}
            onPlayCustomQuiz={handlePlayCustomQuiz}
            totalAvailableQuestions={DEFAULT_QUESTIONS.length}
            currentTheme={activeTheme}
          />
        )}

        {appState === 'quiz' && activeQuestions.length > 0 && (
          <QuizCard
            question={activeQuestions[currentIndex]}
            questionNumber={currentIndex + 1}
            totalQuestions={activeQuestions.length}
            mode={config.mode}
            timeLeft={timeLeft}
            totalBlitzTimeLeft={totalBlitzTimeLeft}
            livesLeft={livesLeft}
            score={score}
            currentStreak={currentStreak}
            lifelines={lifelines}
            onUseLifeline={handleUseLifeline}
            onSelectOption={handleSelectOption}
            onNextQuestion={handleNextQuestion}
            selectedAnswer={selectedAnswer}
            isAnswerSubmitted={isAnswerSubmitted}
            eliminatedOptions={eliminatedOptions}
            currentTheme={activeTheme}
          />
        )}

        {appState === 'results' && quizResult && (
          <QuizResults
            result={quizResult}
            onPlayAgain={() => handleStartQuiz(activeQuestions)}
            onNewQuiz={() => setAppState('menu')}
            onOpenReview={() => setIsReviewOpen(true)}
            onRetryMissed={handleRetryMissed}
            currentTheme={activeTheme}
          />
        )}
      </main>

      {/* Modals */}
      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        userAnswers={quizResult?.userAnswers || []}
        currentTheme={activeTheme}
      />

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
        onStatsCleared={() => setStats(getOverallStats())}
        currentTheme={activeTheme}
        userProfile={userProfile}
      />

      <CustomQuizModal
        isOpen={isCustomQuizOpen}
        onClose={() => setIsCustomQuizOpen(false)}
        onSaveQuiz={handleSaveCustomQuiz}
        onPlayQuiz={handlePlayCustomQuiz}
        currentTheme={activeTheme}
      />
    </div>
  );
}
