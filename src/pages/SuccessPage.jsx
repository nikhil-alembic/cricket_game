import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

function StatItem({ icon, text, border }) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-4 sm:px-6 ${
        border ? "border-x border-white/20" : ""
      }`}
    >
      <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl">{icon}</div>
      <p className="mt-2 text-center text-base font-semibold text-white sm:text-lg md:text-xl">
        {text}
      </p>
    </div>
  );
}

export default function SuccessPage() {
    const {day} = useParams()
  const navigate = useNavigate()

  const [game_data, setGamedata] = useState({})

    const handleTodayScore = async () => {
      try {
        const emp_code = JSON.parse(
          localStorage.getItem("user") ?? "{}",
        ).emp_code;
  
        const res = await fetch(
          "https://alembicdigilabs.com/corporate_com/ho_cricket_activity/backend/game_day.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ emp_code, game_day: day }),
          },
        );
  
        if (!res.ok) {
          throw new Error(`Server responded with ${res.status}`);
        }
  
        const data = await res.json(); // <-- await here
  
        if (data.status) {
          setGamedata(data);
        }
      } catch (error) {
        console.error("Start API Error:", error);
      }
    };
  
    useEffect(() => {
      handleTodayScore();
    });

  return (
    <main className="relative flex min-h-dvh w-full flex-col overflow-hidden bg-black">
      {/* Background */}
      <div className="absolute inset-0 bg-[url('/bg_02.png')] bg-cover bg-center bg-no-repeat blur-xs" />

      {/* Top bar logos */}
      <div className="absolute inset-x-0 top-0 z-10 flex w-full items-start justify-between px-4 pt-4 sm:px-8 sm:pt-6 lg:px-12">
        <img
          src="/alembic_white_logo.svg"
          alt="Alembic"
          className="w-28 sm:w-36 md:w-44 lg:w-48"
        />
        <img
          src="/game_logo.png"
          alt="Hit the Century"
          className="w-32 sm:w-40 md:w-48 lg:w-56"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center gap-8 px-4 py-24 sm:gap-12 sm:py-28 lg:gap-16">
        {/* Ball + centered score */}
        <div className="relative flex items-center justify-center">
          <img
            src="/ball.png"
            alt=""
            className="w-132 max-sm:w-82"
          />
          <p className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-black mb-40 max-sm:text-4xl max-sm:mb-24">
            {game_data?.game_day_run}
          </p>
        </div>

        {/* Stats card */}
        <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl">
          <div className="w-full overflow-hidden rounded-[28px] border border-white/20 bg-white/10 backdrop-blur-md">
            <div className="grid grid-cols-3 items-center py-6 sm:py-8">
              <StatItem icon="🔥" text={`Day ${day}`} />
              <StatItem icon="🏏" text={game_data?.game_day_run} border />
              <StatItem icon="📊" text={`${game_data?.myrank} Rank`} />
            </div>

            <div className="border-t border-white/20 py-4 text-center sm:py-5">
              <button
                className="text-base font-semibold text-white underline underline-offset-4 transition hover:opacity-80 sm:text-lg lg:text-xl"
                onClick={() => navigate("/leaderboard")}
              >
                View Leaderboard →
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
