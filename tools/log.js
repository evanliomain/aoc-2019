module.exports = log;

function log(toPrint) {
  return data => {
    switch (typeof toPrint) {
      case 'undefined':
        console.log(data);
        break;
      case 'string':
        console.log(toPrint, data);
        break;
      case 'function':
        console.log(toPrint(data));
        break;
    }
    return data;
  };
}
