const T = require('taninsam');
const chalk = require('chalk');
const {
  chunk,
  mapMatrix,
  makeMatrix,
  atMatrix,
  printMatrix,
  patternMatching,
  parseInteger,
  printMatrixToFile
} = require('../../tools');

const ERIS_ELEMENT = {
  BUG: '#',
  EMPTY_SPACE: '.',
  RECURSIVE: '?'
};
const ERIS_SIZE = 5;

module.exports = {
  printSpaceToConsole,
  printConsoleLevel,
  hash,
  nextGeneration,
  start,
  next,nextNPrint,
  appearTwice,
  getAppearTwiceHash,
  startRecursive,
  nextRecursive,
  countBugs
};

const hashMatrix = generateHashMatrix();

function start() {
  return matrix => ({ space: matrix, hashs: { [hash()(matrix)]: 1 } });
}

function next() {
  return  state => {
    const nextSpace = nextGeneration()(state.space);
    const nextHash = hash()(nextSpace);
    const count =
      1 + (T.isNil(state.hashs[nextHash]) ? 0 : state.hashs[nextHash]);

    return { space: nextSpace, hashs: { ...state.hashs, [nextHash]: count } };
  };
}

function nextNPrint() {
  let counter = 0;
  return async state => {
    const nextSpace = nextGeneration()(state.space);
    const nextHash = hash()(nextSpace);
    const count =
      1 + (T.isNil(state.hashs[nextHash]) ? 0 : state.hashs[nextHash]);
    counter++;

    await printToFile(counter)(nextSpace);

    return { space: nextSpace, hashs: { ...state.hashs, [nextHash]: count } };
  };
}

function appearTwice() {
  return ({ hashs }) =>
    T.chain(hashs)
      .chain(T.values())
      .chain(T.filter(x => 2 === x))
      .chain(T.length())
      .chain(x => 0 !== x)
      .value();
}

function getAppearTwiceHash() {
  return ({ hashs }) =>
    T.chain(hashs)
      .chain(T.entries())
      .chain(T.find(([hash, occurence]) => 2 === occurence))
      .chain(([hash, occurence]) => hash)
      .chain(parseInteger())
      .value();
}

function printConsoleLevel() {
  return state =>
    T.chain(state)
      .chain(T.entries())
      .chain(T.map(([level, matrix]) => [parseInteger()(level), matrix]))
      .chain(T.sortBy(([level]) => level))
      .chain(
        T.map(([level, matrix]) => [
          level < 0
            ? chalk.red(`Depth ${level}:`)
            : 0 < level
            ? chalk.green(`Depth ${level}:`)
            : chalk.blue(`Depth ${level}:`),
          matrix
        ])
      )
      .chain(
        T.map(
          ([level, matrix]) =>
            `-----\n${level}\n-----\n${printToConsole()(matrix)}`
        )
      )
      .chain(T.join('\n'))
      .value();
}
function printSpaceToConsole(index) {
  return ({ space }) => printToConsole(index)(space);
}
function printToConsole(index) {
  return matrix =>
    `>${index}\n` +
    printMatrix(
      patternMatching(
        [ERIS_ELEMENT.BUG, () => '#'],
        [ERIS_ELEMENT.EMPTY_SPACE, () => '.'],
        [ERIS_ELEMENT.RECURSIVE, () => '?']
      )
    )(matrix);
}
function printToFile(index) {
  return printMatrixToFile(
    patternMatching(
      [ERIS_ELEMENT.BUG, () => '#b61827'],
      [ERIS_ELEMENT.EMPTY_SPACE, () => 'white'],
      [ERIS_ELEMENT.RECURSIVE, () => 'black']
    )
  )(`game-of-life/game-of-life.${String(index).padStart(4, '0')}`, 100);
}

function hash() {
  return hashEris(hashMatrix);
}

function generateHashMatrix() {
  let i = 1;
  const res = [];
  const size = ERIS_SIZE * ERIS_SIZE;
  for (let index = 0; index < size; index++) {
    res.push(i);
    i *= 2;
  }
  return chunk(5)(res);
}

function hashEris(hashMatrix) {
  return space =>
    T.chain(space)
      .chain(
        mapMatrix((cell, x, y) =>
          ERIS_ELEMENT.EMPTY_SPACE === cell ? 0 : atMatrix({ x, y })(hashMatrix)
        )
      )
      .chain(T.flat())
      .chain(T.sum())
      .value();
}

