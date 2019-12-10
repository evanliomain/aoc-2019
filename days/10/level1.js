const { getBetterPlace } = require('./tools');

module.exports = function(input) {
  return getBetterPlace(input)[0];
};
