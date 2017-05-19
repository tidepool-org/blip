## Architecture

### ✨ Today ✨

Fetching data from the server and rendering the UI to display that data is a classic pattern. The approach we try to follow (see [The Need for Speed](https://cloudup.com/blog/the-need-for-speed)) is to "render as soon as possible" and "save optimistically."

In short, say a component `<Items />` needs to display a `data` object passed through the props by the parent, we will also give the component a `fetchingData` prop, so it can render accordingly. There are 4 possible situations (the component may choose to render more than one situation in the same way):

- `data` is **falsy** and `fetchingData` is **truthy**: first data load, or reset, we can render for example an empty "skeleton" while we wait for data
- `data` and `fetchingData` are both **falsy**: data load returned an empty set, we can display a "no data available" message for example
- `data` is **truthy** and `fetchingData` is **falsy**: display the data "normally"
- `data` and `fetchingData` are both **truthy**: a data refresh, either don't do anything and wait for data to come back, or display some kind of loading indicator

For forms, we try as much as possible to "save optimistically," meaning when the user "saves" the form, we immediately update the app state (and thus the UI), and then send the new data to the server to be saved. If the server returns an error, we should be able to rollback the app state and display some kind of error message.

#### Details on blip's data fetching strategy

As of our refactoring in 2015–2016 to use [React Router](./ReactRouter.md) and [Redux](./Redux.md) in blip, we have established a single pattern for data fetching for all page-level "smart" components (found in app/pages/) that are both defined as the `component` for a route (see [app/routes.js](https://github.com/tidepool-org/blip/blob/master/app/routes.js#L279 'GitHub: blip app/routes.js')) and connected to the redux store.

Each of these pages defines a `mapDispatchToProps` function for use as the second argument to [`react-redux`'s `connect` utility](https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options 'GitHub: react-redux connect'). The `mapDispatchToProps` function uses the [`bindActionCreators` utility from `redux`](http://redux.js.org/docs/api/bindActionCreators.html 'redux docs: bindActionCreators') to wrap every action creator needed on the page in a [redux `dispatch`](http://redux.js.org/docs/api/Store.html#dispatch 'redux docs: dispatch') call so that it can be used directly in the page. However, with our setup in blip, this dispatch-wrapped action creator is still not quite ready for direct use, so each page also defines a `getFetchers` function which also [binds our `api` singleton](https://github.com/tidepool-org/blip/blob/master/app/pages/patients/patients.js#L346 'GitHub: blip app/pages/patients/patients.js getFetchers example'):

```js
let getFetchers = (dispatchProps, ownProps, api) => {
  return [
    dispatchProps.fetchPendingReceivedInvites.bind(null, api),
    dispatchProps.fetchPatients.bind(null, api)
  ];
};
```

and [sometimes other function arguments](https://github.com/tidepool-org/blip/blob/master/app/pages/patientdata/patientdata.js#L613 'GitHub: blip app/pages/patientdata/patientdata.js getFetchers example'):

```js
let getFetchers = (dispatchProps, ownProps, api, options) => {
  return [
    dispatchProps.fetchPatient.bind(null, api, ownProps.routeParams.id),
    dispatchProps.fetchPatientData.bind(null, api, options, ownProps.routeParams.id)
  ];
};
```

The `getFetchers` function is called from the `mergeProps` function provided as the third argument to the `react-redux` `connect` utility; `getFetchers` always return an array of functions and is always assigned to a prop in the inner page component (as opposed to the outer component wrapped with `connect`) called `fetchers`. Each inner page component defines an instance method called `doFetching` which simply loops through the `fetchers` included (if any) in the props provided as `doFetching`'s sole function argument and calls each function in turn:

```js
  doFetching: function(props) {
    if (!props.fetchers) {
      return
    }

    props.fetchers.forEach(fetcher => {
      fetcher();
    });
  },
```

Every page also integrates the fetching into [the React component lifecycle](https://facebook.github.io/react/docs/react-component.html#the-component-lifecycle 'React docs: the component lifecycle') in a consistent manner by calling the `doFetching` instance method from the `componentDidMount` lifecycle method:

```js
  componentDidMount: function() {
    this.doFetching(this.props);
  },
```

### 🚀 The Future

Aside from continuing to improve on the blip app experience by iterating on current features and adding new features, we at Tidepool have planned changes or are aware that scaling or opening the platform to third-party development may push us to make changes in a few areas that have implications for blip's architecture. Currently (as of mid-November, 2016) we have no concrete plans or solutions for the issues discussed below; they are all open questions.

#### Data caching

The data fetching pattern outlined above is not the most efficient pattern, since data that is already available in state may be re-fetched on mount of a different component (that shares some of the same data needs as the previously mounted component). On the one hand, the current strategy ensures that data never gets stale in the app (as long as the user is still doing things). On the other hand, some kind of caching strategy, which could be client- or server-side, could reduce load on Tidepool's servers. Whether or how we implement caching to improve data fetching efficiency in blip is as of yet an open question.

#### Switch to OAuth for authentication

Tidepool plans to use [OAuth 2](https://oauth.net/2/ 'OAuth 2.0') as our eventual authentication standard both internally and to support third-party clients. This will likely have an impact on blip's architecture as the platform account-related features in blip (e.g., sign-up, account settings, etc.) will need to be provided via a traditional server-rendered web application to ensure the application's security.

#### Combining functionality with the uploader in an Electron app

Google has announced [the end of Chrome apps](https://blog.chromium.org/2016/08/from-chrome-apps-to-web.html 'Chromium blog: From Chrome Apps to the Web'), and so we are already planning to replace our [Chrome uploader application](https://github.com/tidepool-org/chrome-uploader 'GitHub: chrome-uploader') with an [Electron](http://electron.atom.io/ 'Electron') application. This provides an opportunity to simplify the Tidepool user experience (especially for PwD and caregiver home users, as opposed to clinical users) by *combining* the uploading and data visualization functionalities into a *single* Electron application, or, in other words, combining blip's functionality with the uploader's.

Although blip and the uploader share some architectural features in common such as very similar redux implementations for state management, there are also a number of areas where combining the two applications may pose an architectural challenge, such as:

- client-side routing, since the uploader does not (currently) use a router
- styles, since the uploader uses [CSS modules](http://developer.tidepool.io/chrome-uploader/docs/misc/CSSModules.html 'Tidepool developer docs: CSS modules in the chrome-uploader') and blip's uses class-prefixing to define local styles
- different approaches to wrapping [platform-client](https://github.com/tidepool-org/platform-client 'GitHub: platform-client') in an `api.js` utility
