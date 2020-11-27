

/**
 * https://medium.com/front-end-weekly/fetching-images-with-the-fetch-api-fb8761ed27b2
 * @param {ArrayBuffer} buffer image fetch buffer
 */
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = [].slice.call(new Uint8Array(buffer));

  bytes.forEach((b) => binary += String.fromCharCode(b));

  return window.btoa(binary);
}

export {
  arrayBufferToBase64
};
