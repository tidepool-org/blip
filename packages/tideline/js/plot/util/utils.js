const dt = require('../../data/util/datetime');

var utils = {

  xPos: function(d, opts){
    return opts.xScale(Date.parse(d.normalTime)) + 1;
  },

  // get duration in milliseconds
  getDuration: function(d) {
    const start = Date.parse(d.normalTime);
    const units = d.duration.units;
    let msfactor = 1000;
    switch (units) {
    case 'minutes':
      msfactor *= 60;
      break;
    case 'hours':
      msfactor *= 60 * 60;
      break;
    }
    const end = Date.parse(dt.addDuration(start, d.duration.value * msfactor));
    return { start, end , duration: end - start};
  },

  calculateWidth: function(d, opts) {
    const {start, end} = this.getDuration(d);
    return opts.xScale(end) - opts.xScale(start) - 1;
  },

  getTooltipContainer: function(d) {
    const parentContainer = document.getElementById('tidelineMain').getBoundingClientRect();
    const container = d.getBoundingClientRect();
    container.y = container.top - parentContainer.top;
    container.x = container.left - parentContainer.left;
    return container;
  },
};

module.exports = utils;
