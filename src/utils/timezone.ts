export function formatTimeWithZone(date: Date, timeZone: string): string {
  return date.toLocaleTimeString('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

export function getTimezoneForLocation(city?: string, country?: string): string {
  const loc = `${city || ''} ${country || ''}`.toLowerCase();
  if (loc.includes('london') || loc.includes('united kingdom') || loc.includes('uk')) {
    return 'Europe/London';
  }
  if (loc.includes('dubai') || loc.includes('uae') || loc.includes('abu dhabi')) {
    return 'Asia/Dubai';
  }
  if (loc.includes('singapore')) {
    return 'Asia/Singapore';
  }
  if (loc.includes('seattle') || loc.includes('san francisco') || loc.includes('los angeles') || loc.includes('california')) {
    return 'America/Los_Angeles';
  }
  if (loc.includes('chicago') || loc.includes('dallas') || loc.includes('houston') || loc.includes('texas')) {
    return 'America/Chicago';
  }
  if (loc.includes('new york') || loc.includes('boston') || loc.includes('toronto') || loc.includes('canada') || loc.includes('usa') || loc.includes('united states')) {
    return 'America/New_York';
  }
  if (loc.includes('sydney') || loc.includes('melbourne') || loc.includes('australia')) {
    return 'Australia/Sydney';
  }
  if (
    loc.includes('india') ||
    loc.includes('chennai') ||
    loc.includes('mumbai') ||
    loc.includes('delhi') ||
    loc.includes('bangalore') ||
    loc.includes('bengaluru') ||
    loc.includes('pune') ||
    loc.includes('hyderabad') ||
    loc.includes('kolkata')
  ) {
    return 'Asia/Kolkata';
  }
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
  } catch {
    return 'Asia/Kolkata';
  }
}

export function formatLiveClock(date: Date, timeZone: string): string {
  try {
    const timeStr = date.toLocaleTimeString('en-US', {
      timeZone,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    if (timeZone === 'Asia/Kolkata') {
      return `${timeStr} IST`;
    }
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'short'
    }).formatToParts(date);
    const tzAbbr = parts.find((p) => p.type === 'timeZoneName')?.value || '';
    return tzAbbr ? `${timeStr} ${tzAbbr}` : timeStr;
  } catch {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  }
}

/**
 * Returns formatted timezone label for the coordinator view
 * Example output: "Dad · Chennai · 8:05 PM IST"
 */
export function formatTimeForCoordinator(
  utcOrIsoString: string,
  personName: string = 'Dad',
  city: string = 'Chennai',
  timeZone: string = 'Asia/Kolkata'
): string {
  try {
    const date = new Date(utcOrIsoString);
    const localTime = date.toLocaleTimeString('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    // Strip leading zeroes if any, normalise format
    const cleanedTime = localTime.replace(/^0/, '');
    return `${personName} · ${city} · ${cleanedTime} IST`;
  } catch {
    return `${personName} · ${city} · 8:05 PM IST`;
  }
}

/**
 * Returns local time formatted for the parent view
 * Example output: "8:05 PM"
 */
export function formatTimeForParent(
  utcOrIsoString: string,
  timeZone: string = 'Asia/Kolkata'
): string {
  try {
    const date = new Date(utcOrIsoString);
    const localTime = date.toLocaleTimeString('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return localTime.replace(/^0/, '');
  } catch {
    return '8:05 PM';
  }
}
