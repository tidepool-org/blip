/*
 * == BSD2 LICENSE ==
 */

var RFC3548_DEFAULT_PADDING_CHAR = '=';

var base32Chars = [
  '0', '1', '2', '3', '4',
  '5', '6', '7', '8', '9',
  'a', 'b', 'c', 'd', 'e',
  'f', 'g', 'h', 'i', 'j',
  'k', 'l', 'm', 'n', 'o',
  'p', 'q', 'r', 's', 't',
  'u', 'v'
];

var maskFirstBits_1 = 0x1;
var maskFirstBits_2 = 0x3;
var maskFirstBits_3 = 0x7;
var maskFirstBits_4 = 0xf;
var maskFirstBits_5 = 0x1f;
var maskBits9And10 = 0x300;

/**
 * Encodes an input buffer into base32hex format as described in RFC 4648
 *
 * Takes an optional options argument.  Possible values for options are
 *
 * * `paddingChar` Override padding character, "=".  Setting this means that output does not follow the standard.
 *
 * @param buf
 * @param options
 * @returns {string}
 */
exports.encodeBuffer = function(buf, options) {
  if (options == null) {
    options = {};
  }
  var paddingChar = options.paddingChar == null ? RFC3548_DEFAULT_PADDING_CHAR : options.paddingChar;

  var retVal = '';
  var remainingBytes = buf.length % 5;
  var bufLimit = buf.length - remainingBytes;
  for (var i = 0; i < bufLimit; i += 5) {
    var first32 = buf.readUInt32BE(i);

    retVal += base32Chars[first32 >>> 27];
    retVal += base32Chars[(first32 >>> 22) & maskFirstBits_5];
    retVal += base32Chars[(first32 >>> 17) & maskFirstBits_5];
    retVal += base32Chars[(first32 >>> 12) & maskFirstBits_5];
    retVal += base32Chars[(first32 >>> 7) & maskFirstBits_5];
    retVal += base32Chars[(first32 >>> 2) & maskFirstBits_5];

    var next10 = ((first32 << 8) & maskBits9And10) + buf.readUInt8(i + 4);
    retVal += base32Chars[next10 >>> 5];
    retVal += base32Chars[next10 & maskFirstBits_5];
  }

  switch(remainingBytes) {
    case 1:
      var next8 = buf.readUInt8(bufLimit);
      retVal += base32Chars[next8 >>> 3];
      retVal += base32Chars[(next8 & maskFirstBits_3) << 2];
      retVal += paddingChar + paddingChar + paddingChar + paddingChar + paddingChar + paddingChar;
      break;
    case 2:
      var next16 = buf.readUInt16BE(bufLimit);
      retVal += base32Chars[next16 >>> 11];
      retVal += base32Chars[(next16 >>> 6) & maskFirstBits_5];
      retVal += base32Chars[(next16 >>> 1) & maskFirstBits_5];
      retVal += base32Chars[(next16 & maskFirstBits_1) << 4];
      retVal += paddingChar + paddingChar + paddingChar + paddingChar;
      break;
    case 3:
      var next24 = (buf.readUInt16BE(bufLimit) << 8) + buf.readUInt8(bufLimit + 2);
      retVal += base32Chars[next24 >> 19];
      retVal += base32Chars[(next24 >>> 14) & maskFirstBits_5];
      retVal += base32Chars[(next24 >>> 9) & maskFirstBits_5];
      retVal += base32Chars[(next24 >>> 4) & maskFirstBits_5];
      retVal += base32Chars[(next24 & maskFirstBits_4) << 1];
      retVal += paddingChar + paddingChar + paddingChar;
      break;
    case 4:
      var first32 = buf.readUInt32BE(i);

      retVal += base32Chars[first32 >>> 27];
      retVal += base32Chars[(first32 >>> 22) & maskFirstBits_5];
      retVal += base32Chars[(first32 >>> 17) & maskFirstBits_5];
      retVal += base32Chars[(first32 >>> 12) & maskFirstBits_5];
      retVal += base32Chars[(first32 >>> 7) & maskFirstBits_5];
      retVal += base32Chars[(first32 >>> 2) & maskFirstBits_5];
      retVal += base32Chars[(first32 & maskFirstBits_2) << 3];
      retVal += paddingChar;
  }

  return retVal;
};