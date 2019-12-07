const T = require('taninsam');

module.exports = { parseOpcode };

function parseOpcode(opcode) {
  if (opcode < 100) {
    return [opcode];
  }
  return T.chain(String(opcode))
    .chain(T.split(''))
    .chain(T.reverse())
    .chain(([d1, d2, ...rest]) => [
      parseInt(d2 + d1, 10),
      ...rest.map(x => parseInt(x, 10))
    ])
    .value();
}
