## tidepool-viz's usage of React Motion

The history of React and animation is not an untroubled one. Tools for even simple CSS3-based animations on mounting and unmounting components—a very common use case—didn't even exist (in the form of the `React(CSS)TransitionGroup` addons) until version [0.5.0](https://github.com/facebook/react/blob/master/CHANGELOG.md#react-with-addons-new 'React CHANGELOG') (released in October of 2013). And even the `ReactCSSTransitionGroup` and `ReactTransitionGroup` solutions are not *great*, as their requirements for successful usage are rather unintuitive.

A  number of additional libraries have tried to solve various pieces of the React & animation problem, and [React motion](https://github.com/chenglou/react-motion 'GitHub: react-motion') is perhaps the most popular. Because its `TransitionMotion` API suits *most* of our use cases and because it's a popular project with a reasonably large community behind it, we have chosen it as our default replacement for D3's `transition` API for animating transitions in our data visualizations.

As a library, React motion exports four commonly-used things:
- the `spring` function, which can be customized with a set of parameters (namely: `stiffness`, `damping`, and `precision`); it provides the interpolation between the starting and ending states that you're animating
- the `Motion` component for animating on mount and/or between two states
- the `TransitionMotion` component for animating exiting and (re)entering components (as well as mounting and transitioning, just like `Motion`)
- the `StaggeredMotion` component for, you guessed it, staggered animations

At Tidepool so far we are only using `spring` and `TransitionMotion`, and it isn't very likely that that will change. `Motion` is not useful to us since it doesn't allow for animation on component unmount[^a], and we generally want animations at every possible (for the particular component) moment in the lifecycle: on initial mount, on transition, on exit/unmount, and on re-entry. And the use cases that `StaggeredMotion` works for are a fairly restricted subset of stagger animations[^b] that we don't have in our visualizations.

For example code and a detailed tutorial on using `TransitionMotion` for transitions in a data visualization rendered in inline SVG via React, see the following:

Simplest examples (1): "`TransitionMotion` for grow-in, shrink-out single SVG `<rect>`"

<p data-height="265" data-theme-id="0" data-slug-hash="xgxYbm" data-default-tab="js" data-user="jebeck" data-embed-version="2" data-pen-title="TransitionMotion for grow-in, shrink-out single SVG <rect>" class="codepen">See the Pen <a href="http://codepen.io/jebeck/pen/xgxYbm/">TransitionMotion for grow-in, shrink-out single SVG <rect></a> by Jana Beck (<a href="http://codepen.io/jebeck">@jebeck</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

Simplest examples (2): "`TransitionMotion` for grow-in, shrink-out single SVG `<circle>`"

<p data-height="265" data-theme-id="0" data-slug-hash="apdpxg" data-default-tab="js" data-user="jebeck" data-embed-version="2" data-pen-title="TransitionMotion for grow-in, shrink-out single SVG <circle>" class="codepen">See the Pen <a href="http://codepen.io/jebeck/pen/apdpxg/">TransitionMotion for grow-in, shrink-out single SVG <circle></a> by Jana Beck (<a href="http://codepen.io/jebeck">@jebeck</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

More complex example: "`TransitionMotion` for grow-in, shrink-out of stacked `<rect>s`"

<p data-height="265" data-theme-id="0" data-slug-hash="QdwBBz" data-default-tab="js" data-user="jebeck" data-embed-version="2" data-pen-title="TransitionMotion for grow-in, shrink-out of stacked <rect>s" class="codepen">See the Pen <a href="http://codepen.io/jebeck/pen/QdwBBz/">TransitionMotion for grow-in, shrink-out of stacked <rect>s</a> by Jana Beck (<a href="http://codepen.io/jebeck">@jebeck</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

<!-- TODO: add links/embeds

Most complex example TBA: "Dataviz in React with React Motion for transition animations"

TODO: embed

@jebeck's [detailed tutorial](http://todo.com 'TODO: link') walks through all these examples progressively.

-->

-----

[^a]: At present, though in [this issue](https://github.com/chenglou/react-motion/issues/311 'GitHub: react-motion issue #311') the library's author Cheng Lou advocates for someone to extend the `Motion` component's functionality to include single element enter and leave animations.

[^b]: `StaggeredMotion` works only in cases where the staggered values depend on each other. It does not fit use cases such as staggering the mounting animation of a day's worth of CGM values, where each value (both x- and y- coordinates since there may be small (or large) time gaps in the data) is *not* strictly dependent on the previous (or next) value.
