/* eslint-disable no-bitwise */
// http://bencoding.com/2013/03/05/generating-guids-in-javascript/

function guid() {
  var g = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  return g;
}
export default guid;
