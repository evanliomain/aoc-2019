/**
 * Return the highest common factor of 2 numbers
 */
module.exports = function hcf(a) {
  return b => {
    while (a != b) {
      if (a > b) {
        a -= b;
      } else {
        b -= a;
      }
    }
    return a;
  };
};
