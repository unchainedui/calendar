(function () {
  'use strict';

  const rxQuery = /^\s*([>+~])?\s*([*\w-]+)?(?:#([\w-]+))?(?:\.([\w.-]+))?\s*/;
  const rxClassOnly = /^\.([-\w]+)$/;
  const rxIdOnly = /^#([-\w]+)$/;

  function get(selector, root = document) {
    const id = selector.match(rxIdOnly);
    if (id) {
      return document.getElementById(id[1]);
    }

    const className = selector.match(rxClassOnly);
    if (className) {
      return root.getElementsByClassName(className[1]);
    }

    return root.querySelectorAll(selector);
  }

  function query(selector) {
    let f;
    const out = [];
    if (typeof selector === 'string') {
      while (selector) {
        f = selector.match(rxQuery);
        if (f[0] === '') {
          break;
        }

        out.push({
          rel: f[1],
          tag: (f[2] || '').toUpperCase(),
          id: f[3],
          classes: (f[4]) ? f[4].split('.') : undefined
        });
        selector = selector.substring(f[0].length);
      }
    }
    return out;
  }

  function createNs(namespaceURI, selector) {
    const s = query(selector)[0];
    const tag = s.tag;
    if (!tag) {
      return null;
    }

    const el = document.createElementNs(namespaceURI, tag);
    const id = s.id;
    if (id) {
      el.id = id;
    }

    const classes = s.classes;
    if (classes) {
      el.className = classes.join(' ');
    }

    return el;
  }

  function create(selector, content) {
    const s = query(selector)[0];
    const tag = s.tag;
    if (!tag) {
      return null;
    }

    const el = document.createElement(tag);
    const id = s.id;
    if (id) {
      el.id = id;
    }

    const classes = s.classes;
    if (classes) {
      el.className = classes.join(' ');
    }

    if (content) {
      el.innerHTML = content;
    }

    return el;
  }

  function closest(el, selector) {
    while (!el.matches(selector) && (el = el.parentElement));
    return el;
  }

  function attr(el, name, value) {
    if (value === undefined) {
      return el.getAttribute(name);
    }

    el.setAttribute(name, value);
  }

  function append(parent, el) {
    parent.appendChild(el);
    return parent;
  }

  function prepend(parent, el) {
    parent.insertBefore(el, parent.firstChild);
    return parent;
  }

  function appendTo(el, parent) {
    parent.appendChild(el);
    return el;
  }

  function prependTo(el, parent) {
    parent.insertBefore(el, parent.firstChild);
    return el;
  }

  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function on(el, event, selector, handler, options) {
    if (typeof selector !== 'string') {
      handler = selector;
      selector = undefined;
    }

    if (!selector) {
      el.addEventListener(event, handler, options);
      return handler;
    }

    return on(el, event, e => {
      const target = closest(e.target, selector);
      if (target) {
        handler.call(target, e);
      }
    }, options);
  }

  function off(el, event, handler, options) {
    el.removeEventListener(event, handler, options);
    return handler;
  }

  function once(el, event, handler, options) {
    const _handler = (...args) => {
      handler(...args);
      off(el, event, handler);
    };

    el.addEventListener(event, handler, options);
    return _handler;
  }

  function addClass(el, ...cls) {
    return el.classList.add(...cls);
  }

  function removeClass(el, ...cls) {
    return el.classList.remove(...cls);
  }

  function toggleClass(el, cls, force) {
    return el.classList.toggle(cls, force);
  }

  function addDelayRemoveClass(el, cls, delay) {
    addClass(el, cls);
    return setTimeout(() => removeClass(el, cls), delay);
  }

  function replaceClass(el, rx, newClass) {
    const newClasses = [];
    attr(el, 'class').split(' ').forEach(function(cls) {
      const c = rx.test(cls) ? newClass : cls;

      if (newClasses.indexOf(c) === -1) {
        newClasses.push(c);
      }
    });

    attr(el, 'class', newClasses.join(' '));
    return newClasses.length;
  }

  function insertBefore(el, node) {
    return node.parentNode.insertBefore(el, node);
  }

  function insertAfter(el, node) {
    return node.parentNode.insertBefore(el, node.nextSibling);
  }

  function remove(el) {
    return el.parentNode.removeChild(el);
  }

  var dom = /*#__PURE__*/Object.freeze({
    get: get,
    query: query,
    createNs: createNs,
    create: create,
    closest: closest,
    attr: attr,
    append: append,
    prepend: prepend,
    appendTo: appendTo,
    prependTo: prependTo,
    ready: ready,
    on: on,
    off: off,
    once: once,
    addClass: addClass,
    removeClass: removeClass,
    toggleClass: toggleClass,
    addDelayRemoveClass: addDelayRemoveClass,
    replaceClass: replaceClass,
    insertBefore: insertBefore,
    insertAfter: insertAfter,
    remove: remove
  });

  function compose(...args) {
    let newObject = true;

    if (args[args.length - 1] === true) {
      args.pop();
      newObject = false;
    }

    newObject && args.unshift({});
    return Object.assign.apply(Object, args);
  }

  /*eslint-disable strict */

  const html = [
    'addClass',
    'removeClass',
    'toggleClass',
    'replaceClass',
    'appendTo',
    'prependTo',
    'insertBefore',
    'insertAfter'
  ].reduce((obj, method) => {
    obj[method] = function(...args) {
      dom[method].apply(null, [ this.el ].concat(args));
      return this;
    };
    return obj;
  }, {});

  html.attr = function(name, value) {
    if (value === undefined) {
      return this.el.getAttribute(name);
    }

    this.el.setAttribute(name, value);
    return this
  };

  html.find = function(selector) {
    return get(selector, this.el);
  };

  function toCamelCase(str) {
    return str.replace(/[-_](\w)/g, (matches, letter) => letter.toUpperCase());
  }

  const SHOW_YEARS = 25;
  const START_YEAR = (function() {
    const year = new Date().getFullYear();
    return Math.floor(year - (SHOW_YEARS - 1) / 2);
  })();

  function getStartYear(year) {
    if (year === START_YEAR) {
      return START_YEAR;
    }

    if (year > START_YEAR && year < START_YEAR + SHOW_YEARS) {
      return START_YEAR;
    }

    return START_YEAR + Math.floor((year - START_YEAR) / SHOW_YEARS) * SHOW_YEARS;
  }

  const DAYS_IN_MONTH = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
  function daysInMonth(year, month) {
    if (month === 1 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) {
      return 29;
    }
    return DAYS_IN_MONTH[month];
  }

  function prevMonth({ year, month }) {
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

  function nextMonth({ year, month }) {
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

  function prevYear({ year, month }) {
    return {
      year: year - 1,
      month
    }
  }

  function nextYear({ year, month }) {
    return {
      year: year + 1,
      month
    }
  }

  function prevYears({ year, month }) {
    return {
      year: year - SHOW_YEARS,
      month
    }
  }

  function nextYears({ year, month }) {
    return {
      year: year + SHOW_YEARS,
      month
    }
  }

  function isValidDate(date) {
    return date instanceof Date && !isNaN(date);
  }

  var defaultLocale = {
    code: 'en-US',
    weekStarts: 0, /*Sunday*/
    months: {
      narrow: [ 'J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D' ],
      abbreviated: [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],
      wide: [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]
    },
    days: {
      narrow: [ 'S', 'M', 'T', 'W', 'T', 'F', 'S' ],
      short: [ 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa' ],
      abbreviated: [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ],
      wide: [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ]
    }
  };

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
  };

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

        let html$$1 = '<div class="calendar-display"></div>';
        if (this.flip) {
          html$$1 += header;
        } else {
          html$$1 = header + html$$1;
        }

        return create(`div.calendar${this.flip ? '.calendar-flip' : ''}`, html$$1);
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
        let html$$1 = '<ul class="calendar-days">';

        for (let i = 0; i < 9; i++) {
          for (let j = 0; j <= 6; j++) {
            if (day <= days && ((j >= startingDay && i === 0) || i > 0)) {
              html$$1 += `<li class="${this.isDayActive(day) ? 'calendar-current' : ''}"><a href="#/select/${year}/${month}/${day}">${day}</a></li>`;
              day++;
            } else if (day > days) {
              break;
            } else {
              html$$1 += '<li></li>';
            }
          }

          if (day > days) {
            break;
          }
        }

        html$$1 += '</ul>';
        this.elDisplay.innerHTML = html$$1;
      },

      showMonths: function() {
        const localeMonths = this.locale.months.abbreviated;
        const { year } = this.state.display;
        this.setTitle({ year });

        let html$$1 = '<ul class="calendar-months">';
        for (let month = 0; month < 12; month++) {
          html$$1 += `<li class="${this.isMonthActive(month) ? 'calendar-current' : ''}"><a href="#/select/${year}/${month}">${localeMonths[month]}</a></li>`;
        }

        html$$1 += '</ul>';
        this.elDisplay.innerHTML = html$$1;
      },

      showYears: function() {
        let year = getStartYear(this.state.display.year);
        const lastYear = year + SHOW_YEARS;
        this.setTitle({ yearRange: [ year, lastYear - 1 ] });

        let html$$1 = '<ul class="calendar-years">';
        for (; year < lastYear; year++) {
          html$$1 += `<li class="${this.isYearActive(year) ? 'calendar-current' : ''}"><a href="#/select/${year}">${year}</a></li>`;
        }

        html$$1 += '</ul>';
        this.elDisplay.innerHTML = html$$1;
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
        };

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

  ready(() => {
    const elDisplay = get('#display');

    const cal = new Calendar({
      weekStarts: 1,
      onChange: val => {
        console.log('val', val);
      }
    }).appendTo(elDisplay);

    // setTimeout(() => cal.remove(), 5000);
  });

}());
