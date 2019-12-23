module.exports = function parseInteger(base = 10) {
  return n => parseInt(n, base);
};
