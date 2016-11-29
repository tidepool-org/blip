## Code style

### React components

When writing [React](http://facebook.github.io/react) components, try to follow the following guidelines:

- Keep components small. If a component gets too big, it might be worth splitting it out into smaller pieces.
- Keep state to a minimum. A component without anything in `state` and only `props` would be best. When state is needed, make sure nothing is redundant and can be derived from other state values. Move state upstream (to parent components) as much as it makes sense.
- Use the `propTypes` attribute to document what props the component requires; use `isRequired` as the default unless the prop is truly optional.

More on state:
- Each page (`app/pages` is a connected "smart" component (in redux's terminology) that is connected to our redux store, which holds and manages all global app state.
- Each page (`app/pages`) can hold some state specific to that page.
- Reusable components (`app/components`) typically hold no state (with rare exceptions, like forms).

Please also review:

- [React @ Tidepool guide](http://developer.tidepool.io/docs/front-end/react/index.html 'Tidepool developer portal: React @ Tidepool')
- [Blip's usage of React](./React.md)

And when writing *new* components, try to follow [the ES6 and React standards](http://developer.tidepool.io/viz/docs/CodeStyle.html 'viz docs: code style') we are now using in the [viz repo](https://github.com/tidepool-org/viz 'GitHub: viz').

### Less

Prefix all CSS classes with the component name. For example, if I'm working on the `PatientList` component, I'll prefix CSS classes with `patient-list-`.

Keep styles in the same folder as the component, and import them in the main `app/style.less` stylesheet. If working on a "core" style, don't forget to import the files in `app/core/core.less`.

In organizing the core styles in different `.less` files, as well as naming core style classes, we more or less take inspiration from Twitter Bootstrap (see [https://github.com/twbs/bootstrap/tree/master/less](https://github.com/twbs/bootstrap/tree/master/less)).

Some styles we'd rather not use on touch screens (for example hover effects which can be annoying while scrolling on touch screens). For that purpose, a small snippet (`app/core/notouch.js`) will add the `.no-touch` class to the root document element, so you can use:

```less
.no-touch .list-item:hover {
  // This will not be used on touch screens
  background-color: #ccc;
}
```

### Icons

We use an icon font for app icons (in `app/core/fonts/`). To use an icon, simply add the correct class to an element (convention is to use the `<i>` element), for example:

```html
<i class="icon-logout"></i>
```

Take a look at the `app/core/less/icons.less` file for available icons.

### ESLint

In a separate terminal, you can lint JS files with:

```bash
$ npm run lint
```
