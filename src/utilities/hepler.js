export const getNameInitials = (name = "") => {
  const titles = [
    "dr",
    "dr.",
    "mr",
    "mr.",
    "mrs",
    "mrs.",
    "ms",
    "ms.",
    "prof",
    "prof.",
  ];

  const words = name
    .trim()
    .split(/\s+/)
    .filter((word) => !titles.includes(word.toLowerCase()));

  if (words.length === 0) return "";
  if (words.length === 1) return words[0][0].toUpperCase();

  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};


export const sec_to_minutes = (time = 0) => {
  const minutes = Math.floor(time / 60);
  const sec = time % 60;

  return `${minutes}m ${String(sec).padStart(2, "0")}s`;
};