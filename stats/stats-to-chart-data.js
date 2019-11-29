const T = require('taninsam');
const format = require('date-fns/fp/format');
const parse = require('date-fns/fp/parse');
const addDays = require('date-fns/fp/addDays');
const makeArray = require('../tools/make-array');
const players = require('../playeurs.json');

module.exports = statsToChartData;

function statsToChartData(year, nbDays, daysWithNoPoint) {
  return stats =>
    T.chain(nbDays)
      .chain(makeArray(x => x))
      .chain(
        T.map(
          computeDateScore(
            year,
            getNbMembers(stats),
            getMembers(stats),
            rawToResult(daysWithNoPoint)(stats)
          )
        )
      )
      .chain(T.flat())
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
        T.map(({ id, day, level1_ts, level2_ts }) => {
          const stat = [];
          if (0 !== level1_ts) {
            stat.push({ id, day, level: 1, ts: level1_ts });
          }
          if (0 !== level2_ts) {
            stat.push({ id, day, level: 2, ts: level2_ts });
          }
          return stat;
        })
      )
      .chain(T.flat())
      .chain(T.filter(({ day }) => !daysWithNoPoint.includes(day)))
      .chain(T.sortBy(({ ts }) => ts))
      .value();
}
function computeDateScore(year, nbPlayers, members, result) {
  return i => {
    const date = T.chain(`${year}-12-01T00:00:00.000`)
      .chain(parse(new Date())("yyyy-MM-dd'T'HH:mm:ss.SSS"))
      .chain(addDays(i))
      .value();
    const sDate = format('yyyy-MM-dd')(date);
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

// https://api.github.com/users/gregorybarale
