const T = require('taninsam');

const { runRoutine } = require('./tools');

const A = 'A';
const B = 'B';
const C = 'C';
const R = 'R';
const L = 'L';

module.exports = function(input) {
  //R10 R8 L10 L10 R8 L6 L6 R8 L6 L6 R10 R8 L10 L10 L10 R10 L6 R8 L6 L6 L10 R10 L6 L10 R10 L6 R8 L6 L6 R10 R8 L10 L10
  return T.chain(input)
    .chain(
      runRoutine({
        streaming: false,
        mainRoutine: [A, B, B, A, C, B, C, C, B, A],
        aRoutine: [R, 10, R, 8, L, 10, L, 10],
        bRoutine: [R, 8, L, 6, L, 6],
        cRoutine: [L, 10, R, 10, L, 6]
      })
    )
    .chain(T.last())
    .value();
};
