# tidepool-viz developer guide

This repository, which is published to [npm](https://www.npmjs.com/ 'node package manager') as [tidepool-viz](https://www.npmjs.com/package/tidepool-viz 'npm: tidepool-viz') is a library providing data visualization components and state management tools for use in [blip](https://github.com/tidepool-org/blip 'GitHub: blip'), Tidepool's main web application for people with type 1 diabetes and their care teams to view and contextualize (via notes) the PwD's diabetes device data.

As you're getting ready to develop code in this repository, we recommend starting with the following documents:

- [project background](./Background.md)
- [overview of features](./FeatureOverview.md)
- [planned architecture](./Architecture.md)
- [app & directory structure](./DirectoryStructure.md)
- [code style](./CodeStyle.md)
- [dependencies](./deps/README.md)

The root-level [README](../README.md) contains the nuts & bolts of installing, configuring, and commands to accomplish various tasks.

The [per-view documentation](./views/README.md) is the place to look for details on the implementation of each major data "view" implemented in this repository for inclusion in blip.

Finally, there are some miscellaneous docs on *miscellaneous* topics:

- [Common props](./misc/CommonProps.md) documents and provides a quick reference to a few very common props you will see used and passed around many viz components.
- [Working on docs](./misc/Docs.md) contains guidance on getting set up to add to this documentation.
- [Time rendering modes](./misc/TimeRenderingModes.md) documents the difference between the "timezone-aware" (default) and "timezone-naïve" rendering modes.
