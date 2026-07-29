import { useEffect, useMemo, useRef, useState } from "react";
import QuizCard from "../components/QuizCard";
import questionsByDay from "../data/questions.json";
import { useNavigate } from "react-router";
import { getNameInitials } from "../utilities/hepler";

/**
 * Small stat row used inside the profile ribbon (streak / runs / rank)
 */
function StatItem({ icon, value, label }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-4xl leading-none">{icon}</span>
      <span className="mt-1 text-md font-bold leading-none">{value}</span>
      <span className="mt-0.5 text-[16px] font-medium uppercase tracking-wide text-white/70">
        {label}
      </span>
    </div>
  );
}

export default function HomePage() {
  const videoRef = useRef(null);

  const [userDetails, setUserDetails] = useState({});
  const [started, setStarted] = useState(false);
  const [videoSrc, setVideoSrc] = useState("/bowler.mp4");
  const [currentIndex, setCurrentIndex] = useState(0);

  const dayKey = `day${userDetails?.game_day}`;
  // const questions = useMemo(() => questionsByDay[dayKey] ?? [], [dayKey]);
 const shuffleArray = (array) => {
   const shuffled = [...array];

   for (let i = shuffled.length - 1; i > 0; i--) {
     const j = Math.floor(Math.random() * (i + 1));
     [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
   }

   return shuffled;
 };

  const questions = useMemo(() => {
    return shuffleArray(questionsByDay[dayKey] ?? []);
  }, [dayKey]);

  console.log(questions);

  const [scores, setScores] = useState([]);
  const [questionModal, setQuestionModal] = useState(false);
  const [quizRes, setQuizRes] = useState([]);
  const navigate = useNavigate();
  const [activeScore, setActiveScore] = useState(0);

  useEffect(() => {
    if (!started) return;

    videoRef.current?.play().catch(console.error);
  }, [videoSrc, started]);

  const handleStartApi = async () => {
    try {
      const emp_code = JSON.parse(
        localStorage.getItem("user") ?? "{}",
      ).emp_code;

      const res = await fetch(
        "https://alembicdigilabs.com/corporate_com/ho_cricket_activity/backend/start.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ emp_code }),
        },
      );

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json(); // <-- await here

      if (data.status) {
        setUserDetails(data);
      }
    } catch (error) {
      console.error("Start API Error:", error);
    }
  };

  useEffect(() => {
    handleStartApi();
  }, []);

  // console.log(userDetails)

  const handleStart = () => {
    setStarted(true);
    videoRef.current?.play();
  };

  const handleVideoEnd = () => {
    if (currentIndex + 1 <= questions.length) {
      setQuestionModal(true);
    }
  };

  // const handleVideoEnd = () => {
  //   const isResultVideo = Object.values(videoMapping).includes(videoSrc);

  //   if (isResultVideo) {
  //     // A result clip (single/four/six/wicket) just finished — advance
  //     if (currentIndex + 1 <= questions.length) {
  //       setQuestionModal(false);

  //       if (currentIndex === 5) {
  //         setTimeout(() => {
  //           navigate(`success/${userDetails?.game_day}`);
  //         }, 1000);
  //       } else {
  //         setVideoSrc("/bowler.mp4");
  //       }

  //       setCurrentIndex((i) => i + 1);
  //     } else {
  //       setQuestionModal(false);
  //     }
  //     return;
  //   }

  //   // The bowler video just finished — show the next question
  //   if (currentIndex + 1 <= questions.length) {
  //     setQuestionModal(true);
  //   }
  // };

  const videoMapping = {
    W: "/wicket.mp4",
    1: "/single.mp4",
    4: "/four.mp4",
    6: "/six.mp4",
  };

  const optionMapping = {
    A: 1,
    B: 2,
    C: 3,
    D: 4,
  };
  const handleAnswer = async (result) => {
    setScores((prev) => [...prev, result.runs]);
    setVideoSrc(videoMapping[result?.runs]);
    setQuestionModal(false);

    // const delay = window.innerWidth < 768 ? 1250 : 3000;

    // setTimeout(() => {
    //   setQuestionModal(false);
    // }, delay);

    const newEntry = {
      qid: result?.questionId,
      selected_option_id: optionMapping[result?.answer],
      response_time: result?.timeTaken,
      scored_run: result?.runs === "W" ? 0 : result?.runs,
    };

    const updatedQuizRes = [...quizRes, newEntry];
    setQuizRes(updatedQuizRes);

    if (currentIndex + 1 === questions.length) {
      handleQuizRes(updatedQuizRes); // pass the real, complete array directly
    }

    setTimeout(() => {
      if (currentIndex + 1 <= questions.length) {
        setQuestionModal(false);
        if (currentIndex == 5) {
          setTimeout(() => {
            navigate(`success/${userDetails?.game_day}`);
          }, 1000);
        } else {
          setVideoSrc("/bowler.mp4");
        }
        setCurrentIndex((i) => i + 1);
      } else {
        setQuestionModal(false);
      }
    }, 7000);
  };

  // const handleAnswer = async (result) => {
  //   setScores((prev) => [...prev, result.runs]);
  //   setVideoSrc(videoMapping[result?.runs]);

  //   const delay = window.innerWidth < 768 ? 1250 : 3000;
  //   setTimeout(() => {
  //     setQuestionModal(false);
  //   }, delay);

  //   const newEntry = {
  //     qid: result?.questionId,
  //     selected_option_id: optionMapping[result?.answer],
  //     response_time: result?.timeTaken,
  //     scored_run: result?.runs === "W" ? 0 : result?.runs,
  //   };

  //   const updatedQuizRes = [...quizRes, newEntry];
  //   setQuizRes(updatedQuizRes);

  //   if (currentIndex + 1 === questions.length) {
  //     handleQuizRes(updatedQuizRes);
  //   }
  // };

  const emp_code = JSON.parse(localStorage.getItem("user") ?? "{}").emp_code;
  const handleQuizRes = async (responses) => {
    const data = {
      emp_code: emp_code,
      day: userDetails?.game_day,
      responses,
    };

    try {
      const res = await fetch(
        "https://alembicdigilabs.com/corporate_com/ho_cricket_activity/backend/submit_response.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
    } catch (err) {
      console.error("Failed to submit quiz answer:", err);
    }
  };

  const userName = JSON.parse(localStorage.getItem("user") ?? "{}").emp_name;

  return (
    <main className="relative flex min-h-dvh w-full flex-col justify-between overflow-hidden bg-black lg:flex-row">
      {/* Background video */}
      <video
        // key={videoSrc}
        src={videoSrc}
        ref={videoRef}
        muted
        playsInline
        onEnded={handleVideoEnd}
        className="absolute inset-0 h-full w-full object-cover"
      >
        {/* <source src={videoSrc} type="video/mp4" /> */}
      </video>

      {/* Hero section */}
      {/* Logo */}
      <div className="absolute left-4 top-4 z-20 sm:left-6 sm:top-6">
        <img
          src="/alembic_white_logo.svg"
          alt="Alembic"
          className="w-48 max-sm:w-36"
        />
      </div>

      {!started && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/20 bg-white/10 p-8 text-white shadow-2xl backdrop-blur-xl">
            <img
              src="/game_logo.png"
              alt="Hit the Century"
              className="w-42 sm:w-56 m-auto"
            />

            <p className="mb-6 text-center text-white/80">
              Read the rules before starting the game.
            </p>

            <div className="space-y-4 rounded-2xl bg-white/5 p-5">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📋</span>
                <p>
                  6 Questions: <strong>2 Easy, 2 Medium, 2 Hard</strong>
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">🏏</span>
                <p>
                  Easy = <strong>1 Run</strong> • Medium ={" "}
                  <strong>4 Runs</strong> • Hard = <strong>6 Runs</strong>
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">🎯</span>
                <p>One attempt per question.</p>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <p>No negative marking.</p>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">🏆</span>
                <p>Score the highest runs to climb the leaderboard.</p>
              </div>
            </div>

            {userDetails?.game_day_play_status && (
              <p className="mt-4 text-center text-white">
                You have already submitted today's game.
              </p>
            )}

            {userDetails?.game_timeout && (
              <p className="mt-4 text-center text-red-300">
                The time to play today's game has expired.
              </p>
            )}

            {!userDetails?.game_day_play_status &&
              !userDetails?.game_timeout && (
                <button
                  onClick={handleStart}
                  className="mt-4 w-full rounded-2xl bg-blue-600 py-4 text-2xl font-bold text-white transition-all duration-200 hover:bg-blue-500 hover:scale-[1.02] active:scale-95"
                >
                  ▶ Start Game
                </button>
              )}

            <div className="py-4 text-center sm:py-5">
              <button
                className="text-base font-semibold text-white underline underline-offset-4 transition hover:opacity-80 sm:text-lg lg:text-xl"
                onClick={() => navigate("/leaderboard")}
              >
                View Leaderboard →
              </button>
            </div>
          </div>
        </div>
      )}
      {/* left indicator */}
      <div className="flex justify-center items-center ml-4 max-md:hidden">
        <div className="relative w-fit">
          <img className="w-[160px]" src="/frame_bg.png" alt="" />

          <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
            {/* Avatar */}
            <div className="z-10 -mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-base font-bold shadow-lg sm:h-14 sm:w-14 sm:text-lg">
              {getNameInitials(userName)}
            </div>

            {/* Ribbon body */}
            <div className="w-full px-1 pb-10 pt-6 text-center text-white text-[20px]">
              <p className="font-semibold leading-tight">{userName}</p>
              <div className="mt-8 flex flex-col gap-3">
                <StatItem
                  icon="🔥"
                  // value={userDetails?.game_day}
                  label={`Day ${userDetails?.game_day}`}
                />
                <StatItem
                  icon="🏏"
                  value={
                    Number(userDetails?.total_runs ?? 0) +
                    scores.reduce(
                      (accumulator, currentValue) =>
                        accumulator + (currentValue === "W" ? 0 : currentValue),
                      0,
                    )
                  }
                  label="Runs"
                />
                <StatItem icon="📊" value={userDetails.rank} label="Rank" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {questionModal && (
        <div className="flex h-dvh justify-center items-center">
          <div className="relative flex w-full h-fit items-start justify-center p-3 bg-white m-4 rounded-4xl sm:p-4  lg:w-[420px] lg:shrink-0 lg:rounded-[2.5rem] lg:p-5">
            <QuizCard
              key={questions[currentIndex]}
              question={questions[currentIndex]}
              previousScores={scores}
              onAnswer={handleAnswer}
              totalQuestions={questions.length}
            />
          </div>
        </div>
      )}
    </main>
  );
}
