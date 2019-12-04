const T = require('taninsam');
const { trace, findCrossPoints, pointsToDistances } = require('./tools');

module.exports = function(input) {
  const [wire1, wire2] = input;

  return T.chain({ '0,0': 1 })
    .chain(trace(wire1, '1'))
    .chain(trace(wire2, '2'))
    .chain(structure => {
      let rec = {};
      rec = trace2(wire1, rec)(structure);
      rec = trace2(wire2, rec)(structure);
      return rec;
    })
    .chain(T.values())
    .chain(T.min())
    .value();
};

function trace2(wire, record) {
  return structure => {
    const cursor = { x: 0, y: 0 };
    let pas = 0;
    return wire.reduce((rec, { direction, step }) => {
      if ('L' === direction || 'R' === direction) {
        start = cursor.x;
      }
      if ('U' === direction || 'D' === direction) {
        start = cursor.y;
      }
      const sens = ['R', 'D'].includes(direction) ? 1 : -1;
      for (let i = 1; i <= step; i++) {
        if ('L' === direction || 'R' === direction) {
          cursor.x += sens;
        }
        if ('U' === direction || 'D' === direction) {
          cursor.y += sens;
        }
        const point = `${cursor.x},${cursor.y}`;
        pas++;
        if ('X' === structure[point]) {
          if (T.isUndefined(rec[point])) {
            rec[point] = pas;
          } else {
            rec[point] += pas;
          }
        }
      }
      return rec;
    }, record);
  };
}
