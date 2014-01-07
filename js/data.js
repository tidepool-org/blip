module.exports = function() {

  return function d(endpoints) {
    var start = endpoints[0];
    var end = endpoints[1];

    var d = new Date(start);
    d.setMinutes(d.getMinutes() - 5);
    
    var readings = [];

    while (d < end) {
      readings.push({
        value: Math.floor((Math.random() * 360) + 41),
        timestamp: d.setMinutes(d.getMinutes() + 5)
      });
    }

    return readings;
  }
};