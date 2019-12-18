const T = require('taninsam');
const mapMatrix = require('./map-matrix');
const fs = require('fs');
const svgToPng = require('../utils/svg-to-png');

module.exports = function printMatrixToFile(printCell) {
  return (filename, coeff = 1) => async matrix => {
    const height = matrix.length;
    const width = matrix[0].length;
    const finalHeight = coeff * height;
    const finalWidth = coeff * width;

    const content = T.chain(matrix)
      .chain(
        mapMatrix((cell, x, y) => {
          const render = printCell(cell);
          if (T.isNil(render)) {
            return '';
          }
          if (T.isString(render)) {
            return `<rect width="1" height="1" x="${x}" y="${y}" fill="${render}" />`;
          }
          if (T.isObject(render)) {
            let printed = '';
            if (!T.isNil(render.background)) {
              printed += `<rect width="1" height="1" x="${x}" y="${y}" fill="${render.background}"/>`;
            }
            let stroke = '';
            if (!T.isNil(render.stroke)) {
              stroke = `stroke="${render.stroke}" stroke-width="0.05"`;
            }

            if ('rect' === render.shape) {
              let scale = 1;

              if (!T.isNil(render.scale)) {
                scale = render.scale;
              }

              const xPos = x + (1 - scale / 2);
              const yPos = y + (1 - scale / 2);

              printed += `<rect width="${scale}" height="${scale}" x="${x}" y="${y}"`;
            }

            if ('circle' === render.shape) {
              let scale = 1;
              if (!T.isNil(render.scale)) {
                scale = render.scale;
              }
              printed += `<circle cx="${x + 0.5}" cy="${y + 0.5}" r="${0.5 *
                scale}"`;
            }

            if ('triangle-up' === render.shape) {
              printed += `<path d="M${x + 0.5},${y} l-0.5,1 h1z"`;

              transform = 'scale(0.8) translate(0.1, 0.1)';
            }
            if ('triangle-down' === render.shape) {
              printed += `<path d="M${x + 0.5},${y + 1} l-0.5,-1 h1z"`;
            }
            if ('triangle-left' === render.shape) {
              printed += `<path d="M${x},${y + 0.5} l1,0.5 v-1z"`;
            }
            if ('triangle-right' === render.shape) {
              printed += `<path d="M${x + 1},${y + 0.5} l-1,0.5 v-1z"`;
            }
            // if (render.shape.startWith('triangle-')) {
            //   if (!T.isNil(render.scale)) {
            //     const diff = 1 - render.scale / 2;
            //     printed += ` transform="scale(${render.scale}) translate(${diff}, ${diff})"`;
            //   }
            // }

            printed += ` fill="${render.fill}"`;
            printed += ` ${stroke}`;
            printed += ' />';
            return printed;
          }
        })
      )
      .chain(T.map(T.join('\n')))
      .chain(T.join('\n'))
      .value();

    const svg = `
      <svg viewBox="0 0 ${width} ${height}" width="${finalWidth}" height="${finalHeight}">

        <rect width="${width}" height="${height}" x="0" y="0" fill="black"/>
        ${content}
      </svg>
    `;
    fs.mkdirSync('output', { recursive: true });
    return await Promise.resolve(svg)
      .then(svg => fs.writeFileSync(`output/${filename}.svg`, svg))
      .then(() => matrix);

    return await svgToPng({ width: finalWidth, height: finalHeight })(svg)
      .then(png => fs.writeFileSync(`output/${filename}.png`, png))
      .then(() => matrix);
  };
};
