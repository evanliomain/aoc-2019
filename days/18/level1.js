const T = require('taninsam');
const chalk = require('chalk');

const {
  printMatrix,
  patternMatching,
  patternMatchingWith,
  mapMatrix,
  printMatrixToFile,
  then,
  findMatrix,
  findAllMatrix,
  atMatrix
} = require('../../tools');

const VAULT_ELEMENT_RE = {
  ENTRANCE: /@/,
  OPEN_PASSAGE: /\./,
  STONE_WALL: /#/,
  KEY: /[a-z]/,
  DOOR: /[A-Z]/
};
const VAULT_ELEMENT = {
  ENTRANCE: 'entrance',
  OPEN_PASSAGE: 'open_passage',
  STONE_WALL: 'stone_wall',
  KEY: 'key',
  DOOR: 'door'
};

const colorPalette = [
  '#a6cee3',
  '#1f78b4',
  '#b2df8a',
  '#33a02c',
  '#fb9a99',
  '#e31a1c',
  '#fdbf6f',
  '#ff7f00',
  '#cab2d6',
  '#6a3d9a',
  '#ffff99',
  '#b15928'
];

const DIRECTION = { NORTH: 'N', SOUTH: 'S', EAST: 'E', WEST: 'W' };
const DIRECTION_MOVE = {
  N: { dx: 0, dy: -1 },
  S: { dx: 0, dy: 1 },
  E: { dx: 1, dy: 0 },
  W: { dx: -1, dy: 0 }
};
const DIRECTION_PRINT = {
  N: 'triangle-up',
  S: 'triangle-down',
  E: 'triangle-right',
  W: 'triangle-left'
};
const DIRECTION_PRINT_CONSOLE = {
  N: '^',
  S: 'v',
  E: '>',
  W: '<'
};

module.exports = async function(input) {
  let states = start()(input);
  let stepCount = 0;

  while (!isStateWithAllKeys(states)) {
    states = nextStep(stepCount)(states);
    console.log(chalk.green(`-----------${stepCount}-----------`));

    console.log(`${states.length} spawn states`);
    // states.forEach(state => {
    //   console.log(state.position.x, state.position.y, state.direction);
    // });

    // states.forEach(state => {
    //   console.log(printConsole()(state));
    // });

    // if (20 + 15 === stepCount) {
    //   break;
    // }

    stepCount++;
  }
  const winner = findWinner(states);
  console.log(printConsole()(winner));

  return stepCount;
};

function nextStep(stepCount) {
  return states => {
    // printToFile(stepCount)(states[0]);
    return T.chain(states)
      .chain(T.map(state => spawn(possiblesDirection(state, stepCount))(state)))
      .chain(T.flat())
      .chain(T.map(move(stepCount)))
      .chain(T.sortBy(ownKeys))
      .chain(states => {
        const minOwnKey = T.chain(states)
          .chain(T.map(ownKeys))
          .chain(T.min())
          .value();
        const maxOwnKey = T.chain(states)
          .chain(T.map(ownKeys))
          .chain(T.max())
          .value();
        const tmpWinner = T.maxBy(ownKeys)(states);

        console.log(maxOwnKey, minOwnKey);
        // console.log(
        //   T.chain(states)
        //     .chain(T.map(getKeys))
        //     .chain(T.map(T.join('')))
        //     .chain(T.uniq())
        //     .chain(T.join('\n'))
        //     .value()
        // );

        // console.log(getKeys(tmpWinner).join(''));

        // if (6 <= maxOwnKey - minOwnKey) {
        //   return T.filter((state, i) => i < 1000)(states);
        // }

        if (maxOwnKey < 3) {
          return states;
        }

        return T.chain(states)
          .chain(T.filter(state => 0 !== getKeys(state).length))
          .chain(T.filter(state => 1 !== getKeys(state).length))
          .chain(
            T.unless(
              () => maxOwnKey - minOwnKey < 4,
              T.filter(state => 3 !== getKeys(state).length)
            )
          )
          .chain(
            T.unless(
              () => maxOwnKey - minOwnKey < 5,
              T.filter(state => 4 !== getKeys(state).length)
            )
          )
          .chain(
            T.map(state => {
              const keys = getKeys(state);
              const keyPath = keys.join('');
              const cost = keys[keys.length - 1];
              return { state, keyPath, cost };
            })
          )
          .chain(
            T.reduce((acc, { state, keyPath, cost }) => {
              if (T.isNil(acc[keyPath])) {
                acc[keyPath] = { states: [state], cost };
              } else if (cost < acc[keyPath].cost) {
                acc[keyPath] = { states: [state], cost };
              } else if (cost === acc[keyPath].cost) {
                acc[keyPath].states.push(state);
              }
              return acc;
            }, {})
          )
          .chain(T.values())
          .chain(T.map(({ states }) => states))
          .chain(T.flat())
          .value();

        return states;
      })
      .value();
  };
}

function spawn(directions) {
  return state =>
    T.chain(directions)
      .chain(T.map(direction => turn(direction)(state)))
      .value();
}

