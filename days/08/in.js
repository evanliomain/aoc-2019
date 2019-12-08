const T = require('taninsam');

module.exports = function(input) {
  nbLayers = input[0].length / (25 * 6);
  const image = [];
  for (let i = 0; i < nbLayers; i++) {
    image.push(getLayer(input[0], i));
  }

  return image;
};

function getLayer(input, start) {
  const layer = [];
  for (let j = 0; j < 6; j++) {
    let raw = [];
    for (let i = 0; i < 25; i++) {
      raw.push(input[start * 6 * 25 + i + 25 * j]);
    }
    layer.push(raw.slice());
  }
  return layer;
}
