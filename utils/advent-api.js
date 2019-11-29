const request = require('request');
const assertError = require('./assert-error');
const pkg = require('../package.json');

const ADVENT_HOST = 'https://adventofcode.com';
const USER_AGENT = `node/${process.version} ${pkg.name}/${pkg.version}`;

/**
 * @function getInput
 * Gets the input from the advent of code website
 * @param {Object} options
 * @param {String|Number} options.year - The year to pull input from
 * @param {String|Number} options.day - The day to pull input from
 * @param {String} options.session - The advent session cookie to use
 */
const getInput = ({ year, day, session }) => {
  assertError(year, ReferenceError, 'You must provide a year');
  assertError(day, ReferenceError, 'You must provide a day');
  assertError(session, ReferenceError, 'You must provide your own session');
  const d = day.replace(/^0*/, '');
  const inputUri = `${ADVENT_HOST}/${year}/day/${d}/input`;
  return fetch(inputUri, { method: 'GET', headers: headers({ session }) });
};

const submit = ({ year, day, level, answer, session }) => {
  assertError(year, ReferenceError, 'You must provide a year');
  assertError(day, ReferenceError, 'You must provide a day');
  assertError(answer, ReferenceError, 'You must provide a answer');
  assertError(session, ReferenceError, 'You must provide your own session');
  const d = day.replace(/^0*/, '');
  const inputUri = `${ADVENT_HOST}/${year}/day/${d}/answer`;
  // require('request').debug = true;
  return fetch(inputUri, {
    method: 'POST',
    headers: headers({ session }),
    form: { level: parseInt(level, 10), answer }
  });
};

const getProblem = ({ year, day, session }) => {
  assertError(year, ReferenceError, 'You must provide a year');
  assertError(day, ReferenceError, 'You must provide a day');
  assertError(session, ReferenceError, 'You must provide your own session');
  const d = day.replace(/^0*/, '');
  const inputUri = `${ADVENT_HOST}/${year}/day/${d}`;
  return fetch(inputUri, { method: 'GET', headers: headers({ session }) });
};

const headers = ({ session }) => ({
  'User-Agent': USER_AGENT,
  Cookie: `session=${session}`
});

const getStat = ({ year, leaderboard, session }) => {
  assertError(year, ReferenceError, 'You must provide a year');
  assertError(leaderboard, ReferenceError, 'You must provide a leaderboard');
  assertError(session, ReferenceError, 'You must provide your own session');
  const inputUri = `${ADVENT_HOST}/${year}/leaderboard/private/view/${leaderboard}.json`;
  return fetch(inputUri, { method: 'GET', headers: headers({ session }) }).then(
    result => JSON.parse(result)
  );
};

function fetch(url, options) {
  // console.log(url);
  // console.log(options);
  return new Promise(function(resolve, reject) {
    request({ ...options, url }, function(error, res, body) {
      // console.log(res.statusCode);
      if (!error && res.statusCode == 200) {
        resolve(body);
      } else if (!error && res.statusCode == 302) {
        reject(new Error('302: Please refresh your session'));
      } else if (!error && res.statusCode == 404) {
        reject(new Error('404 Not Found: ' + url));
      } else {
        reject(error);
      }
    });
  });
}

module.exports = {
  getProblem,
  getInput,
  getStat,
  submit
};
