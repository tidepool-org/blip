function Incrementer(increment, cycles) {
    var i = 0;

    return function() {
      if (i < cycles) {
        ++i;
      }
      else {
        i = 1;
      }
      return i * increment;
    };
  }

module.exports = Incrementer;