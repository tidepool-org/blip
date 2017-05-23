## use of React Storybook

[React Storybook](https://storybooks.js.org/ 'Storybook') is a UI component development tool that's very easy to set up and configure. It provides a way to render components outside of their full in-app context in many different states—and even, with some addons, interactively. A Storybook can serve many purposes.

1. As long as there is fake data available (or easily fabricated) to serve as the props for a component, Storybook can be used as a very fast developer environment[^a] for iterating on the design and implementation of the isolated component.

1. By fabricating the appropriate props for a component, Storybook can be used to design for or around rare edge cases or pathological inputs in the data driving a component.

1. When published as a static site, a Storybook can serve as great design and front-end engineering documentation for the components included.

1. When published as a static site, a Storybook can serve as a "component catalog" for third-party developers wanting to use some or all of the components in the library.

We use or plan to use Storybook for *all* of these purposes!

### Storybooks x 2

We have **two** Storybooks in viz:

1. The `storiesDatatypes/` directory contains stories for the rendering of diabetes data types from the [Tidepool data model](http://developer.tidepool.io/data-model/ 'Tidepool data model documentation'). As of May 2017, it contains a `Basal` component for representing (sequences of) [basal rate intervals on insulin pumps](http://developer.tidepool.io/data-model/device-data/types/basal/index.html 'Tidepool data model: basal') and a `Bolus` component for representing [bolus doses on insulin pumps](http://developer.tidepool.io/data-model/device-data/types/bolus/index.html 'Tidepool data model: bolus). Our ability to create a story for a component is often limited by our ability to snapshot (and anonymize) or fabricate fake data for it and/or the utility (or lack thereof) of the story in the case that we *can't* easily obtain or fabricate realistic-looking data. This is the reason why we don't have any stories for the Trends view components, for example.

1. The `stories/` directory is the default for all other components we're able to create stories for[^b].

We currently publish these two Storybooks as static sites alongside the viz docs via GitHub Pages:

1. [components rendering data types in the Tidepool data model](http://developer.tidepool.io/viz/diabetes-data-stories/ 'Storybook for Tidepool diabetes data model renderers')
1. [all other components](http://developer.tidepool.io/viz/stories/ 'Storybook for all non-diabetes data @tidepool/viz components')

### Running the storybooks

Each storybook has a command configured in the `package.json` `scripts` field. To run the diabetes datatype Storybook, run:

```bash
$ npm run typestories
```

To run the default Storybook, run:
```bash
$ npm run stories
```

### Publishing the storybooks

Whenever you've added or updated a story or stories as part of new development, you should update the viz documentation static site with new builds of the storybooks. In order to do this, you will need to make sure that your repository is set up for working on the docs static site for this repository [as explained on the docs page](./misc/Docs.md), then follow the instructions there for bundling the GitHub Pages-appropriate static files of the Storybook.

[^a]: It includes Webpack's hot module reloading by default, which is ⚡*awesome*⚡.


