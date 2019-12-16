const T = require('taninsam');
const { nextPhase } = require('./tools');

module.exports = function(input) {
  return T.chain(input)
    .chain(T.loopFor(100, nextPhase))
    .chain(T.take(8))
    .chain(T.join(''))
    .value();
};
