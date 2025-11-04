import i18n from '../i18n/config';

/**
 * Formate une date selon la locale courante
 */
export const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const locale = i18n.language || 'fr';

  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

/**
 * Formate une date avec heure selon la locale courante
 */
export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formate une date courte (ex: 31/10/2025)
 */
export const formatShortDate = (date: Date | string): string => {
  return formatDate(date, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Formate une heure (ex: 18:30)
 */
export const formatTime = (date: Date | string): string => {
  return formatDate(date, {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formate un nombre selon la locale courante
 */
export const formatNumber = (num: number, options?: Intl.NumberFormatOptions): string => {
  const locale = i18n.language || 'fr';
  return new Intl.NumberFormat(locale, options).format(num);
};

/**
 * Formate une durée relative (ex: "il y a 2 heures")
 */
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return i18n.t('history.timeAgo.justNow');
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return i18n.t('history.timeAgo.minutesAgo', { count: minutes });
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return i18n.t('history.timeAgo.hoursAgo', { count: hours });
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return i18n.t('history.timeAgo.daysAgo', { count: days });
  } else if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return i18n.t('history.timeAgo.weeksAgo', { count: weeks });
  } else {
    const months = Math.floor(diffInSeconds / 2592000);
    return i18n.t('history.timeAgo.monthsAgo', { count: months });
  }
};

/**
 * Formate un jour de la semaine (ex: "lundi")
 */
export const formatWeekday = (date: Date | string): string => {
  return formatDate(date, { weekday: 'long' });
};

/**
 * Formate un mois (ex: "octobre")
 */
export const formatMonth = (date: Date | string): string => {
  return formatDate(date, { month: 'long' });
};
