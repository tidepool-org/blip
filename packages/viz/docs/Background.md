## Background

This repository represents an incremental rewrite of Tidepool's data visualization code. The first implementation of Tidepool's data visualization can be found in [tideline](https://github.com/tidepool-org/tideline 'GitHub: tideline').

We continue to develop the data visualization code in a separate repository from Tidepool's main web application [blip](https://github.com/tidepool-org/blip 'GitHub: blip') for several reasons:

- separation of concerns: the visualization code has distinct requirements, dependencies, and development practices from the rest of blip
- potential use by third parties building their own web applications on top of the Tidepool platform but who want to leverage some of the same data visualization components as those used in blip

Historically, tideline was a separate codebase for one additional reason that is no longer a concern for us: we wanted to keep the visualization code "pure" D3 and in particular wanted to only have a React dependency in the blip codebase to avoid forcing the choice of React as a framework on third parties who might want to use our visualization code. In 2013-2014 when React was not yet the juggernaut framework it is today, this made a lot more sense.

Today with [React having the majority of use & interest](http://stateofjs.com/2016/frontend/ 'The State of JavaScript 2016: Front-end frameworks') among front-end JavaScript frameworks, it is much less of a concern. Moreover, experience taught us—the hard way—that there aren't a lot of really good patterns or frameworks for creating consistent, long-term maintainable, and easily testable D3 code[^a]. On the other hand, React was built at least partly with consistency, maintainability, and testability in mind, and there are well-established community best practices to follow in order to achieve these goals. As a result, our rewrite of Tidepool's data visualization code now includes React as a core dependency, and we are shifting from a strategy of using D3 as much as possible to the opposite: we aim to use React as much as possible and only bring in the small modules we need from [the 4.x rearchitected D3](https://github.com/d3/d3/blob/master/CHANGES.md 'Changes in D3 4.0') as individual dependencies—e.g., [d3-scale](https://github.com/d3/d3-scale 'GitHub: d3-scale') and [d3-time](https://github.com/d3/d3-time 'GitHub: d3-time').

### State of the rewrite

#### As of November, 2016...

Blip depends on tidepool-viz for:

- Device Settings (new implementation)
- Trends (CGM version as new implementation, BGM version a port of more-or-less equivalent functionality from tideline's code)

Blip still depends on tideline for:

- Basics view
- Daily view
- BG Log view
- data preprocessing (found in ["nurseshark"](https://github.com/tidepool-org/tideline/tree/master/plugins/nurseshark 'GitHub: tideline plugins/nurseshark/') and [the TidelineData constructor](https://github.com/tidepool-org/tideline/blob/master/js/tidelinedata.js 'GitHub: tideline js/tidelinedata.js'))

Blip itself handles:

- most of the visualization state management (e.g., checkbox options for BGM version of Trends view)
- navigation from view to view and along the time dimension

The eventual goal is for *everything* listed above to be handled by code in this repository. That is, eventually all code for all the data views as well as for the data preprocessing and visualization state management, including the navigation from view to view and along the time dimension will live in this repository.

* * * * *

[^a]: The Miso project's [d3.Chart](http://misoproject.com/d3-chart/ 'Miso Project: d3.Chart') was the most promising attempt at a lightweight "framework" for D3 heavily inspired by [Backbone](http://backbonejs.org/ 'Backbone.js')'s API, but the project's support has unfortunately been sporadic, and it [has not yet been updated to support the 4.x version of D3](https://github.com/misoproject/d3.chart/issues/121 'GitHub: d3.chart issue #121'). Nevertheless, we used d3.Chart in [the tideline version of the Trends view](https://github.com/tidepool-org/tideline/tree/master/plugins/blip/modalday 'GitHub: tideline modalday').
