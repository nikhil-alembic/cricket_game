"use client";

import { useCallback, useEffect, useState } from "react";

const difficultyColor = {
  Easy: "bg-green-600",
  Medium: "bg-orange-500",
  Hard: "bg-red-600",
};

/**
 * @param {Object} props
 * @param {Object} props.question - { id, question, options, correctAnswer, difficulty, runs, timeLimit, backgroundImage }
 * @param {Array<number|string>} props.previousScores - runs/"W" for questions already answered
 * @param {Function} props.onAnswer - ({ questionId, answer, timeTaken, runs }) => void
 */
export default function QuizCard({ question, previousScores, onAnswer, totalQuestions }) {
  const [timeLeft, setTimeLeft] = useState(question.timeLimit);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);

  // Reset local state whenever a new question is passed in
  useEffect(() => {
    setTimeLeft(question?.timeLimit);
    setSelected(null);
    setLocked(false);
  }, [question.id, question.timeLimit]);

  const submitAnswer = useCallback(
    (answer, secondsLeft) => {
      if (locked) return;
      setLocked(true);

      const timeTaken = question.timeLimit - secondsLeft;
      const isCorrect = answer !== null && answer === question.correctAnswer;
      const runs = isCorrect ? question.runs : "W";

      onAnswer({ questionId: question.id, answer, timeTaken, runs });
    },
    [locked, onAnswer, question],
  );

  // Countdown timer — auto-submits as a wicket if time runs out unanswered
  useEffect(() => {
    if (locked) return;
    if (timeLeft <= 0) {
      submitAnswer(null, 0);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, locked, submitAnswer]);

  const handleSelect = (optionId) => {
    if (locked) return;
    setSelected(optionId);
    submitAnswer(optionId, timeLeft);
  };

  const progressPct = (timeLeft / question.timeLimit) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeLabel = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="w-full max-w-sm rounded-[2rem] border-4 border-blue-500 bg-white shadow-xl p-3">
      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-2xl bg-cover bg-center px-5 pt-4 pb-8"
        style={{
          backgroundImage: `url(${question.backgroundImage ?? "/quiz_bg_default.jpg"})`,
        }}
      >
        <div className="absolute inset-0 bg-indigo-500" />

        {/* Progress bar + timer */}
        <div className="relative flex items-center gap-3">
          <div className="h-1.5 flex-1 rounded-full bg-white/40">
            <div
              className="h-full rounded-full bg-white transition-all duration-1000 ease-linear"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs font-semibold tabular-nums text-white">
            {timeLabel}
          </span>
        </div>

        {/* Difficulty badge */}
        <div className="relative mt-5 flex justify-center">
          <span
            className={`rounded-full px-4 py-1 text-xs font-bold text-white ${difficultyColor[question.difficulty]}`}
          >
            {question.difficulty}
          </span>
        </div>

        {/* Question */}
        <h2 className="relative mt-4 text-center text-xl font-extrabold leading-snug text-white">
          {question.question}
        </h2>
      </div>

      {/* Score trail (runs / wickets) — all slots shown from the start, filled in as answered */}
      <p className="text-xl mt-5 text-blue-600 font-bold text-center">Daily Innings</p>
      <div className="mt-5 flex items-center justify-center gap-2">
        {Array.from({ length: totalQuestions }).map((_, i) => {
          const isAnswered = i < previousScores.length;
          return (
            <span
              key={i}
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                isAnswered
                  ? "bg-blue-600 text-white"
                  : "border-2 border-blue-600 text-transparent"
              }`}
            >
              {isAnswered ? previousScores[i] : ""}
            </span>
          );
        })}
      </div>

      {/* Options */}
      <div className="mt-4 space-y-3 px-1 pb-1">
        {question.options.map((option) => {
          const isSelected = selected === option.id;
          const isCorrectOption =
            locked && option.id === question.correctAnswer;
          const isWrongSelected =
            locked && isSelected && option.id !== question.correctAnswer;

          return (
            <button
              key={option.id}
              type="button"
              disabled={locked}
              onClick={() => handleSelect(option.id)}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left transition ${
                isCorrectOption
                  ? "border-green-400 bg-green-50"
                  : isWrongSelected
                    ? "border-red-400 bg-red-50"
                    : "border-gray-100 bg-gray-50"
              } ${locked ? "cursor-default" : "cursor-pointer hover:border-blue-300"}`}
            >
              <span className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-300">
                  {option.id}
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {option.text}
                </span>
              </span>
              <span
                className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                  isSelected ? "border-blue-600 bg-blue-600" : "border-gray-300"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
