const T = require('taninsam');

const { serie, generatePhase } = require('./tools');

module.exports = function(input) {
  return T.chain(generatePhase(0, 4))
    .chain(T.map(serie(input)))
    .chain(T.max())
    .value();
};
