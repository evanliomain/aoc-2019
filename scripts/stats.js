const pkg = require('../package.json');
const year = pkg.aocYear;
const chalk = require('chalk');
const T = require('taninsam');

const format = require('date-fns/fp/format');
const parse = require('date-fns/fp/parse');
const addDays = require('date-fns/fp/addDays');
const addMinutes = require('date-fns/fp/addMinutes');
const addHours = require('date-fns/fp/addHours');

const tendancySpec = require('../stats/tendancy.vg.json');
const classementSpec = require('../stats/classement2.vg.json');
const generateChartFile = require('../stats/generate-chart-file');
const getData = require('../stats/get-data');
const statsToChartData = require('../stats/stats-to-chart-data');
const writeFile = require('../stats/write-file');
const then = require('../tools/then');
const log = require('../tools/log');
const { extractStats } = require('../utils/extract-args');

const execCommand = require('../utils/exec-command');

const fs = require('fs');
const rimraf = require('rimraf');

const leaderboard = require('../leaderboard.json');

// Because they can be bugs, some days may worth no points.
const daysWithNoPoint = [];

const width = 1000;
const height = 1200;

async function main() {
  rimraf.sync('dist');
  fs.mkdirSync('dist/classement', { recursive: true });

  // Extract arguments
  const { day } = extractStats(process.argv);

  console.log(
    'Get stats data from AoC: ' +
      [
        chalk.magenta(`year: `, chalk.bold(year)),
        chalk.green(`day:`, chalk.bold(day)),
        chalk.cyan(`leaderboard: `, chalk.bold(leaderboard))
      ].join(' - ')
  );
  const data = await getData({ year, leaderboard });
  console.log('Transform data');
  const chartData = statsToChartData(year, day, daysWithNoPoint)(data);
  await writeFile(`dist/data-${year}-${day}-${leaderboard}.json`)(
    JSON.stringify(chartData, 2)
  );

  // Generate Tendancy
  console.log(`Generating tendancy-${year} chart`);
  await generateChartFile(tendancySpec, {
    chartName: `tendancy-${year}-${day}`,
    width,
    height
  })(chartData).then(
    log(path => 'Tendancy chart generated at ' + chalk.blue(path))
  );

  // Generate Classement by day
  console.log(`Generating classement-* chart`);
  await generateClassments(year, chartData, day);

  console.log(`Generating classement animation chart`);
  await execCommand(
    `convert -delay 100 -loop 1 dist/classement/*.png dist/classement-${year}-${day}.gif`
  );
  rimraf.sync('dist/classement');
  console.log(
    'Animated chart generated at ' +
      chalk.blue(`dist/classement-${year}-${day}.gif`)
  );

  console.log(chalk.green('Charts generated'));
}

main().catch(() => {});

function getDate(year, numeroDay) {
  return i =>
    T.chain(`${year}-12-${numeroDay}T00:00:00.000-05`)
      .chain(parse(new Date())("yyyy-MM-dd'T'HH:mm:ss.SSSx"))
      // .chain(addDays(i))
      // .chain(addMinutes(i))
      .chain(addHours(i))
      .chain(format("yyyy-MM-dd'T'HH:mm:ss"))
      .value();
}

async function generateClassments(year, chartData, numeroDay) {
  const gen = generateClassment(year, chartData, numeroDay);
  // const minutes = makeArray(x => 15 * x)(24 * 4);
  // for (let i = 0; i < minutes.length; i++) {
  //   await gen(minutes[i]);
  // }
  const n = 24;
  for (let i = 0; i < n; i++) {
    await gen(i);
  }
}

function generateClassment(year, chartData, numeroDay) {
  const toDate = getDate(year, numeroDay);
  return async i => {
    const date = toDate(i);
    classementSpec.title = `Classement AoC ${date}`;
    await generateChartFile(
      classementSpec,
      {
        chartName: `classement/classement-${date}`,
        width,
        height
      },
      [
        {
          name: 'scoreDate',
          value: date
        }
      ]
    )(chartData).then(
      log(path => 'Temporary chart generated at ' + chalk.grey(path))
    );
  };
}
