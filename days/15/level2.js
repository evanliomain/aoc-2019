const spaceMap = require('../../output/space-map.json');

const { spreadOxygen } = require('./tools');

module.exports = function() {
  return spreadOxygen(spaceMap, { x: -16, y: -12 });
};
