const chalk = require('chalk');
const pkg = require('../package.json');
const year = pkg.aocYear;
const session = require('../session.json');
const { get } = require('../utils/input');
const solve = require('../utils/solve');
const { logArg } = require('../utils/log-arg');
const { extractRun } = require('../utils/extract-args');

const runTest = require('../utils/run-test');
const askToSend = require('../utils/ask-to-send');
const sendResult = require('../utils/send-result');
const { isSolve } = require('../utils/is-solve');

async function runAndSubmit() {
  const { day, level } = extractRun(process.argv);

  // Log user arguments
  logArg(year, day, level);

  if (await isSolve(year, day, level)) {
    console.log(chalk.green('The puzzle is already solve!'));
    return new Promise(function(resolve) {
      resolve();
    });
  }
  // Run the Jest asynchronously
  return runTest(day, level).then(onTestFinish);

  function onTestFinish(result) {
    // Analyze the results
    // (see typings for result format)
    if (result.results.success) {
      console.log(chalk.green('Tests passed'));
      console.log(chalk.blue('Run on your puzzle'));
      return runOnPuzzle();
    } else {
      console.log(chalk.red('Tests Failed'));
    }
  }

  async function runOnPuzzle() {
    // Get the input
    let input;
    let puzzleResult;
    try {
      input = await get(day, year);
    } catch (e) {
      if (null !== e && null !== e.message) {
        console.log(chalk.bold.red(e.message));
      } else {
        console.log('Error: ' + e);
      }
      return;
    }
    try {
      puzzleResult = await solve(day, level, input);
    } catch (e) {
      console.log(e);
      return;
    }

    askToSend(puzzleResult).then(sending => {
      if (sending) {
        sendResult(year, day, level, puzzleResult, session).then(() =>
          process.exit()
        );
      } else {
        process.exit();
      }
    });
  }
}

runAndSubmit().catch(() => {});
