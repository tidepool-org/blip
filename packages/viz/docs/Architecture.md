## Architecture

#### Background documents (Tidepool-internal)

- A fairly comprehensive set of notes explaining [the tech debt in tideline](https://docs.google.com/document/d/134kiT-aVvp63WpjBOafd63LyhecEs37T0u6-ChsyUSA/edit)
- Document used to structure discussion around [goals for the tideline rewrite](https://docs.google.com/document/d/1zACQThnrFmlcvxMIF2g_CnnkQ9A16ilw-JSI6oKgvoA/edit#heading=h.4t4q8lakp971)

### Desiderata for Tidepool visualization code

At a meeting in January 2016, we decided on the following goals for the new visualization code (replacing [tideline](https://github.com/tidepool-org/tideline)). The goal(s) is/are that new visualization code should (eventually):

1. be **_responsive_** if rendered inside a responsive container (i.e., precisely what blip does *not* provide at the moment since it creates a `<div>` with fixed width for the visualization code to be rendered in)
1. sync visualization state with the URL ("deep linking") so that a copied and shared URL can facilitate conversation among the members of a care team
1. "page" data in from the server and update itself when new data is received rather than only operate via a single "all you can eat" fetch of a user's entire dataset
1. be modular in order to enable:
    - more efficient development by the core team
    - easier and more efficient contributions from the open-source community
    - "cleaner" and more testable code
    - code re-use by commericial and non-commericial third parties

Ambiguous:

   - tablet support

There were also a few desiderata that were discussed but explicitly *rejected*, so the new visualization code should/need **not**:

1. cache data on the client side
1. support non-Chrome browsers


### Proposal for the architecture of Tidepool visualization code

In this document, we attempt to explain the architectural choices made for Tidepool's data visualization code (in this repository) by listing the major problems the code needs to solve along with the solution proposed (or chosen) for each.

#### State management

**Problem:** Effectively manage all the state shared across visualizations (listed below) with a minimum of duplicated code so that feature iteration can proceed as efficiently as possible.

General principle, learned from experience: It is better to think about the Tidepool data visualizations as *one* (meta) interface between a user and a set of diabetes device (+ contextual) data with many different surface manifestations (daily, bgLog, trends, basics, device settings) than to think of it as half a dozen *different* data visualizations (daily, bgLog, etc.)

Another way to phrase this: there is more application state requiring code to manage that is *shared* between all of the separate data views in blip (daily, bgLog, etc.) than there is that is separate. The shared state includes:

- user display preference for blood glucose units (mg/dL or mmol/L)
- user display preference for target blood glucose range
- user display preference for timezone
- the actual diabetes device data, preprocessed as necessary to facilitate data visualization
- the date(s) that the user is focusing on, including filters for days of the week (Monday, Tuesday, etc.) being focused on, where appropriate
    + Note that even though each data view presently has a different type of date domain (e.g., twenty-four hours, two weeks, most recent three calendar weeks, etc.), we already currently (attempt to) share state across these domains, making this state largely shared. For example, when a user navigates backwards in time on the trends view in two week chunks by having the (default) "14 day" domain selected and clicking the back arrow, if the user then switches to the daily view, they will presented with the most recent twenty-four hours of data within the current 14-day period of time for the trends view.
- most (if not all) toggles and open/collapsed sections on all views (basics, trends, etc.), so that the user is not jarred/annoyed/confused by having to constantly reselect such choices when navigating between the views

**Solution:** Use [redux](http://redux.js.org/ 'Redux') to store shared state in a single source of truth and transform this state with pure functions ("reducers") via dispatched actions (one-way data flow).

Note that in the process of slowly and iteratively porting code from [blip](https://github.com/tidepool-org/blip) & [tideline](https://github.com/tidepool-org/tidline) into this repository, we will have stages where we are storing *more* than we would like in the redux state.

For example, at present (November 2016), we are controlling hover state on slices in the CGM trends view via redux. Hover state is by definition ephemeral and not generally the kind of thing that belongs in the single, app-wide source of truth that is the redux store. However, because the components rendering the various parts of the CGM trends view are currently divided between blip and this repository, we are using the redux store as a "bridge" to share state across them more easily (and reduce the number of multi-repository code changes we need to make). As we move more visualization-related code from blip into viz, we should take care to reassess what is in the redux-controlled state and refactor anything that should not be controlled through redux (like hover state for CGM in trends slices) to be controlled through the appropriate container component state.

#### Data preprocessing

Some background documents particular to this problem area (Tidepool-internal):

- [early draft explanation and proposal](https://docs.google.com/document/d/190mj_S9vYKvINPbU7cMajGekebyX6AJ-W6v3P-cCRWI/edit# 'viz data preprocessing') for Web Worker-based preprocessing
- [more detailed proposal](https://docs.google.com/document/d/14n4OyyTKKfBxz7DzX9DnKST3nVarfae7Fgl9HgG6BlY/edit 'blip & viz data flow') after some prototyping with Web Workers

**Problem:** Minimize the amount of *user* time spent on "expensive" data processing tasks, such as:

- client-side data validation
    + to filter out data that is perfectly legitimate according to the Tidepool data model (`basal` with zero duration) but is nevertheless not a target for visualization
    + to filter out legacy or third-party data that is invalid according to the Tidepool data model (to prevent JavaScript runtime crashes that would negatively affect the end-user experience)
- once-only data preprocessing (may move server-side)
    + to parse ISO 8601 string Zulu timestamps into hammertimes
- timezone-sensitive data preprocessing (must be rerun if user changes display timezone preference)
    + to compute fields like the date and day of week in the local timezone
    + to computer the number of milliseconds after timezone-determined midnight that the event occurred (necessary for binning data by time of day for trends view)

**Solution:** Perform data preprocessing in a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers). Experience has taught us that—especially where timestamp parsing and timezone-relative calculations are involved—it is very easy to accidentally cause a user-noticeable performance bottleneck in a JavaScript single-page application (SPA). Using a Web Worker in a separate thread that does not interrupt the responsiveness/interactivity of the SPA allows us "breathing room" to perform potentially expensive calculations. It is also more compatible with an application that updates itself when new user data comes in from the server (i.e., via data paging, real-time push updates, etc.) because the newly arrived data can be processed in the background as it comes in without affecting the end-user's experience.

#### Data filtering

**Problem:** Centralize the logic for translating one date domain type (e.g., twenty-four hours, two weeks, most recent three calendar weeks, etc.) and location (i.e., timestamp(s) defining the edges and/or center) in one place and prevent performance bottlenecks due to executing complex filters (date range & day of week selections) on large datasets.

(Note: the performance bottleneck due to data filtering currently exists (resulting in a poor framerate of < 20 fps) in tideline code on the daily view since the data filtering must be redone many times a second as the user scrolls.)

**Solution:** Define a set of redux actions for setting the date domain, location, and other filters in state and apply the filters with [crossfilter](http://square.github.io/crossfilter/ 'Crossfilter') in the Web Worker (see above) to keep the filtering from affecting the end-user experience as far as possible.

#### Data munging

**Problem:** Centralize the logic for common statistical computations that appear in more than one view such as the basal:bolus ratio, average blood glucose, and time in range. Ensure that gaps in data are handled the same across all visualizations. Ensure that a robust test suite sits behind all statistical computations.

**Solution:** Factor out all statistical computations into utility modules that can easily be imported into a variety of components. Keep these utilities as purely functional and general as possible to allow for ease of test instrumentation as well as options for moving the code if performance on some of these computations becomes a user-facing issue/roadblock. For example, computations could be moved into [reselect](https://github.com/reactjs/reselect), a redux add-on library for computing derived state (with memoization) or into the Web Worker used for data preprocessing and filtering.

#### "Deep linking"

**Problem:** Sync URL with the data visualization state in all the ways that would be useful to an end-user who wishes to share a data view they are currently viewing with another member of their care team.

**Solution:** Once data visualization state is being managed more-or-less completely via redux, enabling "deep linking" should be a relatively simple matter of syncing the URL with the redux state, translating various relevant pieces of state into (sub-)paths in the URL and/or query parameters.

#### Modularity

**Problem:** Empower internal and external developers to develop and iterate quickly on all aspects of data visualizations. This should encompass both the ability to iterate easily on details of low-level rendering (i.e., what shape to draw for an extended bolus) without having to touch other code *and* the ability to build entirely new data "views" parallel to the daily, bgLog, basics, trends, and device settings views currently available by composing existing rendering components for the pieces.

**Solution:** "Componentize" visualization code, adhering to React (and redux) best practices, including:

- only extending the React Component class where the lifecycle methods are necessary, in "container" components
- keeping rendering logic out of such container components
- keeping styling out of container components
- keeping animation logic (i.e., with [react-motion](https://github.com/chenglou/react-motion 'react-motion')) as a distinct layer that sits between container components and low-level rendering components
- keep complex interface rendering method (e.g., the scrolling interface for the daily view) separate from the low-level rendering of smbgs, cbgs, boluses, basal itnervals, etc. so that:
    + code for the low-level rendering is reusable across views
    + the interface rendering method can be iterated on separately or swapped out entirely
- do actual (i.e., visual) rendering in pure functional components with styling defined in accompanying CSS files (i.e., use CSS modules)
- refactor CSS continually to keep duplication of styles to a minimum
