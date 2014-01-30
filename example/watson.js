// 'Good old Watson! You are the one fixed point in a changing age.' - Sherlock Holmes, His Last Bow

var data = function(a) {
  messages = _.where(a, {'type': 'message'});
  watson = _.map(_.reject(a, function(i) {
    if (i.type === 'message') {
      return i;
    }}), function(i) {
      i.deviceTime = i.deviceTime + 'Z';
      return i;
  });

  return watson.concat(messages);
};

var normalize = function(a) {
  return _.map(a, function(i) {
    i.normalTime = i.deviceTime;
    if (!i.normalTime) {
      i.normalTime = i.utcTime;
    }
    // i['normalTime'] = i['deviceTime'];
    // if (!i['normalTime']) {
    //   i['normalTime'] = i['utcTime'];
    // }
    return i;
  });
};

var print = function(arg, d) {
  console.log(arg, d.toUTCString().replace(' GMT', ''));
};

module.exports.data = data;
module.exports.normalize = normalize;
module.exports.print = print;