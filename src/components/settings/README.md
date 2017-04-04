## Settings utilities

This directory contains the componets required to vizualize and also print device settings

### print view

*Aim:*
To keep our componets as similar when viewed in the web app as when printed. Where varations occur, such as so we can show all settings in an open state, we have initially taken the approach outlined

*In the component:*
Based on the mode the component is being viewed in we have a prop that can be used and then the component be shown in a different state. In the settings instance it means showing all the settings sections expanded.

```
view: PropTypes.oneOf([DISPLAY_VIEW, PRINT_VIEW]).isRequired,
```

*In the css:*
If there are any specific print styles these are contained in the section below. Of note are the `page-break`s. At this stage they have been done on a "best guess" and are specific to each comonent based on how we would ideally like the settings to be broken up when printing.

```
@media print {
    ....
}
```


### copy text

*Aim:*
To enable the easy copy and pasting of the settings while also allowing the user to modify the table that has been copied. To do this we need to remove all styles and have a very simple text representation of the table while still keeping its basic format.

*In the component:*
We are using `ClipboardButton` and then have built a text representation of the settings that essentially uses a commandline tool `text-table`. This is then embedded in a `<pre>..</pre>` tag as we want to ensure no styles are copied. All of the work is done in `utils\settings\textData.js` to built the table.

