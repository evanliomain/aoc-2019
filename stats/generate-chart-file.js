const vega = require('vega');
const T = require('taninsam');
const then = require('../tools/then');
const writeFile = require('./write-file');

const aocChartConfig = require('./aoc.config.json');
const players = require('../playeurs.json');
const svg2png = require('svg2png');

module.exports = generateChartFile;

function generateChartFile(
  chartSpec,
  { chartName, width, height, dwidth, config },
  signals = []
) {
  chartSpec.width = width;
  chartSpec.height = height;

  const conf = T.isUndefined(config) ? aocChartConfig : config;

  return async source =>
    T.chain(source)
      .chain(generateVegaChart(chartSpec, conf, signals))
      .chain(viewToSvg())
      .chain(then(svgToPng({ width, height, dwidth })))
      .chain(then(writeFile(`dist/${chartName}.png`)))
      .value();
}

function generateVegaChart(chartSpec, conf, signals = []) {
  return chartSource =>
    T.chain(chartSpec)
      .chain(specToRuntime(conf))
      .chain(createView)
      .chain(sourceData(chartSource))
      .chain(setSignals(signals))
      .chain(x => x.run())
      .value();
}

function specToRuntime(conf) {
  return spec => vega.parse(spec, conf);
}
function createView(runtime) {
  return new vega.View(runtime, { renderer: 'svg' });
}
function sourceData(data, sourceName = 'source') {
  return view => view.data(sourceName, data);
}
function setSignals(signals) {
  if (0 === signals.length) {
    return x => x;
  }
  return view =>
    signals.reduce((v, { name, value }) => v.signal(name, value), view);
}

function viewToSvg() {
  return async view => {
    const svg = await view.toSVG();

    return svg.replace(
      /<image xlink:href="([^"]+)"/g,
      (_, g1) => `<image xlink:href="${players[g1].url}"`
    );
  };
}
function svgToPng({ width, height, dwidth }) {
  return async svg => {
    return await svg2png(svg, { width: width + dwidth, height });
  };
}
