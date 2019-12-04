const T = require('taninsam');
const { trace, findCrossPoints, pointsToDistances } = require('./tools');

module.exports = function(input) {
  const [wire1, wire2] = input;
  const structure = { '0,0': 1 };

  return T.chain(structure)
    .chain(trace(wire1, '1'))
    .chain(trace(wire2, '2'))
    .chain(findCrossPoints)
    .chain(pointsToDistances)
    .chain(T.min())
    .value();
};
