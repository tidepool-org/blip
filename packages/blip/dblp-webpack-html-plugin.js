/*
 * Modified from html-webpack-plugin example:
 * https://github.com/jantimon/html-webpack-plugin#afteremit-hook
 */
const HtmlWebpackPlugin = require('html-webpack-plugin');

class DblpHtmlWebpackPlugin {
  apply (compiler) {
    compiler.hooks.compilation.tap('DblpHtmlWebpackPlugin', (compilation) => {
      // Static Plugin interface |compilation |HOOK NAME | register listener
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
        'DblpHtmlWebpackPlugin', // <-- Set a meaningful name here for stacktraces
        (data, cb) => {
          // Manipulate the content
          if (typeof process.env.HELP_SCRIPT_URL === 'string') {
            if (process.env.HELP_SCRIPT_URL === 'disabled') {
              console.log('\nRemoving zendesk javascript link...');
              data.html = data.html.replace(/(<script id="ze-snippet".*<\/script>)/, '');
            } else {
              console.log('\nSetting up zendesk javascript link...');
              data.html = data.html.replace(/(<script id="ze-snippet" src="([^"]+)">)/, (match, p1, p2) => {
                return p1.replace(p2, process.env.HELP_SCRIPT_URL);
              });
            }
          }
          // Tell webpack to move on
          cb(null, data);
        }
      );
    });
  }
}

module.exports = DblpHtmlWebpackPlugin;
