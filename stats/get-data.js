const session = require('../session.json');
const advent = require('../utils/advent-api');

module.exports = getData;

async function getData({ year, leaderboard }) {
  return await advent.getStat({ year, leaderboard, session });
}
