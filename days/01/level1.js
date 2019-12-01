const T = require('taninsam');

module.exports = function(input) {
  return T.chain(input)
    .chain(T.map(x => Math.floor(x / 3) - 2))
    .chain(T.sum())
    .value();
};
