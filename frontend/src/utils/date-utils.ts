/**
 * Formats a time string (HH:MM) for display
 */
export function formatTime(time: string): string {
  if (!time) return "";
  return time;
}

/**
 * Calculates the time difference between two time strings (HH:MM) in hours
 * @returns Time difference in hours (with decimal precision)
 */
export function calculateTimeDifference(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;

  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  // Calculate total minutes for start and end
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  // Calculate difference in minutes
  let diffMinutes = endTotalMinutes - startTotalMinutes;
  
  // Handle overnight shifts
  if (diffMinutes < 0) {
    diffMinutes += 24 * 60; // Add 24 hours in minutes
  }

  // Convert back to hours with decimal precision
  return parseFloat((diffMinutes / 60).toFixed(2));
}

/**
 * Formats hours as a string with 2 decimal places
 */
export function formatHours(hours: number): string {
  return hours.toFixed(2);
}
