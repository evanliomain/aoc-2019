const T = require('taninsam');
const chalk = require('chalk');
const {
  printMatrix,
  patternMatching,
  chunk,
  replaceAt
} = require('../../tools');

const { execute } = require('../../intcode-computer');

const execOptions = { debug: false, runUntilHalt: true };


// TODO: A faire



module.exports = function(program) {
  return (
    // T.chain(genInputs())
    T.chain([
      [1, 0, 0, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]
    ])
      .chain(
        T.map(input => {
          const arcade = run(program, 2, input);
          if (0 !== arcade.score) {
            console.log(input, arcade.score);
          }
          return arcade;
        })
      )
      .chain(T.head())
      .chain(printArcadeScreen)
      // .chain(T.map(({ score }) => score))
      // .chain(T.map(({ score }) => score))
      .value()
  );
};

function run(program, quarter, joystickPosition) {
  return T.chain(program)
    .chain(replaceAt(0, quarter))
    .chain(p =>
      execute(
        p,
        joystickPosition,
        {
          instructionPointer: 0,
          relativeBase: 0
        },
        execOptions
      )
    )
    .chain(({ output }) => output)
    .chain(chunk(3))
    .chain(getArcadeScreen)
    .value();
}

function outputToScreenMap(output) {
  const i = 0;
  const nbTile = 1050;
  const decalage = 17 + 2 + 2 + 2 + 2 + 2 + 2 + 2 + 2 + 2;
  console.log(output.length);

  console.log(output.slice(nbTile + decalage));

  return T.chain(output)
    .chain(arr => arr.slice(i * nbTile, (1 + i) * nbTile + decalage))
    .chain(
      T.reduce((acc, [x, y, id]) => {
        acc[`${x},${y}`] = id;
        return acc;
      }, {})
    )
    .value();
}

function getArcadeScreen(output) {
  const xmax = T.maxBy(([x, y]) => x)(output)[0];
  const ymax = T.maxBy(([x, y]) => y)(output)[1];

  const screenMap = outputToScreenMap(output);

  score = screenMap[`${-1},${0}`];

  const screen = [];

  for (let raw = 0; raw <= ymax; raw++) {
    const r = [];
    for (let col = 0; col <= xmax; col++) {
      r.push(screenMap[`${col},${raw}`]);
    }
    screen.push(r);
  }
  return { score, screen };
}

function printArcadeScreen({ score, screen }) {
  return `Score: ${chalk.green(score)}\n` + print(screen);
}

function print(matrix) {
  return printMatrix(
    patternMatching(
      [0, () => chalk.bgBlack(' ')],
      [1, () => chalk.bgMagenta(' ')],
      [2, () => chalk.bgGreen.white(' ')],
      [3, () => chalk.bgBlack.yellow('_')],
      [4, () => chalk.bgBlack.red('o')]
    )
  )(matrix);
}

function genInputs() {
  const inputs = [];
  for (let i1 = -1; i1 <= 1; i1++) {
    for (let i2 = -1; i2 <= 1; i2++) {
      for (let i3 = -1; i3 <= 1; i3++) {
        for (let i4 = -1; i4 <= 1; i4++) {
          for (let i5 = -1; i5 <= 1; i5++) {
            for (let i6 = -1; i6 <= 1; i6++) {
              for (let i7 = -1; i7 <= 1; i7++) {
                for (let i8 = -1; i8 <= 1; i8++) {
                  for (let i9 = -1; i9 <= 1; i9++) {
                    for (let i10 = -1; i10 <= 1; i10++) {
                      inputs.push([i1, i2, i3, i4, i5, i6, i7, i8, i9, i10]);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return inputs;
}
