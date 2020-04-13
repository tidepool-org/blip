import React from 'react';
import { withDesign } from 'storybook-addon-designs';
import { withKnobs, boolean, select, optionsKnob as options } from '@storybook/addon-knobs';
import { ThemeProvider } from 'styled-components';
import range from 'lodash/range';

import baseTheme from '../app/themes/baseTheme';
import Pagination from '../app/components/elements/Pagination';

/* eslint-disable max-len */

// Wrap each story component with the base theme
const withTheme = Story => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Pagination',
  decorators: [withDesign, withKnobs, withTheme],
};

const pageCount = () => select('Page Count', range(5, 50), 10);
const initialPage = () => select('Initial Page', range(1, pageCount()), 1);
const disabled = () => boolean('Disabled', false);


const variations = {
  Default: 'default',
  Condensed: 'condensed',
};

const variation = () => options('Variation', variations, 'default', { display: 'inline-radio' });

export const PaginationStory = () => {
  const [page, setPage] = React.useState(initialPage());

  const handleChange = (event, newValue) => {
    setPage(newValue);
  };

  return (
    <React.Fragment>
      <p>Page selected: {page}</p>
      <Pagination
        page={page}
        count={pageCount()}
        onChange={handleChange}
        disabled={disabled()}
        variation={variation()}
      />
    </React.Fragment>
  );
};

PaginationStory.story = {
  name: 'Tab Group',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=4%3A992',
    },
  },
};
