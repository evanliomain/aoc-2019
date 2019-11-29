const chalk = require('chalk');
const { displayResult } = require('./parse-advent-response');
const advent = require('./advent-api');

async function sendResult(year, day, level, answer, session) {
  console.log(chalk.blue('Sending response...'));
  let submitResult;
  try {
    submitResult = await advent.submit({
      year,
      day,
      level,
      answer,
      session
    });
  } catch (error) {
    if (null !== error && null !== error.message) {
      console.log(chalk.bold.red(error.message));
    } else {
      console.log('Error: ' + error);
    }
    return;
  }
  displayResult(submitResult);
}

module.exports = sendResult;
