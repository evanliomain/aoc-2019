const T = require('taninsam');
const chalk = require('chalk');
const fs = require('fs');

const {
  printMatrix,
  patternMatching,
  printMatrixToFile,
  replace,
  equal
} = require('../../tools');
const { stringToAscii, asciiToString } = require('../../tools');

const { listen } = require('../../intcode-computer');

const execOptions = { debug: false, runUntilHalt: false };

const DROID_COMMAND = {
  NORTH: 'north',
  SOUTH: 'south',
  WEST: 'west',
  EAST: 'east',
  INVENTORY: 'inv'
};

// const DIRECTION = { NORTH: 1, SOUTH: 2, WEST: 3, EAST: 4 };
const STATUS = {
  START: 'S',
  OPEN_PASSAGE: '.',
  OBJECT: 'o',
  WALL: '#',
  CURRENT: 'c'
};

function doCommand(command) {
  return ({ programState }) =>
    listen(
      programState.program,
      encodeInstruction()(command),
      {
        instructionPointer: programState.instructionPointer,
        relativeBase: programState.relativeBase
      },
      execOptions
    );
}

function action(command) {
  return ({ space, currentPosition, programState, items }) => {
    const newProgramState = doCommand(command)({ programState });
    const out = parseOutput(newProgramState.output);

    if (command.startsWith('take')) {
      items.push(command.replace(/take (.*)/, '$1'));
    }
    if (command.startsWith('drop')) {
      item = command.replace(/drop (.*)/, '$1');
      items = items.filter(T.not(equal(item)));
    }

    return {
      programState: newProgramState,
      space,
      currentPosition,
      out,
      items
    };
  };
}

function move(direction) {
  return ({ space, currentPosition, programState, items }) => {
    let nextPosition = getNextPosition(currentPosition, direction);

    const newProgramState = doCommand(direction)({ programState });
    const out = parseOutput(newProgramState.output);

    if (out.failed) {
      nextPosition = currentPosition;
    }

    // console.log('>' + asciiToString(newProgramState.output).join('') + '<');
    return {
      programState: newProgramState,
      space: {
        ...space,
        [positionToRecordKey(nextPosition)]:
          0 !== out.items.length ? STATUS.OBJECT : STATUS.OPEN_PASSAGE,
        '0,0': 'S'
      },
      currentPosition: nextPosition,
      out,
      items
    };
  };
}

function moves(directions = []) {
  return state =>
    directions.reduce(
      (currentState, direction) => move(direction)(currentState),
      state
    );
}

function positionToRecordKey({ x, y }) {
  return `${x},${y}`;
}

function getNextPosition(currentPosition, direction) {
  switch (direction) {
    case DROID_COMMAND.NORTH:
      return { ...currentPosition, y: currentPosition.y - 1 };
    case DROID_COMMAND.SOUTH:
      return { ...currentPosition, y: currentPosition.y + 1 };
    case DROID_COMMAND.EAST:
      return { ...currentPosition, x: currentPosition.x + 1 };
    case DROID_COMMAND.WEST:
      return { ...currentPosition, x: currentPosition.x - 1 };

    default:
      return currentPosition;
  }
}

function saveSpace(state) {
  fs.writeFileSync('output/24-space-map.json', JSON.stringify(state.space));
}
function writeUserInputs(userInputs) {
  fs.writeFileSync('output/24-user-inputs.json', JSON.stringify(userInputs));
}

function printerConsole() {
  return state =>
    T.chain(state.space)
      .chain(recordToMatrix)
      .chain(printConsole)
      .value();
}

function printerFile(index) {
  return async ({ space, currentPosition, out }) => {
    const record = T.chain(space)
      .chain(s => ({
        ...s,
        [positionToRecordKey(currentPosition)]: STATUS.CURRENT
      }))
      .chain(recordToMatrix)
      .value();

    await printSpaceToFile(index)(record);
  };
}

function recordToMatrix(record) {
  const positions = T.chain(record)
    .chain(T.keys())
    .chain(T.map(T.split(',')))
    .chain(T.map(([x, y]) => ({ x: parseInt(x, 10), y: parseInt(y, 10) })))
    .value();

  const xmin = T.minBy(({ x, y }) => x)(positions).x;
  const ymin = T.minBy(({ x, y }) => y)(positions).y;
  const xmax = T.maxBy(({ x, y }) => x)(positions).x;
  const ymax = T.maxBy(({ x, y }) => y)(positions).y;

  const matrix = [];

  for (let raw = ymin, y = 0; raw <= ymax; raw++, y++) {
    const r = [];
    for (let col = xmin, x = 0; col <= xmax; col++, x++) {
      r.push(record[`${col},${raw}`]);
    }
    matrix.push(r);
  }
  return matrix;
}

function recordToList(record) {
  return T.chain(record)
    .chain(T.entries())
    .chain(
      T.map(([key, status]) => {
        let [x, y] = key.split(',');
        x = parseInt(x, 10);
        y = parseInt(y, 10);
        return { x, y, status };
      })
    )
    .value();
}

function printConsole(matrix) {
  return printMatrix(x => x)(matrix);
}

