## tidepool-viz's usage of GSAP

[GSAP (GreenSock Animation Platform)](https://greensock.com/ 'GreenSock.com: GSAP') is a powerful library for animating HTML5 documents with JavaScript (largely as an alternative to CSS3). GSAP as a product started with [a similar animation library](https://greensock.com/gsap-as 'GSAP ActionScript') for [Flash](https://en.wikipedia.org/wiki/Adobe_Flash 'Wikipedia: Adobe Flash')[^a]. The now more widely used JavaScript library has an extensive and yet still fairly intuitive API that allows for finely-grained control of animations, including an API for sequencing within complex animations that is far over and above what can be accomplished with CSS3's `@keyframes`. The library is available in several separate modules (TweenLite, TweenMax, TimelineLite, TimelineMax) to keep file sizes small (choose what you need), and even the combination of TweenMax + TimelineMax is less than 200KB minified (that's about the size of React + ReactDOM but much less than Angular 2[^b]).

### 📚 resources

- [GSAP docs](https://greensock.com/docs/#/HTML5/ 'GSAP Docs')
- [Advanced SVG Animation](https://frontendmasters.com/courses/svg-animation/ 'Frontend Masters: Advanced SVG Animation'), a Frontend Masters course by Sarah Drasner

### 🕰️ when we use GSAP

Our first choice for animating with React is [React Motion](./ReactMotion.md), but we fall back to GSAP where React Motion's API doesn't provide what we need. So far the only circumstance that we've needed to pull GSAP in for is a staggered animation on revealing the daily CGM sensor traces via hover over a CGM time-slice segment in the CGM Trends view. This is due to the fact that React Motion's `StaggeredMotion` component only serves a subset of stagger animations—namely, those in which each value in the stagger is **entirely** dependent on the previous and next values. In the case of a CGM sensor trace for a day, while each value is *somewhat* dependent on its previous value, CGM values fail the *entirely dependent* criterion: while blood glucose can't jump from 68 mg/dL to 345 mg/dL in the space of a single five-minute span of time, all blood glucose values *do* fall within a certain "delta" of the previous value, though this delta varies (i.e., the previous and next values are **not** entirely dependent on each other).

### 🍝 integrating GSAP with React

The strategy for using GSAP with React is very similar to the `componentDidMount` strategy for integrating [React and D3](./D3.md#the-componentdidmount-strategy) but perhaps a little less offensive to the React purist. Instead of *rendering* to the DOM in the `componentDidMount` lifecycle method (**after** React's render cycle), to integrate GSAP with React we first render the component inside a `ReactTransitionGroup` container. Then in the `componentWillEnter` method (which is provided by `ReactTransitionGroups` and fires at the same point in the React lifecycle as `componentDidMount`) we simply gather the [references to DOM nodes](https://facebook.github.io/react/docs/refs-and-the-dom.html 'React docs: Refs and the DOM') that have just been rendered by React and then pass them to GSAP as the target(s) for animation. We do the same on exit only inside the `componentWillLeave` method also provided by `ReactTransitionGroup`. In this way, we're only modifying the *appearance* of DOM nodes via GSAP and not disrupting React's control of rendering to the DOM. (In addition, since animations are more-or-less a nice-to-have[^c] and not absolutely essential to our data visualization functionality, we don't write tests around them, and so the difficulty of writing tests around things that happen inside React lifecycle methods does not come into play.)

### ✍️ example

If your React component has rendered a series of SVG `<circle>`s that you want to reveal in a stagger animation, one-by-one, start with assigning a `ref` on each `<circle>` in the `render` method of the component:

```js
render() {
  return (
    <g id="a-gaggle-of-circles">
      {_.map(data, (d) => (
        <circle cx={5} cy={10} r={5} opacity={0} ref={(node) => { this[d.id] = node; }} />
      ))}
    </g>
  );
}
```

Notice that we also render initially with opacity zero; the trick to this staggered render of `<circle>`s is to render all the `<circle>`s at the same time (in the React component's `render` method) and then stagger the animation to *full* opacity in [`componentWillEnter`](https://facebook.github.io/react/docs/animation.html#componentwillenter 'React Animation Add-Ons: componentWillEnter'):

```js
componentWillEnter(callback) {
  const { animationDuration, data } = this.props;
  const targets = _.map(data, (d) => (this[d.id]));
  TweenMax.staggerTo(
    targets, animationDuration, { opacity: 1, onComplete: callback }, animationDuration / targets.length
  );
}
```

Also note the callback argument provided to `componentWillEnter`, which we specify as the `onComplete` in the `TweenMax.staggerTo` configuration.

-----

[^a]: Link, of course, for the youngins soon to ask, "What the hell is Flash?" (Also, 🎩 to @krystophv for pointing out to @jebeck that GSAP *was* originally a Flash animation library.)

[^b]: Source for React + React DOM and Angular 2 sizes: https://gist.github.com/Restuta/cda69e50a853aa64912d

[^c]: Though very valuable for [context-shifting](https://css-tricks.com/the-importance-of-context-shifting-in-ux-patterns/ 'CSS Tricks: The Importance of Context-Shifting in UX Patterns'), which is arguably even *more* important in data visualization than general application UX, because context-shifting with data aids in understanding changes and relationships in data, which is often (if not always!) the primary communicative purpose of a data visualization.
