const T = require('taninsam');

module.exports = function(input) {
  return T.chain(input[0])
    .chain(T.split(','))
    .chain(T.map(x => parseInt(x, 10)))
    .value();
};
