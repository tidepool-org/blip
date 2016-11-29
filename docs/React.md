## Blip's usage of React

We began development of this blip codebase with React in late 2013, which was pretty early days for the framework: we were "early adopters." Over time, there's been some changes to the React APIs, which we've had to keep up with in order to keep our React dependency up-to-date, but there's also been some shifting in terms of React best practices, and it is certainly the case that parts of blip reflect outdated practices that are *not* representative of how we want our React codebase to look going forward. So when you see something written in ES5[^a] and it looks "weird" or follows a different pattern, you can be pretty sure that it's outdated and does not represent our current opinions on React best practices. (When in doubt: discuss with your fellow developers!)

For more information on what our current opinions and goals are regarding React best practices, see the [Recommended reading](http://developer.tidepool.io/docs/front-end/react/recommended-reading.html) page from our general [React @ Tidepool](http://developer.tidepool.io/docs/front-end/react/index.html) documentation.

We use React with [Redux](http://redux.js.org/ 'Redux') for state management, so you'll want to read [Blip's usage of Redux]('./Redux.md') as well.

[^a]: ES5 vs. ES2015/ES6 is a reasonably accurate indicator of code age in blip, although we did port some components to ES2015/ES6 when we introduced React Router and redux without changing them much, so while you can be reasonably certain that a weird-looking component written in ES5 reflects an older/outdated way of doing things, not *all* ES2015/ES6 components necessarily represent our current opinions on best practices.
