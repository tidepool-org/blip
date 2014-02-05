// 'Good old Watson! You are the one fixed point in a changing age.' - Sherlock Holmes, "His Last Bow"

module.exports = function() {

  function watson() {
    console.log("Start her up, Watson, for it's time that we were on our way.");
  }

  watson.normalize = function(a) {
    return _.map(a, function(i) {
      i.normalTime = i.deviceTime + 'Z';
      if (i.utcTime) {
        var d = new Date(i.utcTime);
        var offsetMinutes = d.getTimezoneOffset();
        d.setMinutes(d.getMinutes() - offsetMinutes);
        i.normalTime = d.toISOString();
      }
      else if (i.type === 'basal-rate-segment') {
        i.normalTime = i.start;
      }
      return i;
    });
  };

  watson.print = function(arg, d) {
    console.log(arg, d.toUTCString().replace(' GMT', ''));
    return;
  };

  watson.strip = function(d) {
    return d.toUTCString().replace(' GMT', '');
  };

  return watson;
};