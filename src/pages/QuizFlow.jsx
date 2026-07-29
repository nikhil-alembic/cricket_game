"use client";

import { useMemo, useState } from "react";
import QuizCard from "../components/QuizCard";
import questionsByDay from "../data/questions.json";

/**
 * @param {Object} props
 * @param {number} props.day - which day's set of 3 questions to run (1–10)
 */
export default function QuizFlow({ day }) {
  const dayKey = `day${day}`;

  const questions = useMemo(() => questionsByDay[dayKey] ?? [], [dayKey]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState([]);
  const [finished, setFinished] = useState(false);

  const handleAnswer = async (result) => {
    // Update the score trail immediately so the UI feels responsive
    setScores((prev) => [...prev, result.runs]);

    // TODO: point this at your real endpoint once the backend is ready
    try {
      await fetch("/api/quiz/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day,
          questionId: result.questionId,
          answer: result.answer, // null if unanswered (time ran out)
          timeTaken: result.timeTaken,
          runs: result.runs, // number, or "W" for a wicket
        }),
      });
    } catch (err) {
      console.error("Failed to submit quiz answer:", err);
    }

    // Brief pause so the person sees the correct/incorrect highlight before advancing
    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((i) => i + 1);
      } else {
        setFinished(true);
      }
    }, 1200);
  };

  if (questions.length === 0) {
    return <p className="text-center text-white">No questions found for day {day}.</p>;
  }

  if (finished) {
    const totalRuns = scores
      .filter((s) => typeof s === "number")
      .reduce((a, b) => a + b, 0);
    const wickets = scores.filter((s) => s === "W").length;

    return (
      <div className="text-center text-white">
        <h2 className="text-2xl font-bold mb-2">Day {day} complete!</h2>
        <p className="text-sm opacity-80">
          Final score: {totalRuns} runs ({wickets} wicket{wickets === 1 ? "" : "s"})
        </p>
      </div>
    );
  }

  return (
    <QuizCard
      key={questions[currentIndex].id}
      question={questions[currentIndex]}
      previousScores={scores}
      onAnswer={handleAnswer}
    />
  );
}
