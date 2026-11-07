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
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatSpan(ms: number) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h.toLocaleString()}h ${m}m` : `${m}m`;
}

export function formatDuration(arrival: string, departure: string) {
  return formatSpan(
    new Date(departure).getTime() - new Date(arrival).getTime(),
  );
}
