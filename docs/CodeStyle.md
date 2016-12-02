## Code style

In this repository—our newest front-end repository at Tidepool—our JavaScript style is *much* stricter than in our other repositories, largely because we started the work and continue to develop with a [very strict ESLint configuration, borrowed from AirBnb](https://www.npmjs.com/package/eslint-config-airbnb 'npm: eslint-config-airbnb').

It is not worth duplicating a description of the vast number of constraints that this configuration imposes. Our advice is to configure your editor to provide instant linting feedback as you code[^a], and you will learn the constraints quite quickly 😜

To summarize in general the constraints that the AirBnb ESLint configuration imposes:
- ES2015/ES6 given preference over ES5 (so `const` and `let` over `var`, etc.)
- lots of general code quality/bug prevention constraints like no unused variables, no mutating arguments to functions, etc.
- React components that don't need a (substantive) constructor, any of the lifecycle methods, or component-internal state should be [pure functional components](https://facebook.github.io/react/docs/components-and-props.html#functional-and-class-components 'React docs: Functional and Class Components') instead of classes
- all React components should type-check the props used via [PropTypes](https://facebook.github.io/react/docs/typechecking-with-proptypes.html 'React docs: Typechecking with PropTypes')

We have also added an additional plug-in for enforcing a preference for [lodash](https://lodash.com/docs/4.16.6 'Lodash utility library') utility methods over their native implementations (e.g., lodash `_.map` instead of JavaScript `Array.map`).

Also see the documentation on [directory structure](./DirectoryStructure.md) for our conventions around file naming, placement, and in particular our semantic division between "containers" and "components."

* * * * *

[^a]: And you don't even have to Google! Here's where to get started for [Sublime Text](http://www.sublimelinter.com/en/latest/ 'SublimeLinter 3') and [Atom](https://atom.io/packages/linter 'Linter').
