const T = require('taninsam');
const chalk = require('chalk');
const fs = require('fs');
const {
  makeMatrix,
  mapMatrix,
  printMatrix,
  findAllMatrix,
  patternMatching,
  printMatrixToFile,
  patternMatchingWith
} = require('../../tools');

const matrix1500 = require('../../output/tractor-beam-1500.json');

const { execute } = require('../../intcode-computer');

const execOptions = { debug: false, runUntilHalt: false };

const DRONE_STATE = {
  STATIONARY: 0,
  PULLED: 1,
  SHIP: 2
};

const size = 1500;

const dim = { sizeX: size, sizeY: size };

module.exports = function(program) {
  // You can generate the matrix first,
  // and save it into a file to speed up iteration on next algorithme

  // const matrix = getMatrix(program);
  const matrix = matrix1500;

  // fs.writeFileSync(`output/tractor-beam-${size}.json`, JSON.stringify(matrix));
  // return;

  const findSquare = finderSquare(matrix);

  let isSquare = false;
  let squareSize = 0;
  let res;
  let index = 1400; //Math.floor((dim.sizeX * 3) / 5) + 1;

  const yBottom = findMatrixByRaw(
    raw => DRONE_STATE.PULLED === raw[size - 1].value
  )(matrix);

  const yTop = findMatrixByRaw(
    raw =>
      yBottom < raw[size - 1].y &&
      DRONE_STATE.STATIONARY === raw[size - 1].value
  )(matrix);

  const m1 = yBottom / (size - 1);
  const m2 = yTop / (size - 1);

  const x2 = Math.floor((m1 * 99 + 99) / (m2 - m1));
  const y1 = Math.floor(m2 * x2 - 99);
  return 10000 * x2 + y1;

  // printFile(dim)(
  //   mapMatrix(({ x, y, value }) => ({
  //     x,
  //     y,
  //     value: isInSquare({ x, y }, res) ? DRONE_STATE.SHIP : value
  //   }))(matrix)
  // );
};

function isInSquare(
  { x, y },
  { yRightCorner, xRightCorner, xLeftCorner, yLeftCorner }
) {
  return (
    xLeftCorner <= x &&
    x <= xRightCorner &&
    yRightCorner <= y &&
    y <= yLeftCorner
  );
}

function finderSquare(matrix) {
  return startIndex => {
    const yRightCorner = findMatrixByRaw(
      raw => DRONE_STATE.PULLED === raw[startIndex].value
    )(matrix);
    const xRightCorner = startIndex;

    // console.log('xRightCorner', xRightCorner);
    // console.log('yRightCorner', yRightCorner);

    let xLeftCorner = xRightCorner;
    let isSquare = false;
    let squareHeight = 1000;
    let squareWidth = xRightCorner - xLeftCorner;
    let yCursor;

    while (squareWidth < squareHeight) {
      xLeftCorner--;
      yCursor = yRightCorner;

      while (DRONE_STATE.PULLED === matrix[yCursor][xLeftCorner].value) {
        yCursor++;
      }
      yCursor--;

      squareHeight = yCursor - yRightCorner;
      squareWidth = xRightCorner - xLeftCorner;
      isSquare = squareHeight === squareWidth;
    }
    return {
      isSquare,
      yRightCorner,
      xRightCorner,
      xLeftCorner,
      squareHeight,
      squareWidth,
      yLeftCorner: yCursor,
      size: squareWidth,
      answer: 10000 * xLeftCorner + yRightCorner
    };
  };
}

function getMatrix(program) {
  const get = getDroneState(program);
  const minX = 1300; //(size * 3) / 5

  return (
    T.chain(dim)
      .chain(makeMatrix(() => DRONE_STATE.STATIONARY))
      .chain(
        mapMatrix((cell, x, y) => {
          if (x < minX) {
            return cell;
          }
          // if (
          //   Math.floor(x * coeffBottom) - delta < y &&
          //   y < Math.floor(x * coeffUp) + delta
          // ) {
          return get(x, y);
          // }
          return cell;
        })
      )
      .chain(mapMatrix((value, x, y) => ({ value, x, y })))
      // .chain(printFile(dim))
      // .chain(printMatrix(x => x))
      // .chain(
      //   printMatrix(
      //     patternMatching(
      //       [DRONE_STATE.STATIONARY, () => ' '],
      //       [DRONE_STATE.PULLED, () => chalk.bgRed(' ')]
      //     )
      //   )
      // )

      // .chain(() => dim)
      // .chain(findAllMatrix(cell => DRONE_STATE.PULLED === cell))
      // .chain(T.length())
      .value()
  );
}

function getDroneState(program) {
  return (x, y) =>
    execute(
      program,
      [x, y],
      { instructionPointer: 0, relativeBase: 0 },
      execOptions
    ).output;
}

function printConsole(matrix) {
  return (
    T.chain(matrix)
      .chain(printMatrix(({ value }) => value))
      // .chain(
      //   printMatrix(
      //     patternMatching(
      //       [DRONE_STATE.STATIONARY, () => ' '],
      //       [DRONE_STATE.PULLED, () => chalk.bgRed(' ')]
      //     )
      //   )
      // )
      .value()
  );
}

function printFile({ sizeX, sizeY }) {
  return matrix =>
    printMatrixToFile(printerFile())(`tractor-beam_${sizeX}x${sizeY}`, 2, true)(
      matrix
    );
}
function printerFile() {
  return patternMatchingWith(
    [
      ({ value }) => DRONE_STATE.SHIP === value,
      () => ({ shape: 'rect', fill: 'white', stroke: 'black', opacity: 0.5 })
    ],
    [
      ({ value, x, y }) => Math.floor(x * coeffBottom) === y,
      () => ({ shape: 'rect', fill: 'green', stroke: 'black' })
    ],
    [
      ({ value, x, y }) => Math.floor(x * coeffUp) === y,
      () => ({ shape: 'rect', fill: 'blue', stroke: 'black' })
    ],
    [
      ({ value, x, y }) => DRONE_STATE.PULLED === value,
      () => ({ shape: 'rect', fill: 'red', stroke: 'black' })
    ],
    [
      ({ value, x, y }) =>
        DRONE_STATE.STATIONARY === value &&
        (0 === x || 0 === y || dim.sizeX - 1 === x || dim.sizeY - 1 === y),
      () => ({ shape: 'rect', fill: 'white', stroke: 'black' })
    ]
  );
}

function findMatrixByRaw(match) {
  return matrix => {
    for (let y = 0; y < matrix.length; y++) {
      if (match(matrix[y])) {
        return y;
      }
    }
  };
}
