const pkg = require('../package.json');
const year = pkg.aocYear;
const chalk = require('chalk');
const T = require('taninsam');

const format = require('date-fns/fp/format');
const parse = require('date-fns/fp/parse');
const addDays = require('date-fns/fp/addDays');

const tendancySpec = require('../stats/tendancy.vg.json');
const classementSpec = require('../stats/classement2.vg.json');
const generateChartFile = require('../stats/generate-chart-file');
const getData = require('../stats/get-data');
const statsToChartData = require('../stats/stats-to-chart-data');
const writeFile = require('../stats/write-file');
const then = require('../tools/then');
const log = require('../tools/log');

const execCommand = require('../utils/exec-command');

const fs = require('fs');
const rimraf = require('rimraf');

const leaderboard = require('../leaderboard.json');

// Because of a bug in the day 6 puzzle that made it unsolvable
// for some users until about two hours after unlock,
// day 6 is worth no points.
const daysWithNoPoint = [6];
const nbDays = 60;

async function main() {
  rimraf.sync('dist');
  fs.mkdirSync('dist/classement', { recursive: true });

  console.log(
    'Get stats data from AoC: ' +
      [
        chalk.magenta(`year: `, chalk.bold(year)),
        chalk.cyan(`leaderboard: `, chalk.bold(leaderboard))
      ].join(' - ')
  );
  const data = await getData({ year, leaderboard });
  console.log('Transform data');
  const chartData = statsToChartData(year, nbDays, daysWithNoPoint)(data);
  await writeFile('dist/data.json')(JSON.stringify(chartData, 2));

  // Generate Tendancy
  console.log(`Generating tendancy-${year} chart`);
  await generateChartFile(tendancySpec, `tendancy-${year}`)(chartData).then(
    log(path => 'Tendancy chart generated at ' + chalk.blue(path))
  );

  // Generate Classement by day
  console.log(`Generating classement-* chart`);
  await generateClassments(year, chartData, nbDays);

  console.log(`Generating classement animation chart`);
  await execCommand(
    `convert -delay 10 -loop 1 dist/classement/*.png dist/classement-${year}.gif`
  );
  rimraf.sync('dist/classement');
  console.log(
    'Animated chart generated at ' + chalk.blue(`dist/classement-${year}.gif`)
  );

  console.log(chalk.green('Charts generated'));
}

main().catch(() => {});

function getDate(year) {
  return i =>
    T.chain(`${year}-12-01T00:00:00.000`)
      .chain(parse(new Date())("yyyy-MM-dd'T'HH:mm:ss.SSS"))
      .chain(addDays(i))
      .chain(format('yyyy-MM-dd'))
      .value();
}

async function generateClassments(year, chartData, nbDays) {
  const gen = generateClassment(year, chartData);
  for (let i = 1; i < nbDays; i++) {
    await gen(i);
  }
}

function generateClassment(year, chartData) {
  const toDate = getDate(year);
  return async i => {
    const date = toDate(i);
    classementSpec.title = `Classement AoC ${date}`;
    await generateChartFile(classementSpec, `classement/classement-${date}`, [
      {
        name: 'scoreDate',
        value: date
      }
    ])(chartData).then(
      log(path => 'Tempory chart generated at ' + chalk.grey(path))
    );
  };
}
