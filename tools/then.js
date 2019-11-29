module.exports = then;

function then(f) {
  return promise => promise.then(f);
}
