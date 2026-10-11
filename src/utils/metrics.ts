export const formatRelativeTime = (isoString?: string): string => {
  if (!isoString) return 'Never';
  const timestamp = new Date(isoString).getTime();
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);

  if (diffSec < 5) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  return `${Math.floor(diffHour / 24)}d ago`;
};

/**
 * Returns today's date formatted as YYYY-MM-DD in India Standard Time (IST, UTC+5:30)
 */
export const getTodayIST = (): string => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
};

/**
 * Calculates a date X days from today in IST (formatted as YYYY-MM-DD for date inputs)
 */
export const addDaysIST = (days: number): string => {
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(future);
};

export interface ExpiryStatusIST {
  daysLeft: number;
  label: string;
  isExpired: boolean;
  isUrgent: boolean; // 3 days or fewer
  formattedDateIST: string;
}

/**
 * Calculates how many days a project has left to run before expiring in Indian Standard Time (IST)
 */
export const getExpiryCountdownIST = (expiryDateString?: string): ExpiryStatusIST => {
  if (!expiryDateString) {
    return {
      daysLeft: 999,
      label: 'No Expiry Set',
      isExpired: false,
      isUrgent: false,
      formattedDateIST: '—',
    };
  }

  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const todayIST = formatter.format(new Date());
    const targetIST = formatter.format(new Date(expiryDateString));

    const [tYear, tMonth, tDay] = todayIST.split('-').map(Number);
    const [eYear, eMonth, eDay] = targetIST.split('-').map(Number);

    const todayUtc = Date.UTC(tYear, tMonth - 1, tDay);
    const targetUtc = Date.UTC(eYear, eMonth - 1, eDay);

    const diffDays = Math.round((targetUtc - todayUtc) / (1000 * 60 * 60 * 24));

    // Formatted readable date in IST (DD/MM/YYYY)
    const displayFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const formattedDateIST = displayFormatter.format(new Date(expiryDateString));

    if (diffDays < 0) {
      return {
        daysLeft: diffDays,
        label: 'Expired',
        isExpired: true,
        isUrgent: true,
        formattedDateIST,
      };
    }

    if (diffDays === 0) {
      return {
        daysLeft: 0,
        label: 'Today',
        isExpired: false,
        isUrgent: true,
        formattedDateIST,
      };
    }

    if (diffDays === 1) {
      return {
        daysLeft: 1,
        label: '1d left',
        isExpired: false,
        isUrgent: true,
        formattedDateIST,
      };
    }

    return {
      daysLeft: diffDays,
      label: `${diffDays}d left`,
      isExpired: false,
      isUrgent: diffDays <= 3,
      formattedDateIST,
    };
  } catch {
    return {
      daysLeft: 0,
      label: 'Invalid Date',
      isExpired: false,
      isUrgent: false,
      formattedDateIST: '—',
    };
  }
};
