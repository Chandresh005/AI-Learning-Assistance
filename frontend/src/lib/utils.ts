/**
 * Formats a duration in seconds to a human-readable mm:ss or hh:mm:ss string.
 */
export function formatTimestamp(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const floorSec = Math.floor(seconds);
  const hrs = Math.floor(floorSec / 3600);
  const mins = Math.floor((floorSec % 3600) / 60);
  const secs = floorSec % 60;

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
