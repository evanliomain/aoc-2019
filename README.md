Example for day 1:

Generate code for the day
`yarn gen 1`

Write the solution in days/01:

- `in.js` for parsing data
- `level1.js` for the first exercie
- `level1.test.js` to write unit test on level 1
- `level2.js` for the second exercice
- `level2.test.js` to write unit test on level 2
- `sample/{n}` a sample of dataset (n is just to index them)

Run code for the day 1 exercice 2
`yarn start 1 2`

Run code for the day 1 exercice 2 on sample 3
`yarn start 1 2 3`

Test all days
`yarn test`

Test only one day
`yarn test -t=01`

Test only day 3 exercice 2,
`yarn test -t=03-2`

Run test, if succeed run on puzzle input, if no error, ask to submit result, day 3 level 1 (Run'N Submit)
`yarn rns 3 1`

Submit the result `1234` on day 3 level 1
`yarn submit 3 1 1234`

---

Init project:

- Indicate the year in package.json in `aocYear` property
- Write your session cookie in session.json like: `echo '"my-session-cookie"' > session.json`
- You good to go

To generate chart on your leaderboard:

- Write the leaderboard in `leaderboard.json`: `echo '"my-private-leaderboard"' > leaderboard.json`
- Write the playeur informations (firstname, lastname, url to an avatar) in `playeurs.json`:
  `touch playeurs.json`
  playeurs.json

```json
{
  "name of the playeur as it appear in AoC": {
    "firstname": "playeur first name",
    "lastname": "playeur last name",
    "url": "http://url-to-an-avatar-of-the-playeur"
  }
}
```
