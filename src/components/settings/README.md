## Settings utilities

This directory contains the componets required to vizualize and also print device settings

### print view

*Aim:*
To keep our componets as similar when viewed in the web app as when printed. Where varations occur, such as so we can show all settings in an open state, we have initially taken the approach outlined

*In the component:*
Based on the mode the component is being viewed in we have a prop that can be used and then the component be shown in a different state. In the settings instance it means showing all the settings sections expanded.

```
printView: React.PropTypes.bool.isRequired
```

*In the css:*
If there are any specific print styles these are contained in the section below. Of note are the `page-break`s. At this stage they have been done on a "best guess" and are specific to each comonent based on how we would ideally like the settings to be broken up when printing.

```
@media print {
    ....
}
```
