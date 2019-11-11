import sundial from 'sundial';
import utils from '../../core/utils';

var MessageMixins = {
  isTimezoneAware: function() {
    if (utils.getIn(this.props, ['timePrefs', 'timezoneAware'], false) &&
      utils.getIn(this.props, ['timePrefs', 'timezoneAware'], false)) {
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
