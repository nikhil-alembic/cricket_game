import { useEffect, useState } from "react";
import { getNameInitials, sec_to_minutes } from "../utilities/hepler";
import { useNavigate } from "react-router";

// Visual styling per podium rank — swap/extend as needed once real data comes in
const PODIUM_STYLE = {
  1: {
    bar: "from-yellow-400 to-amber-500",
    badge: "bg-amber-500",
    height: "h-40 sm:h-48",
  },
  2: {
    bar: "from-violet-400 to-purple-500",
    badge: "bg-purple-500",
    height: "h-32 sm:h-40",
  },
  3: {
    bar: "from-sky-300 to-blue-400",
    badge: "bg-sky-400",
    height: "h-28 sm:h-32",
  },
  4: {
    bar: "from-teal-300 to-emerald-400",
    badge: "bg-teal-400",
    height: "h-24 sm:h-28",
  },
  5: {
    bar: "from-orange-400 to-red-400",
    badge: "bg-orange-500",
    height: "h-20 sm:h-24",
  },
};

// Classic podium "wave" order: 1st in the center, flanked by 2nd/3rd, then 5th/4th on the outside
const PODIUM_ORDER = [4, 1, 0, 2, 3]; // indices into a rank-sorted top-5 array


function PodiumSpot({ player }) {
  const style = PODIUM_STYLE[player.rank_position] ?? PODIUM_STYLE[5];

  return (
    <div className="flex flex-1 flex-col items-center">
      {/* Avatar */}
      <div className="z-10 -mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sm font-bold text-blue-700 shadow-lg sm:h-14 sm:w-14 sm:text-base">
        {getNameInitials(player?.emp_name) ?? "NN"}
      </div>

      {/* Colored bar */}
      <div
        className={`flex w-full flex-col items-center justify-end rounded-t-2xl bg-gradient-to-b px-2 pb-3 pt-6 text-center ${style.bar} ${style.height}`}
      >
        <p className="text-[11px] font-semibold leading-tight text-white sm:text-sm pb-2">
          {player.emp_name}
        </p>
      </div>

      {/* Rank badge */}
      <div
        className={`-mt-4 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white ring-4 ring-white/20 sm:h-10 sm:w-10 ${style.badge}`}
      >
        {player.rank_position}
      </div>
    </div>
  );
}

function ListRow({ player }) {
  return (
    <div className="grid grid-cols-[auto_1.5fr_1fr_1fr] items-center gap-3 border-b border-white/10 px-4 py-4 last:border-b-0 sm:px-6">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white">
        {player.rank_position}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white sm:text-base">
          {player.emp_name}
        </p>
        <p className="text-xs text-white/60">Division : {player.division}</p>
      </div>

      <div className="text-center">
        <p className="text-sm font-bold text-white sm:text-base">
          {sec_to_minutes(player.total_time)}
        </p>
        <p className="text-[11px] text-white/60">Time to respond</p>
      </div>

      <div className="text-center">
        <p className="text-sm font-bold text-white sm:text-base">
          {player.total_run}
        </p>
        <p className="text-[11px] text-white/60">Runs Scored</p>
      </div>
    </div>
  );
}

// Placeholder data — replace with the API response once it's ready.
// Shape: { rank, initials, name, division, timeToRespond, runs }
// const MOCK_TOP_5 = [
//   { rank: 1, initials: "JM", name: "Jayesh Mishra" },
//   { rank: 2, initials: "NN", name: "Nikhil Nadkar" },
//   { rank: 3, initials: "HG", name: "Harsh Gohil" },
//   { rank: 4, initials: "BS", name: "Balgovind Shanbhag" },
//   { rank: 5, initials: "GB", name: "Gautam Baranwal" },
// ];

