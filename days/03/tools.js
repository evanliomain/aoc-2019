const T = require('taninsam');
module.exports = {
  trace,
  findCrossPoints,
  pointsToDistances
};

function trace(wire, mark) {
  return structure => {
    const cursor = { x: 0, y: 0 };
    // console.log(wire, cursor);
    return wire.reduce((struct, { direction, step }) => {
      let start;
      if ('L' === direction || 'R' === direction) {
        start = cursor.x;
      }
      if ('U' === direction || 'D' === direction) {
        start = cursor.y;
      }
      const sens = ['R', 'D'].includes(direction) ? 1 : -1;
      // console.log(direction, step, sens, start);
      for (let i = 1; i <= step; i++) {
        if ('L' === direction || 'R' === direction) {
          cursor.x += sens;
          // console.log('<-->', direction);
        }
        if ('U' === direction || 'D' === direction) {
          cursor.y += sens;
          // console.log('|', direction);
        }
        const point = `${cursor.x},${cursor.y}`;
        // console.log(point, struct[point]);

        if (T.isUndefined(struct[point])) {
          struct[point] = mark;
        } else if (mark !== struct[point]) {
          struct[point] = 'X';
        }
      }
      return struct;
    }, structure);
  };
}

function findCrossPoints(structure) {
  return T.chain(structure)
    .chain(T.entries())
    .chain(T.filter(([_, nbCross]) => 'X' === nbCross))
    .chain(T.map(([point]) => point))
    .chain(T.map(p => p.split(',')))
    .chain(T.map(([x, y]) => ({ x: parseInt(x, 10), y: parseInt(y, 10) })))
    .value();
}

function pointsToDistances(points) {
  return points.map(({ x, y }) => Math.abs(x) + Math.abs(y));
}
