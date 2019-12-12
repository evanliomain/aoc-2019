const hcf = require('./hcf');

/**
 * Return the lowest common multiple of 2 numbers
 */
module.exports = function lcm(a) {
  return b => (a * b) / hcf(a)(b);
};
