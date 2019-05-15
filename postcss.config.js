const calc = require('postcss-calc');
const cssVariables = require('postcss-custom-properties');

module.exports = {
  plugins: [calc, cssVariables],
};
