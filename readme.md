# Unchained UI

## Calendar UI Component

[![NPM Version](https://img.shields.io/npm/v/uc-calendar.svg?style=flat-square)](https://www.npmjs.com/package/uc-calendar)
[![NPM Downloads](https://img.shields.io/npm/dt/uc-calendar.svg?style=flat-square)](https://www.npmjs.com/package/uc-calendar)


### Usage

```js
import Calendar from 'uc-calendar';

const elDisplay = get('#display');

const calendar = new Calendar({
  onChange: date => {
    console.log('date', date);
  }
}).appendTo(elDisplay);

```

This component follows **Unchained** UI guidelines.

Constructor options:

* __onChange__ — function, callback will be called when value is changed
* locale – object, locale defenition, default is 'en-US'.
* weekStarts — number, `0` for Sunday or `1` for Monday. Overides the locale settings.
* flip – boolean, default `false`, renders the calendar with the header on the bottom.
* value — integer, timestamp in milliseconds or string, representing a date in a format recognized by the `Date.parse()` method
* mode — string, `days`, `months` or `years`, default `days`. The start display mode.
* forward - string, html string to add to the forward button.
* back - string, html string to add to the back button.

### Methods

#### value([val])

If `val` is undefined returns current value as a Date instance, otherwise sets the value.

#### forward()

Change the calendar page forward

#### back()

Change the calendar page back

#### setMode([mode])

Sets the mode. If mode is `undefined` sets the next mode.

#### toString()

Returns the string representation of the selected date according to locale.

#### remove()

Removes the component.

License MIT

© velocityzen