function rule() {
  return ({ element, nbAdjacentBugs }) => {
    if (ERIS_ELEMENT.BUG === element) {
      return 1 === nbAdjacentBugs ? ERIS_ELEMENT.BUG : ERIS_ELEMENT.EMPTY_SPACE;
    }
    if (ERIS_ELEMENT.EMPTY_SPACE === element) {
      return 1 === nbAdjacentBugs || 2 === nbAdjacentBugs
        ? ERIS_ELEMENT.BUG
        : ERIS_ELEMENT.EMPTY_SPACE;
    }
    return element;
  };
}

function nextGeneration() {
  return matrix =>
    T.chain(matrix)
      .chain(
        mapMatrix((element, x, y) => ({
          element,
          nbAdjacentBugs: T.chain(positionToNeighboors({ x, y }))
            .chain(T.filter(isInside))
            .chain(T.filter(({ x, y }) => isBug(atMatrix({ x, y })(matrix))))
            .chain(T.length())
            .value()
        }))
      )
      .chain(mapMatrix(rule()))
      .value();
}
function isInside({ x, y }) {
  return 0 <= x && x < ERIS_SIZE && 0 <= y && y < ERIS_SIZE;
}

function markMiddle() {
  return mapMatrix((cell, x, y) =>
    2 === x && 2 === y ? ERIS_ELEMENT.RECURSIVE : cell
  );
}
function makeRecursiveSpace() {
  return makeMatrix((x, y) =>
    2 === x && 2 === y ? ERIS_ELEMENT.RECURSIVE : ERIS_ELEMENT.EMPTY_SPACE
  )({ sizeX: ERIS_SIZE, sizeY: ERIS_SIZE });
}

function startRecursive() {
  return matrix => ({ 0: markMiddle()(matrix) });
}

function nextRecursive() {
  return (state, count) => {
    const { min, max } = T.chain(state)
      .chain(T.keys())
      .chain(T.map(parseInteger()))
      .link('levels')
      .chain(T.min())
      .link('min')
      .chain((_, { levels }) => levels)
      .chain(T.max())
      .link('max')
      .chain((_, { min, max }) => ({ min, max }))
      .value();

    const newState = {};

    newState[0] = nextGenerationRecursive(state)(0);

    for (let level = 1; level <= max; level++) {
      newState[level] = nextGenerationRecursive(state)(level);
    }
    for (let level = -1; min <= level; level--) {
      newState[level] = nextGenerationRecursive(state)(level);
    }

    if (hasBugOnEdge()(state[min])) {
      newState[min - 1] = nextGenerationRecursive({
        ...state,
        [min - 1]: makeRecursiveSpace()
      })(min - 1);
    }

    if (hasBugOnInnerEdge()(state[max])) {
      newState[max + 1] = nextGenerationRecursive({
        ...state,
        [max + 1]: makeRecursiveSpace()
      })(max + 1);
    }

    return newState;
  };
}

function countBugs() {
  return state =>
    T.chain(state)
      .chain(T.values())
      .chain(T.map(T.flat()))
      .chain(T.map(T.filter(cell => ERIS_ELEMENT.BUG === cell)))
      .chain(T.map(T.length()))
      .chain(T.sum())
      .value();
}

function nextGenerationRecursive(state) {
  const at = atMatrixRec(state);
  return level =>
    T.chain(state[level])
      .chain(
        mapMatrix((element, x, y) => ({
          element,
          nbAdjacentBugs: T.chain(getAdjacents(state)({ x, y, level }))
            .chain(T.map(({ x, y, level }) => at({ x, y, level })))
            .chain(T.filter(isBug))
            .chain(T.length())
            .value()
        }))
      )
      .chain(mapMatrix(rule()))
      .value();
}

