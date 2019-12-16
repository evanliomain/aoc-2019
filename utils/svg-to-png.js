const T = require('taninsam');
const svg2png = require('svg2png');

module.exports = function svgToPng({ width, height, dwidth }) {
  const plus = T.isNil(dwidth) ? 0 : dwidth;
  return async svg => {
    return await svg2png(svg, { width: width + plus, height });
  };
};
