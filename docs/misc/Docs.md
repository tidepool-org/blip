## Working on viz docs

This repository's docs are set up like all of Tidepool's front-end and docs repos. For details on this setup, see the [general guidance for docs setup & workflow](http://developer.tidepool.io/docs/docs/workflow.html 'Tidepool docs setup & workflow').

### Setup

To summarize briefly, the steps you will need to have done in order to use the `npm` scripts configured for docs work in the repository are:

- clone a second copy of this repository as a subdirectory `web/`; you can do this from your `viz/` directory with `git clone git@github.com:tidepool-org/viz.git web`
- switch to the `gh-pages` branch in the embedded clone and delete the `master` branch

```bash
$ cd web/
$ git checkout gh-pages
$ git branch -d master
```

### Regenerating

We generate Markdown documentation for the utilities in `src/utils/` from the [JSDoc comments](http://usejsdoc.org/ 'JSDoc') included with all exports and/or functions. The [README](../../src/utils/README.md) in `src/utils/` documents how to regenerate these Markdown files; this regeneration should be performed whenever you've added or updated a utility functon and/or the JSDoc for that utility.

### Publishing

To publish revised docs and/or Storybooks, run the following from the root of the `viz/` directory:

For updating just docs (including the `adidocs/` in `src/utils/`) by building the static [GitBook](https://www.gitbook.com/ 'GitBook') site that we publish to GitHub Pages:

```bash
$ npm run build-docs
```

Then `cd web/` and review the unstaged changes. Stage & commit the changes you want to make. Finally, "publish" to GitHub pages by pushing to the upstream `gh-pages` branch.

For updating the Storybooks (again from the root of `viz/`:

```bash
$ npm run build-storybooks
```

Again navigate into the embedded `web/` directory to review, stage, commit, and push the changes upstream.