function possiblesDirection(state, stepCount = 0) {
  const direction = state.direction;
  const directions = [];
  const rDirection = reverseDirection(direction);
  // if (canGoTo(state)(direction)) {
  // if (!isOnKey(state, stepCount)) {
  directions.push(direction);
  // }
  if (!canGoTo(state)(direction) || isOnKey(state, stepCount)) {
    directions.push(rDirection);
  }
  // if (!canGoTo(state)(direction)) {
  directions.push(...orthogonalDirections(direction));
  // }

  return T.chain(directions)
    .chain(T.filter(canGoTo(state)))
    .value();
}
function allPossiblesDirection({ vault, position, keyring }) {
  return [
    DIRECTION.NORTH,
    DIRECTION.SOUTH,
    DIRECTION.WEST,
    DIRECTION.EAST
  ].filter(canGoTo({ vault, position, keyring }));
}
function orthogonalDirections(direction) {
  if (DIRECTION.NORTH === direction || DIRECTION.SOUTH === direction) {
    return [DIRECTION.EAST, DIRECTION.WEST];
  }
  if (DIRECTION.EAST === direction || DIRECTION.WEST === direction) {
    return [DIRECTION.NORTH, DIRECTION.SOUTH];
  }
}
function reverseDirection(direction) {
  switch (direction) {
    case DIRECTION.NORTH:
      return DIRECTION.SOUTH;
    case DIRECTION.SOUTH:
      return DIRECTION.NORTH;
    case DIRECTION.WEST:
      return DIRECTION.EAST;
    case DIRECTION.EAST:
      return DIRECTION.WEST;
  }
}

function canGoTo({ vault, position, keyring }) {
  return direction => {
    const value = atMatrix(nextPosition(direction)(position))(vault);
    const kind = identify(value);
    if (
      VAULT_ELEMENT.STONE_WALL === kind ||
      (VAULT_ELEMENT.DOOR === kind && !canOpenDoor(value)(keyring))
    ) {
      return false;
    }
    return true;
  };
}

/**
 * Is on a key and is this key is the last one collected
 */
function isOnKey({ vault, position, keyring }, stepCount) {
  const value = atMatrix(position)(vault);
  if (VAULT_ELEMENT.KEY === identify(value)) {
    // console.log('isOnKey', stepCount, keyring[value]);
  }
  return (
    VAULT_ELEMENT.KEY === identify(value) && stepCount - 1 === keyring[value]
  );
}

function pickColor(letter) {
  return T.chain(letter)
    .chain(l => l.toLowerCase())
    .chain(l => l.charCodeAt())
    .chain(code => code - 'a'.charCodeAt())
    .chain(code => colorPalette[code % colorPalette.length])
    .value();
}

function printConsole() {
  return ({ vault, position, direction, keyring, path }) => {
    return T.chain(vault)
      .chain(mapMatrix((e, x, y) => ({ e, x, y })))
      .chain(
        printMatrix(
          patternMatchingWith(
            [
              ({ x, y }) => x === position.x && y === position.y,
              () => chalk.red(DIRECTION_PRINT_CONSOLE[direction])
            ],
            [({ e }) => VAULT_ELEMENT_RE.ENTRANCE.test(e), () => '@'],
            [({ e }) => VAULT_ELEMENT_RE.STONE_WALL.test(e), () => '#'],
            [({ e }) => VAULT_ELEMENT_RE.OPEN_PASSAGE.test(e), () => '.'],
            [
              ({ e }) => VAULT_ELEMENT_RE.KEY.test(e),
              ({ e }) => {
                if (canOpenDoor(e)(keyring)) {
                  return '.';
                }
                return e;
              }
            ],
            [
              ({ e }) => VAULT_ELEMENT_RE.DOOR.test(e),
              ({ e }) => {
                if (canOpenDoor(e)(keyring)) {
                  return '.';
                }
                return e;
              }
            ]
          )
        )
      )
      .chain(str => `${str}\nremain keys: ${remainKeys({ keyring })}`)
      .chain(str => `${str}\nkeys: ${getKeys({ keyring }).join(' ')}`)
      .chain(str => `${str}\npath: ${path.join(' ')}`)
      .value();
  };
}

function printToFile(index) {
  return async ({ vault, position, direction, keyring }) => {
    const matrix = mapMatrix((e, x, y) => ({ e, x, y }))(vault);
    const filename = `vault/vault-${index}`;
    await printMatrixToFile(printerFile({ position, keyring, direction }))(
      filename,
      20
    )(matrix);
    return { vault, position, direction, keyring };
  };
}

