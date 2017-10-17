## Device settings (i.e., insulin pump settings) utilities

This directory contains the components required to visualize and also copy device settings

### Copy text

*Aim:*
To enable the easy copy and pasting of the settings while also allowing the user to modify the table that has been copied. To do this we need to remove all styles and have a very simple text representation of the table while still keeping its basic format.

*In the component:*
We are using `ClipboardButton` and then have built a text representation of the settings that essentially uses a command-line tool `text-table`. This is then embedded in a `<pre>..</pre>` tag as we want to ensure no styles are copied. All of the work is done in `utils/settings/textData.js` to build the table.