// const MOCK_REST = [
//   {
//     rank: 6,
//     name: "Arjun Verma",
//     division: "Ouron",
//     timeToRespond: "3m 49s",
//     runs: 104,
//   },
//   {
//     rank: 7,
//     name: "Ravi Desai",
//     division: "Ouron",
//     timeToRespond: "6m 54s",
//     runs: 100,
//   },
//   {
//     rank: 8,
//     name: "Suresh Patil",
//     division: "Ouron",
//     timeToRespond: "8m 30s",
//     runs: 100,
//   },
//   {
//     rank: 9,
//     name: "Vikram Rao",
//     division: "Ouron",
//     timeToRespond: "10m 47s",
//     runs: 94,
//   },
// ];

/**
 * @param {Object} props
 * @param {Array} [props.top5] - top 5 players, sorted by rank ascending (1..5)
 * @param {Array} [props.rest] - remaining ranked players (6+)
 */
export function LeaderBoard() {
  const [search, setSearch] = useState("");
  const [leaderboardData, setLeaderboardData] = useState([])
  const navigate = useNavigate()
  
  const top5 = leaderboardData?.slice(0, 5);
  const rest = leaderboardData?.slice(5);

  console.log(leaderboardData, top5, rest)

  const podiumPlayers = PODIUM_ORDER.map((i) => top5[i]).filter(Boolean);
  const filteredRest = rest.filter((p) =>
    p.emp_name.toLowerCase().includes(search.toLowerCase()),
  );

    const handleLeaderBoard = async () => {
      try {
        const res = await fetch(
          "https://alembicdigilabs.com/corporate_com/ho_cricket_activity/backend/leaderboard.php",
          {
            method: "GET",
          },
        );
  
        if (!res.ok) {
          throw new Error(`Server responded with ${res.status}`);
        }
  
        const data = await res.json(); // <-- await here
  
        if (data.status) {
          setLeaderboardData(data?.leaderboard);
        }
      } catch (error) {
        console.error("Start API Error:", error);
      }
    };
  
    useEffect(() => {
      handleLeaderBoard();
    }, []);

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
      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-24 sm:py-28 max-h-[940px]">
        <div className="overflow-hidden rounded-[28px] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-md">
          {/* Ribbon header */}
          <div className="relative flex justify-center pb-2">
            <div
              className="flex h-48 w-full items-center justify-center bg-blue-800 sm:h-20"
              style={{
                clipPath: "polygon(0 0, 100% 0, 100% 55%, 50% 100%, 0 55%)",
              }}
            >
              <h1 className="pb-4 text-2xl font-extrabold tracking-wide text-white sm:pb-6 sm:text-3xl">
                LEADERBOARD
              </h1>
            </div>
          </div>

          {/* Search */}
          <div className="px-5 pb-6 pt-3 sm:px-8">
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-sm sm:py-3">
              <svg
                className="h-4 w-4 shrink-0 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M17 10.5A6.5 6.5 0 1 1 4 10.5a6.5 6.5 0 0 1 13 0Z"
                />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for a player"
                className="w-full bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
              />
            </div>
          </div>

          {/* Podium — top 5 */}
          <div className="flex items-end gap-1.5 px-3 pb-6 sm:gap-3 sm:px-6">
            {podiumPlayers.map((player) => (
              <PodiumSpot key={player.rank_position} player={player} />
            ))}
          </div>

          {/* Ranked list — 6th onward */}
          <div className="max-h-72 overflow-y-auto border-t border-white/20 sm:max-h-96">
            {filteredRest.length > 0 ? (
              filteredRest.map((player) => (
                <ListRow key={player.rank_position} player={player} />
              ))
            ) : (
              <p className="px-6 py-8 text-center text-sm text-white/60">
                No players match "{search}"
              </p>
            )}
          </div>
        </div>
        <button className="px-8 py-3 border-white border-1 rounded-lg bg-white/10 text-white font-bold mt-8 mx-auto" onClick={() => navigate('/')}>
            Back to game
        </button>
      </div>
    </main>
  );
}
