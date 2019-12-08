const chalk = require('chalk');
const T = require('taninsam');
const patternMatching = require('../../tools/pattern-matching');

module.exports = function(image) {
  return T.chain(image)
    .chain(getPixels)
    .chain(
      T.map(
        T.map(
          patternMatching(['0', () => ' '], ['1', () => chalk.bgWhite(' ')])
        )
      )
    )
    .chain(printLayer)
    .value();
};

function getPixel(layers) {
  const nbLayers = layers.length;
  return (rawIndex, columnIndex) => {
    for (let l = 0; l < nbLayers; l++) {
      const pixel = layers[l][rawIndex][columnIndex];
      if ('2' !== pixel) {
        return pixel;
      }
    }
  };
}

function getPixels(image) {
  const gp = getPixel(image);

  const resultImage = [];
  for (let rawIndex = 0; rawIndex < 6; rawIndex++) {
    let raw = [];
    for (let columnIndex = 0; columnIndex < 25; columnIndex++) {
      raw.push(gp(rawIndex, columnIndex));
    }
    resultImage.push(raw.slice());
  }
  return resultImage;
}

function printLayer(layer) {
  return T.chain(layer)
    .chain(T.map(T.join('')))
    .chain(T.join('\n'))
    .value();
}
