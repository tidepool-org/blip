import React from 'react';
import { Box, ThemeUIProvider } from 'theme-ui';

import baseTheme from '../app/themes/baseTheme';
import ChangeMindImage from '../app/components/elements/SlideShow/Images/changeMindImage.svg';
import FuelingNextGenImage from '../app/components/elements/SlideShow/Images/fuelingNextGenImage.svg';
import { SlideShow, SlideShowItem } from '../app/components/elements/SlideShow';

/* eslint-disable max-len */

const withTheme = (Story) => (
  <ThemeUIProvider theme={baseTheme}>
    <Box variant="containers.largeBordered" p={3}>
      <Story />
    </Box>
  </ThemeUIProvider>
);

export default {
  title: 'SlideShows',
  decorators: [withTheme],
};

const items = [
  {
    id: 'fuelingInnovation',
    title: 'Fueling the Next Generation of Diabetes Innovation',
    content: 'The Tidepool Big Data Donation Project enables students, academics, and industry to innovate faster. By donating your anonymized data, you can help transform the landscape of diabetes management.',
    image: FuelingNextGenImage,
    imageAlt: 'Illustration: fueling diabetes innovation',
  },
  {
    id: 'changeMind',
    title: 'Can I change my mind later?',
    content: 'You can stop sharing new data at any time. Go to your account settings and click "Stop Sharing Data." Please note that we cannot remove data that has already been shared.',
    image: ChangeMindImage,
    imageAlt: 'Illustration: changing your mind about data sharing',
  },
];

export const SlideShows = {
  render: () => (
    <SlideShow
      items={items}
      renderItem={({ item, index, isSnapPoint }) => (
        <SlideShowItem
          key={index}
          id={item.id}
          isSnapPoint={isSnapPoint}
          image={item.image}
          imageAlt={item.imageAlt}
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
