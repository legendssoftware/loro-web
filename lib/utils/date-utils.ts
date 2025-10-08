/**
 * Formats a date into a human-readable string
 * @param date The date to format
 * @param options Optional Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
): string => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return new Intl.DateTimeFormat('en-ZA', options).format(date);
};

/**
 * Formats a date to display only the date part (no time)
 * @param date The date to format
 * @returns Formatted date string (date only)
 */
export const formatDateOnly = (date: Date): string => {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Calculates the relative time (e.g., "2 days ago", "in 3 hours")
 * @param date The date to calculate relative time for
 * @returns Relative time string
 */
export const getRelativeTime = (date: Date): string => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid date';
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 0) {
    // Future date
    const absSeconds = Math.abs(diffInSeconds);

    if (absSeconds < 60) return `in ${absSeconds} seconds`;
    if (absSeconds < 3600) return `in ${Math.floor(absSeconds / 60)} minutes`;
    if (absSeconds < 86400) return `in ${Math.floor(absSeconds / 3600)} hours`;
    if (absSeconds < 2592000) return `in ${Math.floor(absSeconds / 86400)} days`;
    if (absSeconds < 31536000) return `in ${Math.floor(absSeconds / 2592000)} months`;
    return `in ${Math.floor(absSeconds / 31536000)} years`;
  } else {
    // Past date
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  }
};
