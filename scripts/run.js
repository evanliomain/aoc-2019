const pkg = require('../package.json');
const year = pkg.aocYear;
const chalk = require('chalk');

const getSample = require('../utils/input-sample');
const { get } = require('../utils/input');
const solve = require('../utils/solve');

const { extractStart } = require('../utils/extract-args');

const { logArg } = require('../utils/log-arg');

async function main() {
  // Extract arguments
  const { day, level, isSample, isSampleNumber } = extractStart(process.argv);

  // Log user arguments
  logArg(
    year,
    day,
    level,
    (isSample ? chalk.red('sample data') : '') +
      (isSampleNumber ? ' ' + chalk.bold.red(isSample) : '')
  );

  // Get the input
  let input;
  try {
    if (isSample) {
      input = getSample(day, isSample);
    } else {
      input = await get(day, year);
    }
  } catch (e) {
    if (null !== e && null !== e.message) {
      console.log(chalk.bold.red(e.message));
    } else {
      console.log('Error: ' + e);
    }
    return;
  }
  return await solve(day, level, input);
}

main().catch(e => {
  console.error(e);
});
