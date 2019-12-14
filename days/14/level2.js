const T = require('taninsam');

const { collect } = require('./tools');

const collectedORE = 1000000000000;

module.exports = function(reactions) {
  const consumer = consumeStock(reactions);

  return T.chain({
    system: { molecules: {}, trash: {} },
    stock: { ORE: collectedORE, FUEL: 0 }
  })
    .chain(consumer(100000000000))
    .chain(consumer(10000000000))
    .chain(consumer(1000000000))
    .chain(consumer(10000000))
    .chain(consumer(1000000))
    .chain(consumer(100000))
    .chain(consumer(10000))
    .chain(consumer(1000))
    .chain(consumer(100))
    .chain(consumer(10))
    .chain(consumer(1))
    .chain(({ stock: { FUEL } }) => FUEL)
    .value();
};

function consumeStock(reactions) {
  return stepFUEL => ({ stock, system }) => {
    system.molecules['FUEL'] = stepFUEL;
    while (true) {
      const newSystem = T.chain(system)
        .chain(collect(reactions))
        .value();

      if (stock.ORE - newSystem.molecules['ORE'] < 0) {
        break;
      }
      stock.ORE -= newSystem.molecules['ORE'];
      stock.FUEL += stepFUEL;
      system = newSystem;
      system.molecules['FUEL'] = stepFUEL;
      system.molecules['ORE'] = 0;
    }

    return { stock, system };
  };
}
