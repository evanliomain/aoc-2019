const T = require('taninsam');
const format = require('date-fns/fp/format');
const parse = require('date-fns/fp/parse');
const addDays = require('date-fns/fp/addDays');
const addMinutes = require('date-fns/fp/addMinutes');
const addHours = require('date-fns/fp/addHours');
const makeArray = require('../tools/make-array');
const players = require('../playeurs.json');
const log = require('../tools/log');

module.exports = { statsToChartData, rawToResult };

function statsToChartData(year, numeroDay, daysWithNoPoint) {
  return stats =>
    T.chain(24)
      .chain(makeArray(x => x))
      .chain(
        T.map(
          computeDateScore(
            year,
            numeroDay,
            getNbMembers(stats),
            getMembers(stats),
            rawToResult(daysWithNoPoint)(stats)
          )
        )
      )
      .chain(T.flat())
      .chain(
        T.map(d => {
          if (!players[d.name]) {
            console.log(`Configuration for ${d.name} is missing`);
          }
          return d;
        })
      )
      .chain(
        T.map(d => ({
          ...d,
          firstname: players[d.name].firstname,
          lastname: players[d.name].lastname
        }))
      )
      .value();
}

function getMembers(stats) {
  return T.chain(stats.members)
    .chain(T.values())
    .chain(T.map(({ id, name, local_score }) => [id, { name, local_score }]))
    .chain(T.fromEntries())
    .value();
}
function getNbMembers(stats) {
  return T.chain(stats.members)
    .chain(T.values())
    .chain(T.length())
    .value();
}

function rawToResult(daysWithNoPoint) {
  return raw =>
    T.chain(raw.members)
      .chain(T.values())
      .chain(
        T.map(member => [
          T.chain(member.completion_day_level)
            .chain(T.entries())
            .chain(
              T.map(([day, completion_level]) => ({
                id: member.id,
                name: member.name,
                day: parseInt(day, 10),
                level1_ts: !T.isNil(completion_level[1])
                  ? parseInt(completion_level[1].get_star_ts, 10)
                  : 0,
                level2_ts: !T.isNil(completion_level[2])
                  ? parseInt(completion_level[2].get_star_ts, 10)
                  : 0
              }))
            )
            .value()
        ])
      )
      .chain(T.flat())
      .chain(T.flat())
      .chain(
        T.map(({ id, name, day, level1_ts, level2_ts }) => {
          const stat = [];
          if (0 !== level1_ts) {
            stat.push({ id, name, day, level: 1, ts: level1_ts });
          }
          if (0 !== level2_ts) {
            stat.push({ id, name, day, level: 2, ts: level2_ts });
          }
          return stat;
        })
      )
      .chain(T.flat())
      .chain(T.filter(({ day }) => !daysWithNoPoint.includes(day)))
      .chain(T.sortBy(({ ts }) => ts))
      .chain(
        T.map(d => {
          // console.log(
          //   format("yyyy-MM-dd'T'HH:mm:ss")(parse(new Date())('t')(d.ts))
          // );

          const date = T.chain(d.ts)
            .chain(parse(new Date())('t'))
            .value();
          // .chain(format("yyyy-MM-dd'T'HH:mm:ss"))
          return {
            ...d,
            date: format("yyyy-MM-dd'T'HH:mm:ss")(date),
            date_year: parseInt(format('yyyy')(date), 10),
            date_month: parseInt(format('MM')(date), 10),
            date_day: parseInt(format('dd')(date), 10),
            date_hour: parseInt(format('HH')(date), 10)
          };
        })
      )
      .chain(addPlayerInfo())
      .value();
}
function computeDateScore(year, numeroDay, nbPlayers, members, result) {
  return i => {
    const date = T.chain(`${year}-12-${numeroDay}T00:00:00.000-05`)
      .chain(parse(new Date())("yyyy-MM-dd'T'HH:mm:ss.SSSx"))
      // .chain(addDays(i))
      // .chain(addMinutes(i))
      .chain(addHours(i))
      .value();
    console.log(date);

    const sDate = format("yyyy-MM-dd'T'HH:mm:ss")(date);
    const time = T.chain(date)
      .chain(format('t'))
      .chain(t => parseInt(t, 10))
      .value();

    const res = T.chain(result)
      .chain(T.filter(({ ts }) => ts <= time))
      .chain(groupResult)
      .chain(markPoints(nbPlayers))
      .chain(groupPlayer)
      .chain(T.entries())
      .chain(
        T.map(([id, score]) => ({ id, ...members[id], score, date: sDate }))
      )
      .value();

    return res;
  };
}

function groupResult(results) {
  return T.chain(results)
    .chain(
      T.reduce((acc, { id, day, level, ts }) => {
        const key = `${day}-${level}`;
        if (T.isNil(acc[key])) {
          acc[key] = [{ id, ts }];
        } else {
          acc[key].push({ id, ts });
        }
        return acc;
      }, {})
    )
    .chain(T.values())
    .value();
}

function markPoints(nbPlayers) {
  return groups =>
    T.chain(groups)
      .chain(T.map(T.map((res, i) => ({ ...res, score: nbPlayers - i }))))
      .value();
}

function groupPlayer(groups) {
  return groups.reduce(
    (acc, group) =>
      group.reduce((acc2, { id, score }) => {
        if (T.isNil(acc2[id])) {
          acc2[id] = score;
        } else {
          acc2[id] += score;
        }
        return acc2;
      }, acc),
    {}
  );
}

function addPlayerInfo() {
  return raw =>
    T.chain(raw)
      .chain(
        T.map(d => {
          if (!players[d.name]) {
            console.log(`Configuration for ${d.name} is missing`);
          }
          return d;
        })
      )
      .chain(
        T.map(d => ({
          ...d,
          ...players[d.name]
        }))
      )
      .value();
}
