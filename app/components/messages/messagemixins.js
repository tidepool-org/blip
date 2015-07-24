var sundial = require('sundial');
var getIn = require('../../core/utils').getIn;

var MessageMixins = {
  isTimezoneAware: function() {
    if (getIn(this.props, ['timePrefs', 'timezoneAware'], false) &&
      getIn(this.props, ['timePrefs', 'timezoneAware'], false)) {
      return true;
    }
    return false;
  },
  getDisplayTimestamp: function(ts) {
    var displayTimestamp;
    if (this.isTimezoneAware()) {
      displayTimestamp = sundial.formatInTimezone(ts, this.props.timePrefs.timezoneName);
    }
    else {
      var offset = sundial.getOffsetFromTime(ts) || sundial.getOffset();
      displayTimestamp = sundial.formatFromOffset(ts, offset);
    }
    return displayTimestamp;
  }
};

module.exports = MessageMixins;