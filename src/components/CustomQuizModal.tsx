import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Plus,
  Trash2,
  Save,
  Download,
  Upload,
  Play,
} from 'lucide-react';
import { CustomQuiz, Question, ThemeConfig } from '../types';
import { CATEGORIES } from '../data/defaultQuestions';

interface CustomQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveQuiz: (quiz: CustomQuiz) => void;
  onPlayQuiz: (quiz: CustomQuiz) => void;
  currentTheme: ThemeConfig;
}

export const CustomQuizModal: React.FC<CustomQuizModalProps> = ({
  isOpen,
  onClose,
  onSaveQuiz,
  onPlayQuiz,
  currentTheme,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('all');
  const [questions, setQuestions] = useState<
    Array<{
      question: string;
      options: [string, string, string, string];
      correctAnswer: number;
      explanation: string;
      difficulty: 'easy' | 'medium' | 'hard';
    }>
  >([
    {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      difficulty: 'medium',
    },
  ]);
  const [error, setError] = useState<string | null>(null);

  const isDark = currentTheme.isDark;

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
        difficulty: 'medium',
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, text: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index].question = text;
      return updated;
    });
  };

  const handleOptionChange = (qIndex: number, optIndex: number, text: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const opts = [...updated[qIndex].options] as [string, string, string, string];
      opts[optIndex] = text;
      updated[qIndex].options = opts;
      return updated;
    });
  };

  const handleCorrectAnswerChange = (qIndex: number, optIndex: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex].correctAnswer = optIndex;
      return updated;
    });
  };

  const handleExplanationChange = (qIndex: number, text: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex].explanation = text;
      return updated;
    });
  };

  const validateAndBuildQuiz = (): CustomQuiz | null => {
    if (!title.trim()) {
      setError('Please provide a quiz title.');
      return null;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setError(`Question #${i + 1} prompt cannot be blank.`);
        return null;
      }
      for (let j = 0; j < 4; j++) {
        if (!q.options[j].trim()) {
          setError(`Option ${String.fromCharCode(65 + j)} in Question #${i + 1} cannot be empty.`);
          return null;
        }
      }
    }

    setError(null);
    const customQuizId = `custom-${Date.now()}`;
    const builtQuestions: Question[] = questions.map((q, idx) => ({
      id: `${customQuizId}-q${idx}`,
      category,
      difficulty: q.difficulty,
      question: q.question.trim(),
      options: q.options.map((o) => o.trim()),
      correctAnswer: q.correctAnswer,
      explanation: q.explanation.trim() || 'Custom question explanation.',
    }));

    return {
      id: customQuizId,
      title: title.trim(),
      description: description.trim() || 'User created custom quiz',
      category,
      createdAt: new Date().toLocaleDateString(),
      questions: builtQuestions,
    };
  };

  const handleSave = () => {
    const quiz = validateAndBuildQuiz();
    if (quiz) {
      onSaveQuiz(quiz);
      onClose();
    }
  };

  const handleSaveAndPlay = () => {
    const quiz = validateAndBuildQuiz();
    if (quiz) {
      onSaveQuiz(quiz);
      onPlayQuiz(quiz);
      onClose();
    }
  };

  const handleExportJSON = () => {
    const quiz = validateAndBuildQuiz();
    if (!quiz) return;
    const blob = new Blob([JSON.stringify(quiz, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '_') || 'custom_quiz'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content) as CustomQuiz;
        if (parsed.title && Array.isArray(parsed.questions)) {
          setTitle(parsed.title);
          setDescription(parsed.description || '');
          setCategory(parsed.category || 'all');
          setQuestions(
            parsed.questions.map((q) => ({
              question: q.question,
              options: [q.options[0] || '', q.options[1] || '', q.options[2] || '', q.options[3] || ''],
              correctAnswer: q.correctAnswer ?? 0,
              explanation: q.explanation || '',
              difficulty: q.difficulty || 'medium',
            }))
          );
          setError(null);
        } else {
          setError('Invalid quiz file structure.');
        }
      } catch {
        setError('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className={`flex max-h-[90vh] w-full max-w-3xl flex-col rounded-3xl shadow-2xl overflow-hidden border transition-colors ${
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
          <div>
            <h2
              className={`text-lg font-bold ${
                isDark ? 'text-white' : 'text-stone-900'
              }`}
            >
              Custom Quiz Creator
            </h2>
            <p
              className={`text-xs ${
                isDark ? 'text-slate-400' : 'text-stone-500'
              }`}
            >
              Design your own question banks with custom subjects & explanations
            </p>
          </div>
          <button
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

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="rounded-2xl bg-rose-500/20 border border-rose-500/30 p-3 text-xs font-semibold text-rose-300">
              {error}
            </div>
          )}

          {/* Quiz Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                  isDark ? 'text-slate-400' : 'text-stone-600'
                }`}
              >
                Quiz Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Ultimate Astrophysics Quiz"
                className={`w-full rounded-2xl border px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                  isDark
                    ? 'border-slate-800 bg-slate-800/80 text-white placeholder:text-slate-500'
                    : 'border-stone-200 bg-white text-stone-900 placeholder:text-stone-400'
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                  isDark ? 'text-slate-400' : 'text-stone-600'
                }`}
              >
                Subject Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full rounded-2xl border px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                  isDark
                    ? 'border-slate-800 bg-slate-800/80 text-white'
                    : 'border-stone-200 bg-white text-stone-900'
                }`}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label
                className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                  isDark ? 'text-slate-400' : 'text-stone-600'
                }`}
              >
                Description (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A challenge test for classroom, study groups, or friends"
                className={`w-full rounded-2xl border px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                  isDark
                    ? 'border-slate-800 bg-slate-800/80 text-white placeholder:text-slate-500'
                    : 'border-stone-200 bg-white text-stone-900 placeholder:text-stone-400'
                }`}
              />
            </div>
          </div>

          {/* Questions Section */}
          <div
            className={`space-y-6 pt-4 border-t ${
              isDark ? 'border-slate-800' : 'border-stone-200'
            }`}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3
                className={`text-sm font-bold ${
                  isDark ? 'text-white' : 'text-stone-900'
                }`}
              >
                Questions ({questions.length})
              </h3>
              <div className="flex items-center gap-2">
                <label
                  className={`cursor-pointer inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isDark
                      ? 'border-slate-800 bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Import JSON</span>
                  <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                </label>
                <button
                  onClick={handleExportJSON}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isDark
                      ? 'border-slate-800 bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export JSON</span>
                </button>
              </div>
            </div>

            {questions.map((q, qIdx) => (
              <div
                key={qIdx}
                className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${
                  isDark
                    ? 'border-slate-800 bg-slate-800/40'
                    : 'border-stone-200 bg-stone-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex items-center gap-2 font-bold text-sm ${
                      isDark ? 'text-white' : 'text-stone-900'
                    }`}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                      {qIdx + 1}
                    </span>
                    Question Prompt
                  </span>

                  {questions.length > 1 && (
                    <button
                      onClick={() => handleRemoveQuestion(qIdx)}
                      className="text-stone-400 hover:text-rose-500 transition-colors"
                      title="Delete Question"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => handleQuestionChange(qIdx, e.target.value)}
                  placeholder="e.g., What is the chemical formula for water?"
                  className={`w-full rounded-2xl border px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    isDark
                      ? 'border-slate-700 bg-slate-900 text-white'
                      : 'border-stone-200 bg-white text-stone-900'
                  }`}
                />

                {/* 4 Options */}
                <div className="space-y-2">
                  <div
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isDark ? 'text-slate-400' : 'text-stone-500'
                    }`}
                  >
                    Answer Options (Select Radio for Correct Answer):
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isCorrect = q.correctAnswer === optIdx;

                      return (
                        <div
                          key={optIdx}
                          className={`flex items-center gap-2 rounded-2xl border p-2.5 ${
                            isCorrect
                              ? 'border-emerald-500 ring-1 ring-emerald-500/30'
                              : isDark
                              ? 'border-slate-700 bg-slate-900'
                              : 'border-stone-200 bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`correct-${qIdx}`}
                            checked={isCorrect}
                            onChange={() => handleCorrectAnswerChange(qIdx, optIdx)}
                            className="h-4 w-4 text-emerald-500 focus:ring-emerald-500 cursor-pointer ml-1"
                            title="Mark as correct answer"
                          />
                          <span className="text-xs font-bold opacity-60 w-4">{letter}</span>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                            placeholder={`Option ${letter}`}
                            className={`w-full bg-transparent text-xs font-medium focus:outline-none ${
                              isDark ? 'text-white' : 'text-stone-800'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <label
                    className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                      isDark ? 'text-slate-400' : 'text-stone-500'
                    }`}
                  >
                    Explanation / Rationale (Optional)
                  </label>
                  <input
                    type="text"
                    value={q.explanation}
                    onChange={(e) => handleExplanationChange(qIdx, e.target.value)}
                    placeholder="Brief explanation shown upon answering"
                    className={`w-full rounded-2xl border px-3 py-2 text-xs font-medium focus:outline-none ${
                      isDark
                        ? 'border-slate-700 bg-slate-900 text-white'
                        : 'border-stone-200 bg-white text-stone-800'
                    }`}
                  />
                </div>
              </div>
            ))}

            <button
              onClick={handleAddQuestion}
              className={`w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-3 text-xs font-bold transition-all ${
                isDark
                  ? 'border-slate-700 text-slate-300 hover:border-indigo-400 hover:text-indigo-300'
                  : 'border-stone-300 text-stone-700 hover:border-indigo-500 hover:text-indigo-700 hover:bg-indigo-50/50'
              }`}
            >
              <Plus className="h-4 w-4" />
              <span>Add Another Question</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className={`flex items-center justify-between border-t p-4 ${
            isDark ? 'border-slate-800 bg-slate-950/60' : 'border-stone-200 bg-stone-50'
          }`}
        >
          <button
            onClick={onClose}
            className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors ${
              isDark
                ? 'text-slate-400 hover:bg-slate-800'
                : 'text-stone-600 hover:bg-stone-200/60'
            }`}
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-bold transition-colors ${
                isDark
                  ? 'border-slate-700 bg-slate-800 text-white hover:bg-slate-700'
                  : 'border-stone-300 bg-white text-stone-800 hover:bg-stone-50'
              }`}
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save to My Quizzes</span>
            </button>

            <button
              onClick={handleSaveAndPlay}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-98 transition-all"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Save & Play</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