function printSpaceToFile(index) {
  return async record =>
    await printMatrixToFile([
      cell =>
        !T.isNil(cell)
          ? null
          : {
              shape: 'text',
              fill: 'white',
              background: 'black',
              text: '?'
            },
      cell => (STATUS.WALL !== cell ? null : '#0095a8'),
      cell =>
        ![
          STATUS.OPEN_PASSAGE,
          STATUS.CURRENT,
          STATUS.OBJECT,
          STATUS.START
        ].includes(cell)
          ? null
          : 'white',
      cell =>
        STATUS.START !== cell
          ? null
          : { shape: 'text', fill: 'green', text: 'S' },
      cell =>
        STATUS.OBJECT !== cell
          ? null
          : { shape: 'circle', fill: 'blue', scale: 0.5 },
      cell =>
        STATUS.CURRENT !== cell
          ? null
          : { shape: 'circle', fill: 'red', scale: 0.5 }
    ])(`24/24-space-${index}`, 20)(record);
}

function wrap(wrapper) {
  return f => input => {
    const output = f(input);
    wrapper(output);
    return output;
  };
}

function wrapPrintFile(f) {
  let i = 0;
  return state => {
    const newState = f(state);
    printerFile(i)(newState);
    i++;
    return newState;
  };
}

function start(savedMap) {
  return program => ({
    space: { ...savedMap, '0,0': STATUS.START },
    programState: {
      program,
      instructionPointer: 0,
      relativeBase: 0
    },
    currentPosition: { x: 0, y: 0 },
    out: {},
    items: []
  });
}

function getRecordValue(record, position) {
  return record[positionToRecordKey(position)];
}

function encodeInstruction() {
  return instruction => {
    if (T.isNil(instruction)) {
      return stringToAscii('\n');
    }
    return T.chain(instruction)
      .chain(i => `${i}\n`)
      .chain(stringToAscii)
      .value();
  };
}

function parseOutput(output) {
  let outState = T.chain(output)
    .chain(asciiToString)
    .chain(T.join(''))
    .chain(replace(/^\n*/, ''))
    .chain(replace(/\n*$/, ''))
    .chain(T.split('\n'))
    .chain(next => ({ next, all: next }))
    .value();

  console.log(outState.next[0]);

  if (/You can't go that way./.test(outState.next[0])) {
    return {
      title: 'Wrong way',
      description: "You can't go that way.",
      failed: true,
      items: [],
      possibleDirections: [],
      next: [],
      all: outState.all
    };
  }

  outState = T.chain(outState)
    .chain(state => ({ ...state, title: state.next[0], ...next(state) }))
    .chain(state => ({
      ...state,
      description: state.next[0],
      ...next(state)
    }))
    .chain(state => ({ ...state, ...next(state) }))
    .chain(state => ({ ...state, possibleDirections: [] }))
    .chain(
      T.loopWhile(
        state => !T.isNil(state.next[0]) && state.next[0].startsWith('- '),
        state => ({
          ...state,
          possibleDirections: [
            ...state.possibleDirections,
            state.next[0].replace('- ', '')
          ],
          ...next(state)
        })
      )
    )
    .value();

  console.log(outState.next[0]);
  if (/you are ejected back to the checkpoint/.test(outState.next[0])) {
    console.log(`
    ${chalk.bold(outState.title)}
    ${chalk.grey(outState.description)}
    ${chalk.red.bold(outState.next[0])}
    `);
    outState = T.chain(next(outState))
      .chain(({ next }) => ({ next, failed: true, all: next }))
      .chain(state => ({ ...state, title: state.next[0], ...next(state) }))
      .chain(state => ({
        ...state,
        description: state.next[0],
        ...next(state)
      }))
      .chain(state => ({ ...state, ...next(state) }))
      .chain(state => ({ ...state, possibleDirections: [] }))
      .chain(
        T.loopWhile(
          state => !T.isNil(state.next[0]) && state.next[0].startsWith('- '),
          state => ({
            ...state,
            possibleDirections: [
              ...state.possibleDirections,
              state.next[0].replace('- ', '')
            ],
            ...next(state)
          })
        )
      )
      .value();
  }

  return T.chain(outState)
    .chain(state => ({ ...state, ...next(state) }))
    .chain(state => ({ ...state, items: [] }))
    .chain(
      T.loopWhile(
        state => !T.isNil(state.next[0]) && state.next[0].startsWith('- '),
        state => ({
          ...state,
          items: [...state.items, state.next[0].replace('- ', '')],
          ...next(state)
        })
      )
    )
    .value();
}
function next(state) {
  return { next: state.next.slice(1) };
}

function printOutput(out) {
  // ${chalk.bold(out.title)}
  // ${chalk.grey(out.description)}
  // ${0 === out.items.length ? '' : 'items: ' + chalk.cyan(out.items.join(', '))}

  // ${out.next.join('\n')}
  return `
${out.all.join('\n')}
${chalk.grey('---------------------------------------------')}
  `;
}

module.exports = {
  DROID_COMMAND,
  action,
  move,
  moves,
  printerConsole,
  printerFile,
  printOutput,
  saveSpace,
  wrap,
  wrapPrintFile,
  start,
  getRecordValue,
  getNextPosition,
  writeUserInputs,
  positionToRecordKey
};
