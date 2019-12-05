const chalk = require('chalk');

function extractStart(argv) {
  const [, , , d, e, sample] = argv;

  if (undefined === d || undefined === e) {
    console.log(
      'Usage: ' +
        chalk.bold(
          'yarn start ' +
            chalk.green('day') +
            ' ' +
            chalk.blue('level') +
            ' [' +
            chalk.red('sample|sample number') +
            ']'
        )
    );
    throw 0;
  }
  const day = d.padStart(2, '0');

  let isSample = undefined !== sample;
  let isSampleNumber = false;
  if (isSample && !isNaN(parseInt(sample, 10))) {
    isSample = parseInt(sample, 10);
    isSampleNumber = true;
  }

  return {
    day,
    level: parseInt(e, 10),
    isSample,
    isSampleNumber
  };
}

function extractSubmit(argv) {
  const [, , , d, level, answer] = argv;

  if (undefined === d || undefined === level || undefined === answer) {
    console.log(
      'Usage: ' +
        chalk.bold(
          'yarn submit ' +
            chalk.green('day') +
            ' ' +
            chalk.blue('level') +
            ' ' +
            chalk.red('answer')
        )
    );
    throw 0;
  }
  const day = d.padStart(2, '0');
  return { day, level, answer };
}

function extractStats(argv) {
  const [, , , d] = argv;

  if (undefined === d) {
    console.log('Usage: ' + chalk.bold('yarn stats ' + chalk.green('day')));
    throw 0;
  }
  const day = d.padStart(2, '0');
  return { day };
}

function extractRun(argv) {
  const [, , , d, level] = process.argv;

  if (undefined === d || undefined === level) {
    console.log(
      'Usage: ' +
        chalk.bold('yarn run ' + chalk.green('day') + ' ' + chalk.blue('level'))
    );
    return;
  }
  const day = d.padStart(2, '0');
  return { day, level: parseInt(level, 10) };
}

module.exports = {
  extractStart,
  extractSubmit,
  extractRun,
  extractStats
};
