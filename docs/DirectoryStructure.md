## App & directory structure

- **Bootstrap** ([`app/bootstrap.js`](https://github.com/tidepool-org/blip/blob/master/app/bootstrap.js 'GitHub: blip app/bootstrap.js')): Where our application is "bootstrapped" into the HTML served. We initialize the API and then render the React application here.
- **Redux** ([`app/redux/`](https://github.com/tidepool-org/blip/tree/master/app/redux 'GitHub: blip app/redux/')): Where our redux implementation lives. This code is responsible for state management of the application.
- **Root** ([`app/redux/containers/Root.js`](https://github.com/tidepool-org/blip/blob/master/app/redux/containers/Root.js 'GitHub: app/redux/containers/Root.js')): The Root component for our React application.
- **Routes** ([`app/routes.js`](https://github.com/tidepool-org/blip/blob/master/app/routes.js 'GitHub: blip app/routes.js')): Our route definitions for the application. See also: [blip's usage of React Router](./ReactRouter.md).
- **Core** ([`app/core/`](https://github.com/tidepool-org/blip/tree/master/app/core 'GitHub: blip app/core/')): Scripts and styles shared by all app components. This is where the API and various utilities live.
- **Components** ([`app/components/`](https://github.com/tidepool-org/blip/tree/master/app/components 'GitHub: blip app/components/')): Reusable React components smaller than the "page" level—in other words, the building blocks of the application.
- **Pages** ([`app/pages/`](https://github.com/tidepool-org/blip/tree/master/app/pages 'GitHub: blip app/pages/')): Higher-level React components that combine reusable components together. The routes defined in routes.js typically provide a "page" component as the route `component`, and each of these page components is connected to blip's redux store of application state.
- **Services** (`app/core/<service>.js`): Singletons used to interface with external services or to provide some common utility; they are attached to the global `app` object (for example, `app.api` which handles communicating with the platform).
- **Global styles** ([`app/core/less/`](https://github.com/tidepool-org/blip/tree/master/app/core/less 'GitHub: blip app/core/less/')): Where our global Less style files live.
- **Local styles**: Local styles are defined in `.less` files alongside React component files.

### Config object

The [`config.app.js`](https://github.com/tidepool-org/blip/blob/master/config.app.js 'GitHub: config.app.js') file has some magic constants that look like `__FOO__` statements replaced by the value of the corresponding environment variable when the build or development server is run. If you need to add new environment variables, you should also update `webpack.config.js` with definitions for them, as well as `.eslintrc`.
