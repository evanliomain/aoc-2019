const chalk = require('chalk');
const { logArg } = require('../utils/log-arg');
const { extractRun } = require('../utils/extract-args');
const { isSolve } = require('../utils/is-solve');
const pkg = require('../package.json');
const year = pkg.aocYear;

async function check() {
  const { day, level } = extractRun(process.argv);

  // Log user arguments
  logArg(year, day, level);

  if (await isSolve(year, day, level)) {
    console.log(chalk.green('Solve!'));
  } else {
    console.log(chalk.red('Not solve!'));
  }
}

check().catch(() => {});