function getAdjacents(state) {
  const at = atMatrixRec(state);
  return ({ x, y, level }) => {
    // top left
    if (0 === x && 0 === y) {
      return [
        { x: x + 1, y, level },
        { x, y: y + 1, level },
        { x: 2, y: 1, level: level - 1 },
        { x: 1, y: 2, level: level - 1 }
      ];
    }
    // bottom left
    if (0 === x && ERIS_SIZE - 1 === y) {
      return [
        { x: x + 1, y, level },
        { x, y: y - 1, level },
        { x: 2, y: 3, level: level - 1 },
        { x: 1, y: 2, level: level - 1 }
      ];
    }
    // top right
    if (ERIS_SIZE - 1 === x && 0 === y) {
      return [
        { x: x - 1, y, level },
        { x, y: y + 1, level },
        { x: 2, y: 1, level: level - 1 },
        { x: 3, y: 2, level: level - 1 }
      ];
    }
    // bottom right
    if (ERIS_SIZE - 1 === x && ERIS_SIZE - 1 === y) {
      return [
        { x: x - 1, y, level },
        { x, y: y - 1, level },
        { x: 2, y: 3, level: level - 1 },
        { x: 3, y: 2, level: level - 1 }
      ];
    }
    // left
    if (0 === x) {
      return [
        { x: x + 1, y, level },
        { x, y: y - 1, level },
        { x, y: y + 1, level },
        { x: 1, y: 2, level: level - 1 }
      ];
    }
    // right
    if (ERIS_SIZE - 1 === x) {
      return [
        { x: x - 1, y, level },
        { x, y: y - 1, level },
        { x, y: y + 1, level },
        { x: 3, y: 2, level: level - 1 }
      ];
    }
    // top
    if (0 === y) {
      return [
        { x, y: y + 1, level },
        { x: x - 1, y, level },
        { x: x + 1, y, level },
        { x: 2, y: 1, level: level - 1 }
      ];
    }
    // bottom
    if (ERIS_SIZE - 1 === y) {
      return [
        { x, y: y - 1, level },
        { x: x - 1, y, level },
        { x: x + 1, y, level },
        { x: 2, y: 3, level: level - 1 }
      ];
    }
    // top recursive
    if (2 === x && 1 === y) {
      return [
        { x, y: y - 1, level },
        { x: x - 1, y, level },
        { x: x + 1, y, level },
        ...topEdges(level + 1)
      ];
    }
    // bottom recursive
    if (2 === x && 3 === y) {
      return [
        { x, y: y + 1, level },
        { x: x - 1, y, level },
        { x: x + 1, y, level },
        ...bottomEdges(level + 1)
      ];
    }
    // left recursive
    if (1 === x && 2 === y) {
      return [
        { x: x - 1, y, level },
        { x, y: y - 1, level },
        { x, y: y + 1, level },
        ...leftEdges(level + 1)
      ];
    }
    // right recursive
    if (3 === x && 2 === y) {
      return [
        { x: x + 1, y, level },
        { x, y: y - 1, level },
        { x, y: y + 1, level },
        ...rightEdges(level + 1)
      ];
    }
    // inside
    return T.chain(positionToNeighboors({ x, y }))
      .chain(T.map(({ x, y }) => ({ x, y, level })))
      .value();
  };
}

function atMatrixRec(state) {
  return ({ x, y, level }) =>
    T.isNil(state[level])
      ? ERIS_ELEMENT.EMPTY_SPACE
      : atMatrix({ x, y })(state[level]);
}

function hasBugOnEdge() {
  return matrix =>
    T.chain(matrix)
      .chain(
        mapMatrix((cell, x, y) => (isEdge({ x, y }) ? isBug(cell) : false))
      )
      .chain(T.flat())
      .chain(T.some(cell => cell))
      .value();
}

function hasBugOnInnerEdge() {
  return matrix =>
    T.chain(matrix)
      .chain(
        mapMatrix((cell, x, y) => (isInnerEdge({ x, y }) ? isBug(cell) : false))
      )
      .chain(T.flat())
      .chain(T.some(cell => cell))
      .value();
}

function isInnerEdge({ x, y }) {
  return (
    (2 === x && 1 === y) ||
    (2 === x && 3 === y) ||
    (1 === x && 2 === y) ||
    (3 === x && 2 === y)
  );
}
function isEdge({ x, y }) {
  return 0 === x || ERIS_SIZE - 1 === x || 0 === y || ERIS_SIZE - 1 === y;
}
function isBug(cell) {
  return ERIS_ELEMENT.BUG === cell;
}
function topEdges(level) {
  const y = 0;
  return T.chain(0)
    .chain(T.arrayFromValue(ERIS_SIZE))
    .chain(T.map((_, x) => ({ x, y, level })))
    .value();
}
function bottomEdges(level) {
  const y = ERIS_SIZE - 1;
  return T.chain(0)
    .chain(T.arrayFromValue(ERIS_SIZE))
    .chain(T.map((_, x) => ({ x, y, level })))
    .value();
}
function leftEdges(level) {
  const x = 0;
  return T.chain(0)
    .chain(T.arrayFromValue(ERIS_SIZE))
    .chain(T.map((_, y) => ({ x, y, level })))
    .value();
}
function rightEdges(level) {
  const x = ERIS_SIZE - 1;
  return T.chain(0)
    .chain(T.arrayFromValue(ERIS_SIZE))
    .chain(T.map((_, y) => ({ x, y, level })))
    .value();
}

/**
 * Find neighboors of a position: top, right, bottom, left
 * @param {x, y} position
 * @returns {x, y}[]
 */
function positionToNeighboors({ x, y }) {
  return [{ x, y: y - 1 }, { x: x + 1, y }, { x, y: y + 1 }, { x: x - 1, y }];
}
