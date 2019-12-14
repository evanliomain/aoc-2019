const T = require('taninsam');

module.exports = function(input) {
  return T.chain(input)
    .chain(T.map(T.split(' => ')))
    .chain(
      T.map(([reactifs, product]) => ({
        reactifs: reactifs.split(', '),
        product
      }))
    )
    .chain(
      T.map(({ reactifs, product }) => ({
        reactifs: reactifs.map(parseComposant),
        product: parseComposant(product)
      }))
    )
    .chain(toRecord)
    .value();
};

function parseComposant(composant) {
  const [coeff, molecule] = composant
    .replace(/(\d*) (\w*)/, '$1/$2')
    .split('/');
  return { coeff: parseInt(coeff, 10), molecule };
}

function toRecord(reactions) {
  return T.chain(reactions)
    .chain(
      T.toObject(reaction => reaction.product.molecule, reaction => reaction)
    )
    .value();
}
