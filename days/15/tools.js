const T = require('taninsam');
const chalk = require('chalk');
const fs = require('fs');

const {
  printMatrix,
  patternMatching,
  printMatrixToFile
} = require('../../tools');

const { execute } = require('../../intcode-computer');

const execOptions = { debug: false, runUntilHalt: false };

const DIRECTION = { NORTH: 1, SOUTH: 2, WEST: 3, EAST: 4 };
const STATUS = {
  WALL: 0,
  MOVED: 1,
  OXYGEN_SYSTEM: 2,
  START: 3,
  CURRENT: 4,
  OXYGEN: 5
};

function move(direction) {
  return ({ space, currentPosition, programState }) => {
    const nextPosition = getNextPosition(currentPosition, direction);

    const newProgramState = execute(
      programState.program,
      direction,
      {
        instructionPointer: programState.instructionPointer,
        relativeBase: programState.relativeBase
      },
      execOptions
    );

    switch (newProgramState.output) {
      case STATUS.WALL:
        return {
          space: { ...space, [positionToRecordKey(nextPosition)]: STATUS.WALL },
          programState: newProgramState,
          currentPosition
        };
      case STATUS.MOVED:
        return {
          space: {
            ...space,
            // [positionToRecordKey(currentPosition)]: STATUS.MOVED,
            [positionToRecordKey(nextPosition)]: STATUS.MOVED
          },
          programState: newProgramState,
          currentPosition: nextPosition
        };
      case STATUS.OXYGEN_SYSTEM:
        return {
          space: {
            ...space,
            [positionToRecordKey(nextPosition)]: STATUS.OXYGEN_SYSTEM
          },
          programState: newProgramState,
          currentPosition: nextPosition
        };

      default:
        throw new Error(`Unreconize status ${newProgramState.output}`);
    }
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
    case DIRECTION.NORTH:
      return { ...currentPosition, y: currentPosition.y - 1 };
    case DIRECTION.SOUTH:
      return { ...currentPosition, y: currentPosition.y + 1 };
    case DIRECTION.EAST:
      return { ...currentPosition, x: currentPosition.x + 1 };
    case DIRECTION.WEST:
      return { ...currentPosition, x: currentPosition.x - 1 };

    default:
      return currentPosition;
  }
}

function saveSpace(state) {
  fs.writeFileSync('output/space-map.json', JSON.stringify(state.space));
}
function writeUserInputs(userInputs) {
  fs.writeFileSync('output/user-inputs.json', JSON.stringify(userInputs));
}

function printerConsole() {
  return ({ space, currentPosition }) =>
    T.chain(space)
      .chain(s => ({
        ...s,
        [positionToRecordKey(currentPosition)]: STATUS.CURRENT
      }))
      .chain(recordToMatrix)
      .chain(printConsole)
      .value();
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
  return printMatrix(
    patternMatching(
      [STATUS.WALL, () => chalk.bgCyan(' ')],
      [STATUS.MOVED, () => chalk.bgWhite(' ')],
      [STATUS.OXYGEN_SYSTEM, () => chalk.bgGreen(' ')],
      [STATUS.OXYGEN, () => chalk.bgWhite.green('.')],
      [STATUS.START, () => chalk.bgBlue(' ')],
      [STATUS.CURRENT, () => chalk.bgWhite.red('O')],
      [() => chalk.bgBlack(' ')]
    )
  )(matrix);
}

function printSpaceToFile(index) {
  return async record =>
    await printMatrixToFile(
      patternMatching(
        [STATUS.WALL, () => '#0095a8'],
        [STATUS.MOVED, () => 'white'],
        [
          STATUS.OXYGEN_SYSTEM,
          () => ({
            shape: 'circle',
            fill: '#4caf50',
            scale: 0.8,
            background: 'white'
          })
        ],
        [
          STATUS.OXYGEN,
          () => ({
            shape: 'circle',
            fill: 'blue',
            scale: 0.5,
            background: 'white'
          })
        ],
        [
          STATUS.START,
          () => ({
            shape: 'circle',
            fill: '#2196f3',
            scale: 0.8,
            background: 'white'
          })
        ],
        [
          STATUS.CURRENT,
          () => ({
            shape: 'circle',
            fill: '#f44336',
            scale: 0.8,
            background: 'white'
          })
        ]
      )
    )(`space-${index}`, 20)(record);
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
    currentPosition: { x: 0, y: 0 }
  });
}

