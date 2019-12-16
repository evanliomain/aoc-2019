const chalk = require('chalk');

async function solve(day, level, input) {
  // Get solve function
  const solve = require(`../days/${day}/level${level}`);

  // Get input parser
  let parser;
  let result;
  try {
    parser = require(`../days/${day}/in`);
  } catch (e) {
    parser = x => x;
  }
  console.time('solving in');
  try {
    result = await solve(parser(input));
  } catch (e) {
    console.log(chalk.bold.red(e));
    throw e;
  }
  console.timeEnd('solving in');

  if (typeof result === 'object') {
    console.log(
      chalk.magenta('result:') + '\n' + JSON.stringify(result, (_, v) => v, 2)
    );
  } else {
    console.log(chalk.magenta('result:') + '\n' + result);
  }
  return result;
}

module.exports = solve;
