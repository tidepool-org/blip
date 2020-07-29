## Internationalization

### Code organization

Blip is using i18next to make all the labels available in different languages. Below is an example of source code using the i18next module:

```js
import { i18next } from 'i18next';

const t = i18next.t.bind(i18next);

class TidelineHeader extends React.Component {

    ...

    printTitle() {
      switch (this.props.chartType) {
        case 'basics':
            return t('Basics');
      ... 
    }

```
In the above example the `Basics` label will be translated if the related entry exists in the translation files.

### Add a new translation

Steps:
- Add the JSON file to `locales/<lang>/translation.json`.
- Update the `artifact.sh` to allow fetching of the parameters translations (`locales/<lang>/parameter.json`).
- Update `locales/languages.json` with the new language.

### Updating the translation files (deprecated, may be dangerous)

Updating the translation files can be done manually but we recommend to use the `update-translations` helper that is available in our package.json. Here is the command line to execute it. 

```
npm run update-translations
```

It produces updated translations files such as `/locales/[language]/translation.json`. The previous versions of the translations are kept locally as `/locales/[language]/translation_old.json` files.

__Important Note:__ you have first to copy the content of viz and tideline modules into your node_modules blip local folder otherwise some labels will be missed. 
