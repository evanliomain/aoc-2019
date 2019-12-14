const T = require('taninsam');
const { collect } = require('./tools');

module.exports = function(reactions) {
  return T.chain({ molecules: { FUEL: 1 }, trash: {} })
    .chain(collect(reactions))
    .chain(({ molecules }) => molecules['ORE'])
    .value();
};
