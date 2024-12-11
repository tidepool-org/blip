import React from 'react';
import { Box, Flex } from 'theme-ui';
import { boolean as bool } from '@storybook/addon-knobs';

import baseTheme from '../app/themes/baseTheme';
import Accordion from '../app/components/elements/Accordion';

/* eslint-disable max-len */

export default {
  title: 'Accordion',
  component: Accordion,
};

export const AccordionStory = {
  render: () => {
    const initiallyExpanded = () => bool('Panel 2 Initially Expanded', true);
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
        <Accordion {...props}>Content 1</Accordion>
        <Accordion disabled {...props}>
          Disabled
        </Accordion>
        <Accordion
          {...props}
          expanded={expanded}
          onChange={handleChange}
          header="Controlled Panel"
          label={'accordion2'}
        >
          Content 2
        </Accordion>
        <Accordion
          {...props}
          label={'accordion3'}
          header={
            <Flex sx={{ justifyContent: 'space-between' }} width={'100%'}>
              <Box>Custom Header</Box>
              <Box
                color={baseTheme.colors.text.primarySubdued}
                fontWeight={baseTheme.fontWeights.regular}
              >
                Note
              </Box>
            </Flex>
          }
        >
          Content 3
        </Accordion>
      </>
    );
  },

  name: 'Accordion',

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=51%3A421',
    },
  },
};
