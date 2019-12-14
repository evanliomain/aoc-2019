const T = require('taninsam');

const chalk = require('chalk');

module.exports = {
  collect,
  produce,
  removeWhatIsProduce,
  isJustRemainORE,
  prinSystem
};

function collect(reactions) {
  return system =>
    T.chain(system)

      .chain(
        T.loopWhile(T.not(isJustRemainORE), system =>
          T.chain(system)
            .chain(produce(reactions))
            .chain(removeWhatIsProduce)
            .value()
        )
      )

      .value();
}

function printReaction(reaction) {
  return `${printComposant(reaction.product)} ${chalk.red(
    '<='
  )} ${reaction.reactifs.map(printComposant).join(' + ')}`;
}
function printComposant(composant) {
  return `${chalk.green(composant.coeff)} ${chalk.cyan(composant.molecule)}`;
}

function removeWhatIsProduce({ molecules, trash }) {
  return {
    molecules: T.chain(molecules)
      .chain(T.entries())
      .chain(T.filter(([molecule, quantity]) => 0 !== quantity))
      .chain(T.fromEntries())
      .value(),

    trash
  };
}

function produce(reactions) {
  return ({ molecules, trash }) =>
    T.chain(molecules)
      .chain(T.keys())
      .chain(T.filter(name => 'ORE' !== name))
      .chain(
        T.reduce(
          (acc, name) => {
            // How much do we want
            const quantity = acc.molecules[name];

            // How much a reaction can produce
            const reaction = reactions[name];
            const reactionQuantity = reaction.product.coeff;

            // How many I have into the trash
            const trashQuantity = T.isNil(trash[name]) ? 0 : trash[name];

            // So I need to produce by reaction
            const quantityToProduce = Math.max(0, quantity - trashQuantity);
            const remainToTrash = Math.max(0, trashQuantity - quantity);
            let excessProduction = 0;
            let newMolecules = {};

            if (0 !== quantityToProduce) {
              const n = nbReaction(reactionQuantity, quantityToProduce);

              excessProduction +=
                n * reaction.product.coeff - quantityToProduce;

              newMolecules = reaction.reactifs.reduce((accu, reactif) => {
                accu[reactif.molecule] = n * reactif.coeff;
                return accu;
              }, {});
            }

            return {
              molecules: {
                ...mergeMolecules(acc.molecules, newMolecules),
                [name]: 0
              },
              trash: { ...acc.trash, [name]: remainToTrash + excessProduction }
            };
          },
          { molecules, trash }
        )
      )
      .value();
}

function nbReaction(reactionQuantity, quantityToProduce) {
  return Math.ceil(quantityToProduce / reactionQuantity);
}

function mergeMolecules(refMolecules, newMolecules) {
  return T.chain(newMolecules)
    .chain(T.entries())
    .chain(
      T.reduce((acc, [name, quantity]) => {
        if (T.isNil(acc[name])) {
          return {
            ...acc,
            [name]: quantity
          };
        }
        return {
          ...acc,
          [name]: acc[name] + quantity
        };
      }, refMolecules)
    )
    .value();
}

function prinSystem({ molecules, trash }) {
  return `${chalk.green('*')} ${printMoleculesMap(molecules)}\n${chalk.red(
    '#'
  )} ${printMoleculesMap(trash)}`;
}

function printMoleculesMap(molecules) {
  return T.chain(molecules)
    .chain(T.entries())
    .chain(
      T.map(([name, quantity]) =>
        printComposant({ coeff: quantity, molecule: name })
      )
    )
    .chain(T.join(', '))
    .value();
}

function isJustRemainORE({ molecules }) {
  return T.chain(molecules)
    .chain(T.entries())
    .chain(remain => 1 === remain.length && 'ORE' === remain[0][0])
    .value();
}
