## Dependencies

At Tidepool we use [webpack](https://webpack.github.io/ 'webpack module bundler') to bundle our JavaScript, CSS, and image assets into a small number of static files. Presently we use a small [express](http://expressjs.com/ 'Express Web Framework') server to serve the resulting bundled application. The code for this server is found in [server.js](https://github.com/tidepool-org/blip/blob/master/server.js 'blip: server.js') unless you get a 404 trying to follow that link, in which case we (probably) migrated to the strategy of serving our static index.html, etc. via a CDN[^a].

Many of the other major pieces we use in our front-end "stack" are, like webpack, commonly used by many others building apps today with React. These are:

- [React](https://facebook.github.io/react/ 'React') ([read more](./React.md))
- [React Router 3.x](https://github.com/ReactTraining/react-router) ([read more](./ReactRouter.md))
- [Redux](http://redux.js.org/ 'redux docs') ([read more](./Redux.md))
- [webpack](https://webpack.github.io/ 'webpack module bundler') ([read more](./Webpack.md))

Follow the "read more" link where available in this list of tools to learn more about the specifics of our usage of the tool at Tidepool.

[^a]: If this is the case, you should prepare and submit a pull request to edit this document!
