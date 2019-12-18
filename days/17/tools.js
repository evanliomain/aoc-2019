const T = require('taninsam');
const chalk = require('chalk');

const {
  printMatrix,
  patternMatching,
  mapMatrix,
  printMatrixToFile,
  replaceAt
} = require('../../tools');
const { execute } = require('../../intcode-computer');

const execOptions = { debug: false, runUntilHalt: true };

const ASCII = {
  // 35 means #,
  SCAFFOLD: 35,
  // 46 means .,
  OPEN_SPACE: 46,
  // 10 starts a new line
  NEW_LINE: 10,
  UP: 94,
  DOWN: 118,
  LEFT: 60,
  RIGHT: 62,
  INTERSECTION: 79,
  A: 65,
  B: 66,
  C: 67,
  R: 82,
  L: 76,
  y: 121,
  n: 110,
  COMMA: 44,
  ZERO: 48
};

module.exports = {
  getMatrix,
  getAlignment,
  outputToMatrix,
  printConsole,
  printToFile,
  runRoutine
};

function getMatrix() {
  return program =>
    T.chain(program)
      .chain(start())
      .chain(runState())
      .chain(state => state.programState.output)
      .chain(outputToMatrix())
      .value();
}

function runState(input) {
  return state =>
    T.chain(
      execute(
        state.programState.program,
        input,
        {
          instructionPointer: state.programState.instructionPointer,
          relativeBase: state.programState.relativeBase
        },
        execOptions
      )
    )
      .chain(programState => ({
        ...state,
        programState
      }))
      .value();
}

function start() {
  return program => ({
    programState: {
      program,
      instructionPointer: 0,
      relativeBase: 0
    }
  });
}

function outputToMatrix() {
  return asciis => {
    const matrix = [];
    let raw = [];
    for (let i = 0, x = 0, y = 0; i < asciis.length; i++) {
      const ascii = asciis[i];
      if (ASCII.NEW_LINE === ascii) {
        matrix.push(raw.slice());
        y++;
        raw = [];
        continue;
      }
      raw.push(ascii);
      x++;
    }
    return matrix;
  };
}

function identifyIntersection() {
  return mapMatrix((cell, x, y, matrix) => {
    if (
      ASCII.SCAFFOLD !== cell ||
      0 === x ||
      0 === y ||
      matrix[0].length === 1 + x ||
      matrix.length === 1 + y
    ) {
      return cell;
    }
    const left = matrix[y][x - 1];
    const right = matrix[y][x + 1];
    const up = matrix[y - 1][x];
    const down = matrix[y + 1][x];
    if (
      ASCII.SCAFFOLD === left &&
      ASCII.SCAFFOLD === right &&
      ASCII.SCAFFOLD === up &&
      ASCII.SCAFFOLD === down
    ) {
      return ASCII.INTERSECTION;
    }
    return cell;
  });
}

function getAlignment() {
  return matrix =>
    T.chain(matrix)
      .chain(identifyIntersection())
      .chain(toAlignment())
      .chain(sumMatrix())
      .value();
}

function toAlignment() {
  return mapMatrix((cell, x, y) => {
    if (ASCII.INTERSECTION !== cell) {
      return 0;
    }
    return x * y;
  });
}

function sumMatrix() {
  return matrix =>
    T.chain(matrix)
      .chain(T.map(T.sum()))
      .chain(T.sum())
      .value();
}

function runRoutine({ mainRoutine, aRoutine, bRoutine, cRoutine, streaming }) {
  const inputs = routineToInputs({
    mainRoutine,
    aRoutine,
    bRoutine,
    cRoutine,
    streaming
  });
  return program =>
    T.chain(program)
      .chain(replaceAt(0, 2))
      .chain(start())
      .chain(runState(inputs))
      .chain(state => state.programState.output)
      .value();
}

function routineToInputs({
  mainRoutine,
  aRoutine,
  bRoutine,
  cRoutine,
  streaming
}) {
  return [
    ...T.chain(mainRoutine)
      .chain(convertToLine())
      .value(),

    ...T.chain(aRoutine)
      .chain(convertToLine())
      .value(),

    ...T.chain(bRoutine)
      .chain(convertToLine())
      .value(),

    ...T.chain(cRoutine)
      .chain(convertToLine())
      .value(),

    ...[streaming ? 'y'.charCodeAt() : 'n'.charCodeAt(), ASCII.NEW_LINE]
  ];
}

function strToAscii(str) {
  const result = [];
  for (let i = 0; i < str.length; i++) {
    result.push(str[i].charCodeAt());
  }
  return result;
}

function convertToLine() {
  return instructions =>
    T.chain(instructions)
      .chain(T.join(','))
      .chain(strToAscii)
      .chain(T.push(ASCII.NEW_LINE))
      .value();
}

function printConsole() {
  return printMatrix(
    patternMatching(
      [ASCII.SCAFFOLD, () => chalk.bgBlue(' ')],
      [ASCII.OPEN_SPACE, () => chalk.bgBlack(' ')],
      [ASCII.UP, () => chalk.red('^')],
      [ASCII.DOWN, () => chalk.red('v')],
      [ASCII.LEFT, () => chalk.red('<')],
      [ASCII.RIGHT, () => chalk.red('>')],
      [ASCII.INTERSECTION, () => chalk.bgBlue.green('+')]
    )
  );
}

function printToFile() {
  return async matrix =>
    await printMatrixToFile(
      patternMatching(
        [
          ASCII.SCAFFOLD,
          () => ({
            shape: 'rect',
            fill: 'white',
            stroke: 'black',
            scale: 0.6
          })
        ],
        [
          ASCII.UP,
          () => ({
            shape: 'triangle-up',
            fill: '#2196f3',
            scale: 0.8,
            background: 'white'
          })
        ],
        [
          ASCII.DOWN,
          () => ({
            shape: 'triangle-down',
            fill: '#2196f3',
            scale: 0.8,
            background: 'white'
          })
        ],
        [
          ASCII.LEFT,
          () => ({
            shape: 'triangle-left',
            fill: '#2196f3',
            scale: 0.8,
            background: 'white'
          })
        ],
        [
          ASCII.RIGHT,
          () => ({
            shape: 'triangle-right',
            fill: '#2196f3',
            scale: 0.8,
            background: 'white'
          })
        ]
      )
    )(`scaffold`, 20)(matrix);
}