function printerFile({ position, keyring, direction }) {
  return patternMatchingWith(
    [
      ({ x, y }) => x === position.x && y === position.y,
      () => ({
        shape: DIRECTION_PRINT[direction],
        fill: '#f44336',
        background: 'white',
        scale: 0.8
      })
    ],
    [
      ({ e }) => VAULT_ELEMENT_RE.ENTRANCE.test(e),
      () => ({
        shape: 'circle',
        fill: 'white',
        background: 'white',
        stroke: 'black',
        scale: 0.6
      })
    ],
    [({ e }) => VAULT_ELEMENT_RE.STONE_WALL.test(e), () => '#0095a8'],
    [({ e }) => VAULT_ELEMENT_RE.OPEN_PASSAGE.test(e), () => 'white'],
    [
      ({ e }) => VAULT_ELEMENT_RE.KEY.test(e),
      ({ e }) => {
        if (canOpenDoor(e)(keyring)) {
          return 'white';
        }
        return {
          shape: 'key',
          fill: pickColor(e),
          background: 'white',
          text: e
        };
      }
    ],
    [
      ({ e }) => VAULT_ELEMENT_RE.DOOR.test(e),
      ({ e }) => {
        if (canOpenDoor(e)(keyring)) {
          return 'white';
        }
        return {
          shape: 'door',
          fill: pickColor(e),
          background: 'white',
          text: e
        };
      }
    ]
  );
}

function getPosition(matrix) {
  return findMatrix(e => VAULT_ELEMENT_RE.ENTRANCE.test(e))(matrix);
}

function getKeyring(matrix) {
  return T.chain(matrix)
    .chain(findAllMatrix(e => VAULT_ELEMENT_RE.KEY.test(e)))
    .chain(T.toObject(e => atMatrix(e)(matrix), () => false))
    .value();
}

function start() {
  return vault =>
    T.chain({
      vault,
      position: getPosition(vault),
      keyring: getKeyring(vault),
      path: []
    })
      .chain(state => spawn(allPossiblesDirection(state))(state))
      .value();
}

function isStateWithAllKeys(states) {
  return T.chain(states)
    .chain(T.map(hasAllKeys))
    .chain(T.some(x => x))
    .value();
}

function findWinner(states) {
  return states.find(hasAllKeys);
}

function hasAllKeys({ keyring }) {
  return T.chain(keyring)
    .chain(T.values())
    .chain(T.every(x => x))
    .value();
}

function remainKeys({ keyring }) {
  return T.chain(keyring)
    .chain(T.values())
    .chain(T.filter(x => !x))
    .chain(T.length())
    .value();
}
function ownKeys({ keyring }) {
  return T.chain(keyring)
    .chain(T.values())
    .chain(T.filter(x => x))
    .chain(T.length())
    .value();
}
function getKeys({ keyring }) {
  return T.chain(keyring)
    .chain(T.entries())
    .chain(T.filter(([key, step]) => step))
    .chain(T.sortBy(([key, step]) => step))
    .chain(T.map(([key, step]) => key))
    .value();
}

function move(stepCount) {
  return ({ vault, position, direction, keyring, path }) => {
    const newPosition = nextPosition(direction)(position);
    const value = atMatrix(newPosition)(vault);
    const kind = identify(value);
    if (VAULT_ELEMENT.STONE_WALL === kind) {
      return { vault, position, direction, keyring, path };
    }
    if (VAULT_ELEMENT.DOOR === kind) {
      if (canOpenDoor(value)(keyring)) {
        return {
          vault,
          position: newPosition,
          direction,
          keyring,
          path: [...path, direction]
        };
      } else {
        return { vault, position, direction, keyring, path };
      }
    }
    if (VAULT_ELEMENT.KEY === kind && !keyring[value]) {
      return {
        vault, //: clearKey(newPosition)(vault),
        position: newPosition,
        direction,
        keyring: { ...keyring, [value]: stepCount },
        path: [...path, direction]
      };
    }
    // if (
    //   VAULT_ELEMENT.OPEN_PASSAGE === kind ||
    //   VAULT_ELEMENT.ENTRANCE === kind
    // ) {
    return {
      vault,
      position: newPosition,
      direction,
      keyring,
      path: [...path, direction]
    };
    // }
  };
}

function turn(direction) {
  return ({ vault, position, keyring, path }) => ({
    vault,
    position,
    direction,
    keyring,
    path
  });
}

function nextPosition(direction) {
  return ({ x, y }) => ({
    x: x + DIRECTION_MOVE[direction].dx,
    y: y + DIRECTION_MOVE[direction].dy
  });
}

function identify(element) {
  return patternMatchingWith(
    [e => VAULT_ELEMENT_RE.ENTRANCE.test(e), () => VAULT_ELEMENT.ENTRANCE],
    [e => VAULT_ELEMENT_RE.STONE_WALL.test(e), () => VAULT_ELEMENT.STONE_WALL],
    [
      e => VAULT_ELEMENT_RE.OPEN_PASSAGE.test(e),
      () => VAULT_ELEMENT.OPEN_PASSAGE
    ],
    [e => VAULT_ELEMENT_RE.KEY.test(e), () => VAULT_ELEMENT.KEY],
    [e => VAULT_ELEMENT_RE.DOOR.test(e), () => VAULT_ELEMENT.DOOR]
  )(element);
}

function clearKey(position) {
  return mapMatrix((cell, x, y) => {
    if (x === position.x && y === position.y) {
      return '.';
    }
    return cell;
  });
}

function canOpenDoor(door) {
  return keyring => keyring[door.toLowerCase()];
}

function toPromise() {
  return value => Promise.resolve(value);
}
