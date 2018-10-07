import compose from 'uc-compose';
import { on, off, create, remove } from 'uc-dom';
import html from 'uc-dom/methods';
import { toCamelCase } from 'uc-strings';

import { SHOW_YEARS, getStartYear, daysInMonth, prevMonth, nextMonth, prevYear, nextYear, prevYears, nextYears, isValidDate } from './dates';

import defaultLocale from './en_US';

function parseDecimal(str) {
  return parseInt(str, 10);
}

const MODES = [ 'days', 'months', 'years' ];
function getNextMode(mode) {
  const nextIndex = MODES.indexOf(mode) + 1;
  if (nextIndex === MODES.length) {
    return MODES[0];
  }

  return MODES[nextIndex];
}

const Calendar = function(opts) {
  this.locale = opts.locale || defaultLocale;
  this.weekStarts = opts.weekStarts === undefined ? this.locale.weekStarts : opts.weekStarts;
  this.flip = opts.flip;
  this.onChange = opts.onChange;
  this.el = this.render(opts);
  this.events = {};
  this.init();

  this.value(opts.value || new Date(), true);
  this.addListeners();
  this.setMode(opts.mode || 'days');
}

Calendar.prototype = compose(
  html,
  {
    init: function() {
      this.elMode = this.find('.calendar-mode').item(0);
      this.elDisplay = this.find('.calendar-display').item(0);
    },

    addListeners: function() {
      this.events.onClick = on(this.el, 'click', e => e.stopPropagation());
      const self = this;
      this.events.onAClick = on(this.el, 'click', 'a', function(e) {
        e.preventDefault();
        const parts = this.hash.split('/');
        self[toCamelCase(parts[1])].apply(self, parts.slice(2).map(parseDecimal));
      });
    },

    removeListeneres: function() {
      off(this.el, 'click', this.events.onClick);
      off(this.el, 'click', this.events.onAClick);
    },

    render: function({ back, forward }) {
      const header = `<nav class="calendar-header">
        <a class="calendar-button calendar-back" href="#/back" title="Back">${back || '<'}</a>
        <a class="calendar-mode" href="#/set-mode"></a>
        <a class="calendar-button calendar-forward" href="#/forward" title="Forward">${forward || '>'}</a>
      </nav>`;

      let html = '<div class="calendar-display"></div>';
      if (this.flip) {
        html += header;
      } else {
        html = header + html;
      }

      return create(`div.calendar${this.flip ? '.calendar-flip' : ''}`, html);
    },

    back: function() {
      const display = this.state.display;

      switch (this.mode) {
        case 'days':
          this.state.display = prevMonth(display);
          break;
        case 'months':
          this.state.display = prevYear(display);
          break;
        case 'years':
          this.state.display = prevYears(display);
          break;
      }

      this[toCamelCase(`show-${this.mode}`)]();
    },

    forward: function() {
      const display = this.state.display;

      switch (this.mode) {
        case 'days':
          this.state.display = nextMonth(display);
          break;
        case 'months':
          this.state.display = nextYear(display);
          break;
        case 'years':
          this.state.display = nextYears(display);
          break;
      }

      this[toCamelCase(`show-${this.mode}`)]();
    },

    setMode: function(mode, force) {
      if (mode === this.mode && !force) {
        return;
      }

      if (mode === undefined) {
        mode = getNextMode(this.mode);
      }

      this.mode = mode;
      this[toCamelCase(`show-${mode}`)]();
    },

    select: function(year = this.state.selected.year, month = this.state.selected.month, day = this.state.selected.day) {
      this.value(new Date(year, month, day));
    },

    setTitle: function({ year, month, yearRange }) {
      const localeMonths = this.locale.months.wide;
      this.elMode.innerHTML = yearRange ? yearRange.join(' &ndash; ') :
        `${month === undefined ? '' : `${localeMonths[month]} `}${year}`;
    },

    showDays: function() {
      this.setTitle(this.state.display);
      const { year, month } = this.state.display;
      const firstDay = new Date(year, month, 1).getDay();
      const startingDay = this.weekStarts === 1 ? (firstDay === 0 ? 6 : firstDay - 1) : firstDay;
      const days = daysInMonth(year, month);

      let day = 1;
      let html = '<ul class="calendar-days">';

      for (let i = 0; i < 9; i++) {
        for (let j = 0; j <= 6; j++) {
          if (day <= days && ((j >= startingDay && i === 0) || i > 0)) {
            html += `<li class="${this.isDayActive(day) ? 'calendar-current' : ''}"><a href="#/select/${year}/${month}/${day}">${day}</a></li>`;
            day++;
          } else if (day > days) {
            break;
          } else {
            html += '<li></li>';
          }
        }

        if (day > days) {
          break;
        }
      }

      html += '</ul>';
      this.elDisplay.innerHTML = html;
    },

    showMonths: function() {
      const localeMonths = this.locale.months.abbreviated;
      const { year } = this.state.display;
      this.setTitle({ year });

      let html = '<ul class="calendar-months">';
      for (let month = 0; month < 12; month++) {
        html += `<li class="${this.isMonthActive(month) ? 'calendar-current' : ''}"><a href="#/select/${year}/${month}">${localeMonths[month]}</a></li>`;
      }

      html += '</ul>';
      this.elDisplay.innerHTML = html;
    },

    showYears: function() {
      let year = getStartYear(this.state.display.year);
      const lastYear = year + SHOW_YEARS
      this.setTitle({ yearRange: [ year, lastYear - 1 ] });

      let html = '<ul class="calendar-years">';
      for (; year < lastYear; year++) {
        html += `<li class="${this.isYearActive(year) ? 'calendar-current' : ''}"><a href="#/select/${year}">${year}</a></li>`;
      }

      html += '</ul>';
      this.elDisplay.innerHTML = html;
    },

    isDayActive: function(day) {
      const { selected, display } = this.state;
      return day === selected.day && display.month === selected.month && display.year === selected.year;
    },

    isMonthActive: function(month) {
      const { selected, display } = this.state;
      return month === selected.month && display.year === selected.year;
    },

    isYearActive: function(year) {
      return year === this.state.selected.year;
    },

    parse: function(value) {
      const date = new Date(value);
      if (isValidDate(date)) {
        return date;
      }

      throw date;
    },

    toString: function() {
      return this.state.date.toLocaleDateString(this.locale.code);
    },

    value: function(value, silent) {
      if (value === undefined) {
        return this.state.date;
      }

      const date = value instanceof Date ? value : this.parse(value);
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();

      this.state = {
        date,
        display: { year, month, day },
        selected: { year, month, day }
      }

      if (this.mode === 'years') {
        this.setMode('months', true);
      } else {
        this.setMode('days', true);
        !silent && this.onChange(this.state.date);
      }

      return this;
    },

    remove: function() {
      this.removeListeneres();
      delete this.elDisplay;
      remove(this.el);
      delete this.el;
    }
  }
);

export default Calendar;
