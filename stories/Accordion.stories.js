import React from 'react';
import { withDesign } from 'storybook-addon-designs';
import { ThemeProvider } from 'styled-components';
import { Box, Flex } from 'rebass/styled-components';
import { withKnobs, boolean} from '@storybook/addon-knobs';

import baseTheme from '../app/themes/baseTheme';
import Accordion from '../app/components/elements/Accordion';

/* eslint-disable max-len */

// Wrap each story component with the base theme
const withTheme = Story => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Accordion',
  decorators: [withDesign, withTheme],
};

export const AccordionStory = () => {
  const initiallyExpanded = () => boolean('Panel 2 Initially Expanded', true);
  const [expanded, setExpanded] = React.useState(initiallyExpanded());

  const handleChange = (event, isExpanded) => setExpanded(isExpanded);

  const props = {
    header: 'Accordion Header',
    label: 'accordion',
    themeProps: {
      wrapper: {
        width: [1, 1 / 2],
      },
      panel: {},
      header: {},
    },
  };

  return (
    <>
      <Accordion {...props}>
        Content 1
      </Accordion>
      <Accordion disabled {...props}>
        Disabled
      </Accordion>
      <Accordion {...props} expanded={expanded} onChange={handleChange} header="Controlled Panel" label={'accordion2'}>
        Content 2
      </Accordion>
      <Accordion
        {...props}
        label={'accordion3'}
        header={
          <Flex
            justifyContent={'space-between'}
            width={'100%'}
          >
            <Box>Custom Header</Box>
            <Box color={baseTheme.colors.text.primarySubdued} fontWeight={baseTheme.fontWeights.regular}>Note</Box>
          </Flex>
        }
      >
        Content 3
      </Accordion>
    </>
  );
};

AccordionStory.story = {
  name: 'Accordion',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=51%3A131',
    },
  },
};
