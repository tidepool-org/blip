import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { Box } from 'theme-ui';

import baseTheme from '../app/themes/baseTheme';
import ChangeMindImage from '../app/components/elements/SlideShow/Images/changeMindImage.svg';
import FuelingNextGenImage from '../app/components/elements/SlideShow/Images/fuelingNextGenImage.svg';
import { SlideShow, SlideShowItem } from '../app/components/elements/SlideShow';

/* eslint-disable max-len */

const withTheme = (Story) => (
  <ThemeProvider theme={baseTheme}>
    <Box variant="containers.largeBordered" p={3}>
      <Story />
    </Box>
  </ThemeProvider>
);

export default {
  title: 'SlideShows',
  decorators: [withTheme],
};

const items = [
  {
    title: 'Fueling the Next Generation of Diabetes Innovation',
    content: 'The Tidepool Big Data Donation Project enables students, academics, and industry to innovate faster. By donating your anonymized data, you can help transform the landscape of diabetes management.',
    image: FuelingNextGenImage,
  },
  {
    title: 'Can I change my mind later?',
    content: 'You can stop sharing new data at any time. Go to your account settings and click "Stop sharing data." Please note that we cannot remove data that has already been shared.',
    image: ChangeMindImage,
  },
];

export const SlideShows = {
  render: () => (
    <SlideShow
      items={items}
      renderItem={({ item, index, isSnapPoint }) => (
        <SlideShowItem
          key={index}
          isSnapPoint={isSnapPoint}
          image={item.image}
          title={item.title}
          content={item.content}
        />
      )}
    />
  ),

  name: 'Default',

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/LdoOQCUyQKIS2d6fUhfFJx/Cloud-to-Cloud?node-id=2044-16648&t=uxeFnlP3CHzgkNRt-0',
    },
  },
};
