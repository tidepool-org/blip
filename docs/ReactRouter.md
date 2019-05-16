## Blip's usage of React Router

When development of blip in its current form as a React application began in late 2013 and the beginning of 2014, [React Router](https://github.com/ReactTraining/react-router 'GitHub: React Router') did not yet exist, at least not as a well-supported and widely-used client-side routing solution for React applications.

### 👻 History

Originally blip used [director](https://github.com/flatiron/director 'GitHub: director'), a framework-agnostic (as well as isomorphic) JavaScript library for routing. This didn't "play" terribly well with React, and the routing code was complex, difficult to understand, difficult to debug, etc. By far the most difficult thing was understanding where the source of truth was regarding application state/location: in the route (URL) or in the app's top-level component (React) state. (We had a doozy of an `<App/>` component back then at the top level that was 1000s of lines long (😱), and app state was basically all contained in the state of this component, except for the stuff that director managed, if it was truly the source of truth for that state.)

### ✨ Today ✨

We ripped apart the old `<App/>` component and refactored to bring in React Router as our routing solution in late 2015. Routes are defined in [app/routes.js](https://github.com/tidepool-org/blip/blob/master/app/routes.js 'blip: app/routes.js'). We make extensive use of [the `onEnter` hook](https://github.com/ReactTraining/react-router/blob/master/docs/API.md#onenternextstate-replace-callback 'React Router docs: Router onEnter') for React Router `<Route/>` elements, including the asynchronous option when a callback function is provided as the third argument; this blocks the route transition until the callback is called.

We also sometimes pass our [redux](./Redux.md) store to an `onEnter` hook function in order to access the application state via `store.getState()` in order to determine whether to continue the current route transition or redirect (depending on whether the logged-in user has verified their sign-up e-mail address or not, [for example](https://github.com/tidepool-org/blip/blob/master/app/routes.js#L154 'blip: routes.js requireNotVerified onEnter hook')).

State changes that require URL changes are rare in blip currently (largely because we simply *don't* sync very much application state with the URL). The vast majority of the changes happen in the `onEnter` hooks defined in `routes.js`, but there are a few other places where we redirect in response to user interaction with `browserHistory.push` (`git grep`-ing for this phrase should find all instances for you) or where we redirect inside a "thunk" action creator; the latter instances can be found with a search for `routeActions.push`.

### 🚀 The Future

#### More visualization state in the URL ("deep linking")

One of our goals for the incremental rewrite of Tidepool's data visualization code (from [tideline](https://github.com/tidepool-org/tideline 'GitHub: tideline') to [viz](https://github.com/tidepool-org/viz 'GitHub: viz')) is to enable "deep linking" in the data visualization(s) so that a user can bookmark or copy and share a URL and anyone who has that URL (and permissions to view the relevant PwD's data) will see essentially the same data visualization that the original user saw.

The vast majority of the data visualization state, including which of the five "views" the user is on (Basics, Daily, BG Log, Trends, or Device Settings) is currently [encapsulated inside the `<PatientData/>` component](https://github.com/tidepool-org/blip/blob/master/app/pages/patientdata/patientdata.js#L70 'GitHub: blip app/pages/patientdata/patientdata.js') as its React-internal `state`.

As we're rewriting visualization code, we're adding *new* state—i.e., that didn't exist before, such as state belonging to the new CGM version of the Trends view and the state of which basal schedules or settings profiles are open or collapsed on the Device Settings view—to blip's redux-controlled state by way of a `vizReducer` as one of the exports from the new viz repo. By [including this reducer](https://github.com/tidepool-org/blip/blob/master/app/redux/store/configureStore.prod.js#L33 'GitHub: blip app/redux/store/configureStore.prod.js') in our composed root reducer for blip, we ensure that blip's state updates in response to any of the action creators fired in viz components (or in blip, where we import action creator functions themselves or component from viz to be rendered in blip).

As we move more and more visualization code into viz and especially as we move functionality controlling some aspects of the visualization state (such as which view is active) from blip into viz, we'll have to plan for the eventual goal of deep-linking or, in other words, think *carefully* about where the source of truth for certain state should live.

Take the active view, for example, which in the current `<PatientData/>` state, we track as `chartType`. This state will *definitely* need to be part of the URL as the first step along the road to "deep linking": we want URLs of the form `/patients/:id/data/basics` and `/patients/:id/data/daily` instead of the current `/patients/:id/data` for all views. In order to avoid duplication of state[^a] between the `routing` branch of blip's state (updated via the `routeReducer` which is an export from the [react-router-redux](https://github.com/reactjs/react-router-redux 'GitHub: react-router-redux') package in a fashion directly parallel[^b] to our export of `vizReducer` from the @tidepool/viz package) and the `viz` branch of state controlled by the `vizReducer`, we'll need to use a different strategy—that is, not the current `vizReducer` strategy—to update the `chartType` state so that this state is properly "owned" by the `routeReducer`.

There may be several ways of solving the problem of affecting `routing` state from viz, which has no direct access to blip's router (and nor should it). A couple to consider are:

- viz dispatches actions representing state changes that are reflected in the URL (such as the active view) as per usual in a Redux implementation, but no state changes are defined for these action types in the exported `vizReducer`; instead, blip intercepts all such actions (according to their `type`) with a middleware and dispatches a `routeActions.push` action to update the `routing` state
- viz includes React Router as a dependency and the top-level component exported to blip requires a set of `href`s as props to populate its React Router `<Link/>`s

#### Upgrading to the 4.x version of React Router

The 4.x version of React Router is, as of mid-November 2016, currently in alpha and includes [many breaking changes](https://github.com/ReactTraining/react-router/tree/v4#v4-faq 'GitHub: React Router v4.x FAQ'). The API changes have already caused some controversy in the community, so we'll have to watch the development and assess whether or not it makes sense to upgrade our dependency in blip. Since React Router is a true community project (i.e., not released by Facebook), it seems unlikely that the 3.x version will enjoy long-term support.

[^a]: As a known issue/remaining tech debt from the introduction of React Router and Redux into the blip codebase, we currently have *some* duplication of information across the `routing` and `blip` branches of blip's state tree. A good example is the user ID hash of the PwD whose data is in view on the `/patients/:id/data` path currently used for all data views; this ID is part of the `routing` state as the `:id` param in the path, but it is *also* set as the [`currentPatientInViewId`](https://github.com/tidepool-org/blip/blob/master/app/redux/reducers/misc.js#L194 'GitHub: blip app/redux/reducers/misc.js') in the `blip` branch of the state tree upon successful fetching of the PwD's profile.

[^b]: And, in fact, one of the inspirations for the way we structured the @tidepool/viz package along with the [redux-form](http://redux-form.com/6.2.0/ 'Redux Form') package.
