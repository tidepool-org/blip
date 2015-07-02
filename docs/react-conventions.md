## Blip React Conventions

This document is intended to explain and clarify the approach taken when 
writing React Classes within the Blip project. This is a living document
and will also include rationale behind decisions made for coding style and
preferred patterns and idioms.


### Code Organisation

All React code lives in the `/app` folder. We differientiate between two 
different types of ReactClasses, pages and components. 

The different pages, which map to the different routes of the application
are organised in `/app/pages`.

The components, which are reusable modules, are stored in `/app/components`.

The React application is bootstrapped into the DOM in `/app/app.js`. 
This loads the root element, AppComponent, and renders it providing it with
a child cotnext that contains the required dependencies.


### Props

- 

### State

- The majority of the state of the application is set in `app/components/app.js`. 

- It is good practice to only set state in the root element so that data only ever flows in one direction through the application. [1]

- Where possible do not use props in the initial state of children. This can lead to 
a duplication of the source of truth [2]


[1](http://stackoverflow.com/questions/29796435/is-good-practice-to-pass-state-as-props-to-children)
[2](https://facebook.github.io/react/tips/props-in-getInitialState-as-anti-pattern.html)

### Testing

