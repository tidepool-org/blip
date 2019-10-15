import i18next from 'i18next';

const t = i18next.t.bind(i18next);

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
    var format = t('MMMM D [at] h:mm a');
    if (this.isTimezoneAware()) {
      displayTimestamp = sundial.formatInTimezone(ts, this.props.timePrefs.timezoneName, format);
    }
    else {
      var offset = sundial.getOffsetFromTime(ts) || sundial.getOffset();
      displayTimestamp = sundial.formatFromOffset(ts, offset, format);
    }
    return displayTimestamp;
  }
};

module.exports = MessageMixins;