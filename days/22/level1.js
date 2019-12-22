const T = require('taninsam');
const { factoryDeck, shuffles } = require('./tools');

module.exports = function(shuffleTechniques) {
  return T.chain(factoryDeck(10007))
    .chain(shuffles(shuffleTechniques))
    .chain(deck => deck.findIndex(card => 2019 === card))
    .value();
};