function getRecordValue(record, position) {
  return record[positionToRecordKey(position)];
}

async function spreadOxygen(space, currentPosition) {
  const printer = index => record =>
    printerFile(`oxygen/oxygen-${index}`)({ space: record, currentPosition });
  const oxygen = oxygenate(currentPosition);

  let state = { record: space, count: 0 };

  while (hasRemainUnoxygenateParcel(state.record)) {
    const { record, count } = state;
    await printer(count)(record);
    if (0 === count % 10) {
      console.log(nbRemainUnoxygenateParcel(record), count);
    }
    state = { record: oxygen(record), count: 1 + count };
  }

  // return T.chain(space)
  //   .chain(record => ({ record, count: 0 }))
  //   .chain(
  //     T.loopWhile(
  //       ({ record }) => hasRemainUnoxygenateParcel(record),
  //       async ({ record, count }) => {
  //         await printer(count)(record);
  //         if (0 === count % 10) {
  //           console.log(nbRemainUnoxygenateParcel(record), count);
  //         }

  //         return { record: oxygen(record), count: 1 + count };
  //       }
  //     )
  //   )
  //   .chain(({ count }) => count)
  //   .value();
}

function getOxygenParcel(space, position) {
  return T.chain(space)
    .chain(recordToList)
    .chain(T.filter(({ status }) => STATUS.OXYGEN === status))
    .chain(
      T.filter(
        ({ x, y }) =>
          STATUS.OXYGEN !== getRecordValue(space, { x, y: y - 1 }) ||
          STATUS.OXYGEN !== getRecordValue(space, { x, y: y + 1 }) ||
          STATUS.OXYGEN !== getRecordValue(space, { x: x - 1, y }) ||
          STATUS.OXYGEN !== getRecordValue(space, { x: x + 1, y })
      )
    )
    .chain(T.push(position))
    .value();
}

function nbRemainUnoxygenateParcel(space) {
  return T.chain(space)
    .chain(recordToList)
    .chain(
      T.filter(({ status }) =>
        [STATUS.MOVED, STATUS.CURRENT, STATUS.START].includes(status)
      )
    )
    .chain(T.length())
    .value();
}

function hasRemainUnoxygenateParcel(space) {
  return 0 !== nbRemainUnoxygenateParcel(space);
}

function oxygenate(position) {
  return space => {
    return getOxygenParcel(space, position).reduce((record, { x, y }) => {
      const oxygenDiff = {};
      const n = getRecordValue(record, { x, y: y - 1 });
      const s = getRecordValue(record, { x, y: y + 1 });
      const e = getRecordValue(record, { x: x + 1, y });
      const w = getRecordValue(record, { x: x - 1, y });

      if ([STATUS.MOVED, STATUS.CURRENT, STATUS.START].includes(n)) {
        oxygenDiff[positionToRecordKey({ x, y: y - 1 })] = STATUS.OXYGEN;
      }
      if ([STATUS.MOVED, STATUS.CURRENT, STATUS.START].includes(s)) {
        oxygenDiff[positionToRecordKey({ x, y: y + 1 })] = STATUS.OXYGEN;
      }
      if ([STATUS.MOVED, STATUS.CURRENT, STATUS.START].includes(e)) {
        oxygenDiff[positionToRecordKey({ x: x + 1, y })] = STATUS.OXYGEN;
      }
      if ([STATUS.MOVED, STATUS.CURRENT, STATUS.START].includes(w)) {
        oxygenDiff[positionToRecordKey({ x: x - 1, y })] = STATUS.OXYGEN;
      }

      return { ...record, ...oxygenDiff };
    }, space);
  };
}

module.exports = {
  STATUS,
  DIRECTION,
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
  positionToRecordKey,
  spreadOxygen
};
