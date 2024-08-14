export const formatDuration = (duration) => {
  const hours = String(Math.floor(duration / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((duration % 3600) / 60)).padStart(2, "0");
  const seconds = String(duration % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};
