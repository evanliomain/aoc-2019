const T = require('taninsam');

module.exports = function(input) {
  return T.chain(input[0])
    .chain(T.split('-'))
    .chain(([start, stop]) => [parseInt(start, 10), parseInt(stop, 10)])
    .value();
};
