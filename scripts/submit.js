const chalk = require('chalk');
const pkg = require('../package.json');
const year = pkg.aocYear;
const advent = require('../utils/advent-api');
const session = require('../session.json');
const { displayResult } = require('../utils/parse-advent-response');
const fs = require('fs');
const { extractSubmit } = require('../utils/extract-args');

const { logArg } = require('../utils/log-arg');

async function submit() {
  const { day, level, answer } = extractSubmit(process.argv);

  // Log user arguments
  logArg(year, day, level, chalk.red(`answer:`, chalk.bold(answer)));

  let result;
  try {
    result = await advent.submit({ year, day, level, answer, session });
  } catch (error) {
    if (null !== error && null !== error.message) {
      console.log(chalk.bold.red(error.message));
    } else {
      console.log('Error: ' + error);
    }
    return;
  }
  displayResult(result);
}

submit();
