module.exports = function() {

  return function d(endpoints) {
    var start = new Date(endpoints[0]);
    var end = new Date(endpoints[1]);

    start.setMinutes(start.getMinutes() - 30);
    
    var readings = [];

    while (start < end) {
      readings.push({
        value: Math.floor((Math.random() * 360) + 41),
        timestamp: start.setMinutes(start.getMinutes() + 30)
      });
    }

    return readings;
  }
};