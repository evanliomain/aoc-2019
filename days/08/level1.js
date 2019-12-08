const T = require('taninsam');

module.exports = function(image) {
  const layers = T.chain(image)
    .chain(T.map(T.map(T.join(''))))
    .chain(T.map(T.join('')))
    .value();

  const [_, i] = T.chain(layers)
    .chain(T.map((layer, r) => [T.countCharacter('0')(layer), r]))
    .chain(T.minBy(([n]) => n))
    .value();
  const nb1 = T.chain(layers[i])
    .chain(T.countCharacter('1'))
    .value();

  const nb2 = T.chain(layers[i])
    .chain(T.countCharacter('2'))
    .value();
  return nb1 * nb2;
};
