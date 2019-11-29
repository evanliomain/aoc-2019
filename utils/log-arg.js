const chalk = require('chalk');

function logArg(year, day, level, other) {
  // Log user arguments
  console.log(
    [
      chalk.magenta(`year:`, chalk.bold(year)),
      chalk.green(`day:`, chalk.bold(day)),
      chalk.blue(`level:`, chalk.bold(level)),
      other
    ]
      .filter(x => undefined !== x)
      .filter(x => '' !== x)
      .join(' - ')
  );
}

module.exports = {
  logArg
};
