const T = require('taninsam');
const replaceAt = require('../../tools/replace-at');
const { execute } = require('../../intcode-computer');

module.exports = { execution, run };

function replaceNounVerb(noun, verb) {
  return program =>
    T.chain(program)
      .chain(replaceAt(1, noun))
      .chain(replaceAt(2, verb))
      .value();
}

function execution(noun, verb) {
  return program =>
    T.chain(program)
      .chain(replaceNounVerb(noun, verb))
      .chain(execute)
      .value();
}
