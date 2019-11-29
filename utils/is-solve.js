const HTMLParser = require('node-html-parser');
const advent = require('./advent-api');
const session = require('../session.json');

async function isSolve(year, day, level) {
  const html = await advent.getProblem({ year, day, session });
  const root = HTMLParser.parse(html);
  const result = root.querySelector('main p.day-success');

  if (null === result) {
    return false;
  }
  if (/^The first half of this puzzle is complete/.test(result.rawText)) {
    return 1 === level;
  }
  if (/^Both parts of this puzzle are complete/.test(result.rawText)) {
    return true;
  }
  throw new Error(
    `Unable to found if something is solve ${year}, ${day}, ${level}`
  );
}

module.exports.isSolve = isSolve;
