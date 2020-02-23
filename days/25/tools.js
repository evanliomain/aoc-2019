const T = require('taninsam');
const chalk = require('chalk');
const fs = require('fs');

const {
  printMatrix,
  patternMatching,
  printMatrixToFile,
  replace
} = require('../../tools');
const { stringToAscii, asciiToString } = require('../../tools');

const { listen } = require('../../intcode-computer');

const execOptions = { debug: false, runUntilHalt: false };

const DROID_COMMAND = {
  NORTH: 'north',
  SOUTH: 'south',
  WEST: 'west',
  EAST: 'east'
};

// const DIRECTION = { NORTH: 1, SOUTH: 2, WEST: 3, EAST: 4 };
// const STATUS = {
//   WALL: 0,
//   MOVED: 1,
//   OXYGEN_SYSTEM: 2,
//   START: 3,
//   CURRENT: 4,
//   OXYGEN: 5
// };

function move(direction) {
  return ({ space, currentPosition, programState }) => {
    const nextPosition = getNextPosition(currentPosition, direction);

    const newProgramState = listen(
      programState.program,
      encodeInstruction()(direction),
      {
        instructionPointer: programState.instructionPointer,
        relativeBase: programState.relativeBase
      },
      execOptions
    );

    const out = parseOutput(newProgramState.output);
    console.log(out);

    console.log('>' + asciiToString(newProgramState.output).join('') + '<');
    return {
      programState: newProgramState,
      space,
      currentPosition
    };

    //   switch (newProgramState.output) {
    //     case STATUS.WALL:
    //       return {
    //         space: { ...space, [positionToRecordKey(nextPosition)]: STATUS.WALL },
    //         programState: newProgramState,
    //         currentPosition
    //       };
    //     case STATUS.MOVED:
    //       return {
    //         space: {
    //           ...space,
    //           // [positionToRecordKey(currentPosition)]: STATUS.MOVED,
    //           [positionToRecordKey(nextPosition)]: STATUS.MOVED
    //         },
    //         programState: newProgramState,
    //         currentPosition: nextPosition
    //       };
    //     case STATUS.OXYGEN_SYSTEM:
    //       return {
    //         space: {
    //           ...space,
    //           [positionToRecordKey(nextPosition)]: STATUS.OXYGEN_SYSTEM
    //         },
    //         programState: newProgramState,
    //         currentPosition: nextPosition
    //       };

    //     default:
    //       throw new Error(`Unreconize status ${newProgramState.output}`);
    //   }
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
  return state => state;
  // T.chain(space)
  //   .chain(recordToMatrix)
  //   .chain(printConsole)
  //   .value();
}

function printerFile(index) {
  return async ({ space, currentPosition }) => {
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
    await printMatrixToFile(cell => ({
      shape: 'text',
      fill: 'white',
      text: cell
    }))(`24/24-space-${index}`, 20)(record);
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
    space: { ...savedMap, '0,0': '?' },
    programState: {
      program,
      instructionPointer: 0,
      relativeBase: 0
    },
    currentPosition: { x: 0, y: 0 }
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
  return T.chain(output)
    .chain(asciiToString)
    .chain(T.join(''))
    .chain()
    .value();
}

module.exports = {
  DROID_COMMAND,
  move,
  moves,
  printerConsole,
  printerFile,
  saveSpace,
  wrap,
  wrapPrintFile,
  start,
  getRecordValue,
  getNextPosition,
  writeUserInputs,
  positionToRecordKey
};
