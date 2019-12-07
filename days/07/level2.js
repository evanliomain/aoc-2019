const T = require('taninsam');

const { feedBackLoop, generatePhase } = require('./tools');

module.exports = function(input) {
  return T.chain(generatePhase(5, 9))
    .chain(T.map(feedBackLoop(input)))
    .chain(T.max())
    .value();
};
