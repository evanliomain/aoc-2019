const T = require('taninsam');
const fs = require('fs');

/**
 * @param n the day number
 * @param sample number suffix it to have multiple sample for 1 day
 */
module.exports = n => {
  const day = String(n).padStart(2, '0');

  return sample => {
    let suffix = '';
    if (T.isNumber(sample)) {
      suffix += sample;
    }

    return fs
      .readFileSync(`./days/${day}/sample/${suffix}`, 'utf8')
      .split('\n')
      .filter(x => '' !== x);
  };
};
