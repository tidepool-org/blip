import React from 'react';

import { boolean as bool, select, optionsKnob as options } from '@storybook/addon-knobs';
import { ThemeProvider } from '@emotion/react';
import range from 'lodash/range';
import { Text } from 'theme-ui';

import baseTheme from '../app/themes/baseTheme';
import Pagination from '../app/components/elements/Pagination';

/* eslint-disable max-len */

// Wrap each story component with the base theme
const withTheme = (Story) => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Pagination',
  decorators: [withTheme],
};

const pageCount = () => select('Page Count', range(5, 1000), 1000);
const initialPage = () => select('Initial Page', range(1, pageCount()), 99);
const disabled = () => bool('Disabled', false);
const showPrevNextControls = () => bool('Show Prev/Next Controls', true);
const showFirstLastControls = () => bool('Show First/Last Controls', false);

const variants = {
  Default: 'default',
  Condensed: 'condensed',
};

const variant = () => options('Variant', variants, 'default', { display: 'inline-radio' });

const backgrounds = {
  None: 'transparent',
  'Light Grey': 'lightestGrey',
};

const background = () =>
  options('Background Color', backgrounds, 'transparent', { display: 'inline-radio' });

export const PaginationStory = {
  render: () => {
    const [page, setPage] = React.useState(initialPage());

    const handleChange = (event, newValue) => {
      setPage(newValue);
    };

    return (
      <React.Fragment>
        <Pagination
          id="my-paginator"
          page={page}
          count={pageCount()}
          onChange={handleChange}
          disabled={disabled()}
          hidePrevButton={!showPrevNextControls()}
          hideNextButton={!showPrevNextControls()}
          showFirstButton={showFirstLastControls()}
          showLastButton={showFirstLastControls()}
          variant={variant()}
          py={2}
          bg={background()}
        />
        <Text
          mt={4}
          fontSize={2}
          fontFamily="default"
          color="text.primary"
          sx={{ textAlign: 'center' }}
        >
          Page Selected: <Text sx={{ fontWeight: 'medium' }}>{page}</Text>
        </Text>
      </React.Fragment>
    );
  },

  name: 'Default',

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=4%3A992',
    },
  },
};
