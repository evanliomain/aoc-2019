const T = require('taninsam');
const { reverseShufflesAB, pow, modinv, mod, bigIntToInt } = require('./tools');

const DECK_SIZE = 119315717514047;

module.exports = function(shuffleTechniques) {
  return T.chain([1, 0])
    .chain(T.map(x => BigInt(x)))
    .chain(reverseShufflesAB(BigInt(DECK_SIZE))(shuffleTechniques))
    .chain(getResult({ indice: 2020, repeatTime: 101741582076661 }))
    .chain(bigIntToInt)
    .value();
};

function getResult({ indice, repeatTime }) {
  return ([A, B]) => {
    const D = BigInt(DECK_SIZE);
    const n = BigInt(repeatTime);

    const An = pow(A, n, D);

    return mod(
      BigInt(indice) * An + B * (BigInt(1) - An) * modinv(BigInt(1) - A, D),
      D
    );
  };
}
