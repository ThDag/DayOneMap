function formatInZone(
  iso: string,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
) {
  const date = new Date(iso);
  try {
    return date.toLocaleString(undefined, { ...options, timeZone });
  } catch {
    // Intl throws on an unrecognised zone name; show browser time instead of crashing.
    return date.toLocaleString(undefined, options);
  }
}

export function formatDate(iso: string, timeZone: string) {
  return formatInZone(iso, timeZone, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatDateShort(iso: string, timeZone: string) {
  return formatInZone(iso, timeZone, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(iso: string, timeZone: string) {
  return formatInZone(iso, timeZone, {
    hour: "2-digit",
    minute: "2-digit",
  });
}
