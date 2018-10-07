import { ready, get } from 'uc-dom';
import Calendar from './index';

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
