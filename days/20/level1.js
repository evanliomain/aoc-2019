const T = require('taninsam');
const jsgraphs = require('js-graph-algorithms');

const { printConsole, printFile, start } = require('./tools');
const { then } = require('../../tools');
module.exports = function(input) {
  return (
    T.chain(input)
      .chain(start())
      .chain(({ weightedDiGraph }) => weightedDiGraph)
      .chain(findDijkstraDistance)
      // .chain(printFile('3'))
      // .chain(printConsole())
      .value()
  );
};

function findDijkstraDistance(weightedDiGraph) {
  const equalToLabel = l => ({ label }) => l === label;
  const startIndex = weightedDiGraph.nodeInfo.findIndex(equalToLabel('S'));
  const endIndex = weightedDiGraph.nodeInfo.findIndex(equalToLabel('E'));

  const dijkstra = new jsgraphs.Dijkstra(weightedDiGraph, startIndex);

  if (!dijkstra.hasPathTo(endIndex)) {
    throw new Error(`No path found from S: ${startIndex} to E: ${endIndex}`);
  }
  return dijkstra.distanceTo(endIndex);
}
