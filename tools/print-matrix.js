const T = require('taninsam');
const mapMatrix = require('./map-matrix');
module.exports = function printMatrix(printCell = x => x) {
  return matrix =>
    T.chain(matrix)
      .chain(mapMatrix(printCell))
      .chain(T.map(T.join('')))
      .chain(T.join('\n'))
      .value();
};
