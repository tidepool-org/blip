## Internationalization

### Code organization

Blip is using i18n to make all the labels available in different languages. Below is an example of source code using the react-i18next module:

```js
import { translate } from 'react-i18next';

const TidelineHeader = translate()(class TidelineHeader extends Component {

    ... 

    printTitle = () => {
    const { t } = this.props;
    switch (this.props.chartType) {	    
        case 'basics':
            return t('Basics');
    ... 
    }

```

In the above example the `Basics` label will be translated if the related entry exists in the translation files.
Those files are located under ./locales/[language]/translation.json for each available language. 
The list of active languages are defined in ./locales/languages.json

```json
{
  "en": "English",
  "fr": "Français"
}
```

The active languages have also to be configured in the user profile so that a user can select its prefered lanaguage, `app/pages/userprofile/userprofile.js`

### Updating the translation files

Updating the translation files can be done manually but we recommend to use the `update-translations` helper that is available in our package.json. Here is the command line to execute it. 

```
npm run update-translations
```

It produces updated translations files such as `/locales/[language]/translation.json`. The previous versions of the translations are kept locally as `/locales/[language]/translation_old.json` files.

__Important Note:__ you have first to copy the content of viz and tideline modules into your node_modules blip local folder otherwise some labels will be missed. 
