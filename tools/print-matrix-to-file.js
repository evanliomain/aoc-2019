const T = require('taninsam');
const mapMatrix = require('./map-matrix');
const fs = require('fs');
const svgToPng = require('../utils/svg-to-png');

module.exports = function printMatrixToFile(printCell) {
  return (filename, coeff = 1) => async matrix => {
    const height = coeff * matrix.length;
    const width = coeff * matrix[0].length;

    const content = T.chain(matrix)
      .chain(
        mapMatrix((cell, x, y) => {
          const render = printCell(cell);
          if (T.isNil(render)) {
            return '';
          }
          if (T.isString(render)) {
            return `<rect width="${coeff}" height="${coeff}" x="${x *
              coeff}" y="${y * coeff}" fill="${render}"/>`;
          }
          if (T.isObject(render)) {
            if ('circle' === render.shape) {
              let printed = '';
              if (!T.isNil(render.background)) {
                printed += `<rect width="${coeff}" height="${coeff}" x="${x *
                  coeff}" y="${y * coeff}" fill="${render.background}"/>`;
              }
              let scale = 1;
              if (!T.isNil(render.scale)) {
                scale = render.scale;
              }
              printed += `<circle cx="${(x + 0.5) * coeff}" cy="${(y + 0.5) *
                coeff}" r="${0.5 * scale * coeff}" fill="${render.fill}"/>`;
              return printed;
            }
          }
        })
      )
      .chain(T.map(T.join('\n')))
      .chain(T.join('\n'))
      .value();
    const svg = `
      <svg viewBox="0 0 ${width} ${height}">

        <rect width="${width}" height="${height}" x="0" y="0" fill="black"/>
        ${content}
      </svg>
    `;
    fs.mkdirSync('output', { recursive: true });
    return await svgToPng({ width, height })(svg)
      .then(png => fs.writeFileSync(`output/${filename}.png`, png))
      .then(() => matrix);
  };
};
