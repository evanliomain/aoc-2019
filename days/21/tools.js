const T = require('taninsam');
const fs = require('fs');

const { stringToAscii, asciiToString } = require('../../tools');
const { execute } = require('../../intcode-computer');

const execOptions = { debug: false, runUntilHalt: true };

module.exports = {
  walk,
  run,
  exec,
  parseOutput,
  readInstructions
};

function walk() {
  return encodeInstructions('WALK');
}
function run() {
  return encodeInstructions('RUN');
}

function encodeInstructions(endIntruction) {
  return instructions => {
    const end = `${endIntruction}\n`;
    return T.chain(instructions)
      .chain(T.join('\n'))
      .chain(T.ifElse(s => '' !== s, s => `${s}\n${end}`, () => end))
      .chain(stringToAscii)
      .value();
  };
}

function exec(program) {
  return encodedInstructions =>
    execute(
      program,
      encodedInstructions,
      { instructionPointer: 0, relativeBase: 0 },
      execOptions
    );
}

function parseOutput({ output }) {
  if (0 === output.length) {
    return 'no output!';
  }
  if (1 === output.length) {
    return output[0];
  }
  if (output.some(out => 500 < out)) {
    return output.find(out => 500 < out);
  }

  return T.chain(output)
    .chain(asciiToString)
    .chain(T.join(''))
    .value();
}

function readInstructions(filename) {
  const instructions = T.chain(
    fs.readFileSync(`./days/21/${filename}.txt`, 'utf8')
  )
    .chain(T.split('\n'))
    .chain(T.filter(x => '' !== x))
    .chain(T.map(x => x.trim()))
    .chain(T.filter(x => '' !== x))
    .chain(T.filter(x => !x.startsWith('/')))
    .chain(T.map(s => s.toUpperCase()))
    .value();

  if (15 < instructions.length) {
    throw new Error(`Too much instructions ${instructions.length}, maximum 15`);
  }

  return instructions;
}
