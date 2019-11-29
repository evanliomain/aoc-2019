const chalk = require('chalk');
const advent = require('./advent-api');
const cache = require('./cache');

const session = require('../session.json');

/**
 * @param day the day number
 * @param year the year number
 */
function get(day, year) {
  let inputPromise;
  const cacheKey = `${year}-${day}`;
  const cachedValue = cache.get(cacheKey);

  if (cachedValue) {
    console.log(chalk.grey('Cache found! Returning cached value'));
    inputPromise = Promise.resolve(cachedValue);
  } else {
    console.log(
      chalk.grey('Cache not found. Retrieving from adventofcode.com.')
    );
    inputPromise = advent.getInput({ year, day, session }).then(input => {
      cache.set(cacheKey, input);
      return input;
    });
  }
  return inputPromise.then(data => data.split('\n').filter(x => '' !== x));
}

module.exports.get = get;
