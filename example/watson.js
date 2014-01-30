// 'Good old Watson! You are the one fixed point in a changing age.' - Sherlock Holmes, His Last Bow

var data = function(a) {
  return _.map(a, function(i) {
    i.deviceTime = i.deviceTime + 'Z';
    return i;
  });
};

var print = function(arg, d) {
  console.log(arg, d.toUTCString().replace(' GMT', ''));
};

module.exports.data = data;
module.exports.print = print;