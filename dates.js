export const SHOW_YEARS = 25;
const START_YEAR = (function() {
  const year = new Date().getFullYear();
  return Math.floor(year - (SHOW_YEARS - 1) / 2);
})();

export function getStartYear(year) {
  if (year === START_YEAR) {
    return START_YEAR;
  }

  if (year > START_YEAR && year < START_YEAR + SHOW_YEARS) {
    return START_YEAR;
  }

  return START_YEAR + Math.floor((year - START_YEAR) / SHOW_YEARS) * SHOW_YEARS;
}

const DAYS_IN_MONTH = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
export function daysInMonth(year, month) {
  if (month === 1 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) {
    return 29;
  }
  return DAYS_IN_MONTH[month];
}

export function prevMonth({ year, month }) {
  if (month === 0) {
    return {
      year: year - 1,
      month: 11
    }
  }

  return {
    year: year,
    month: month - 1
  }
}

export function nextMonth({ year, month }) {
  if (month === 11) {
    return {
      year: year + 1,
      month: 0
    }
  }

  return {
    year: year,
    month: month + 1
  }
}

export function prevYear({ year, month }) {
  return {
    year: year - 1,
    month
  }
}

export function nextYear({ year, month }) {
  return {
    year: year + 1,
    month
  }
}

export function prevYears({ year, month }) {
  return {
    year: year - SHOW_YEARS,
    month
  }
}

export function nextYears({ year, month }) {
  return {
    year: year + SHOW_YEARS,
    month
  }
}

export function isValidDate(date) {
  return date instanceof Date && !isNaN(date);
}
