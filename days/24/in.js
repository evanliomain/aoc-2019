const T = require('taninsam');

module.exports = function(input) {
  return T.chain(input)
    .chain(T.map(T.split('')))
    .value();
};
