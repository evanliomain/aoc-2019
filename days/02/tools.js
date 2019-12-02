const T = require('taninsam');
const replaceAt = require('../../tools/replace-at');

module.exports = { execution, run };

function execution(noun, verb) {
  return program =>
    T.chain(program)
      .chain(replaceAt(1, noun))
      .chain(replaceAt(2, verb))
      .chain(run)
      .value();
}

function run(program) {
  return T.chain(program)
    .chain(program => ({ program, start: 0 }))
    .chain(
      T.loopWhile(
        ({ program, start }) => 99 !== program[start],
        ({ program, start }) => ({
          program: compute(program, start),
          start: 4 + start
        })
      )
    )
    .chain(({ program }) => program[0])
    .value();
}

function compute(program, start = 0) {
  const [opcode, left, right, dest] = [
    program[start],
    program[1 + start],
    program[2 + start],
    program[3 + start]
  ];

  let result;
  if (1 === opcode) {
    result = program[left] + program[right];
  }
  if (2 === opcode) {
    result = program[left] * program[right];
  }
  return replaceAt(dest, result)(program);
}
