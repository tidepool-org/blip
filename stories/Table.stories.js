import React from 'react';

import { withDesign } from 'storybook-addon-designs';
import { withKnobs, boolean, optionsKnob as options } from '@storybook/addon-knobs';
import { ThemeProvider } from 'styled-components';
import toUpper from 'lodash/toUpper';
import { Flex, Box, Text } from 'rebass/styled-components';

import baseTheme from '../app/themes/baseTheme';
import Table from '../app/components/elements/Table';

/* eslint-disable max-len */

// Wrap each story component with the base theme
const withTheme = Story => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Tables',
  decorators: [withDesign, withKnobs, withTheme],
};

function createData(patient, status, permission, role) {
  return { patient, status, permission, role };
}

function renderName({ patient }) {
  let initials = patient.name.match(/\b\w/g) || [];
  initials = toUpper((initials.shift() || '') + (initials.pop() || ''));

  return (
    <Flex alignItems="center">
      <Box px={2}>{initials}</Box>
      <Box px={2}>
        <Text fontWeight="medium">{patient.name}</Text>
        <Text>{patient.email}</Text>
      </Box>
    </Flex>
  );
}

function renderStatus({ status }) {
  let color = 'text.primary';
  let bg = 'white';

  if (status) {
    color = status === 'success' ? 'greens.9' : 'indigos.9';
    bg = status === 'success' ? 'greens.0' : 'indigos.0';
  }

  return <Text as="span" px={2} py={1} fontWeight="medium" sx={{ borderRadius: 4 }} color={color} bg={bg}>{status}</Text>;
}

const columns = [
  { title: 'Patient', field: 'patient', align: 'left', sortable: true, render: renderName },
  { title: 'Status', field: 'status', align: 'left', render: renderStatus },
  { title: 'Permission', field: 'permission', align: 'left' },
  { title: 'Role', field: 'role', align: 'left' },
];

const data = [
  createData({ name: 'Claire Clownfish', email: 'foo@bar.com' }, '', 'Prescriber', 'Clinic Admin'),
  createData({ name: 'James Jellyfish', email: 'foo@bar.com' }, 'success', '', 'Clinic Member'),
  createData({ name: 'Bill Barracuda', email: 'foo@bar.com' }, '', 'Prescriber', 'Clinic Admin'),
  createData({ name: 'Sam Jellyfish', email: 'foo@bar.com' }, '', 'Prescriber', 'Clinic Member'),
  createData({ name: 'Oprah Orca', email: 'foo@bar.com' }, 'success', '', 'Clinic Admin'),
  createData({ name: 'Wendy Barracuda', email: 'foo@bar.com' }, 'pending', '', 'Clinic Admin'),
  createData({ name: 'George Grouper', email: 'foo@bar.com' }, '', 'Prescriber', 'Clinic Admin'),
  createData({ name: 'Peter Pike', email: 'foo@bar.com' }, 'success', '', 'Clinic Member'),
  createData({ name: 'Patsy Pickeral', email: 'foo@bar.com' }, '', 'Prescriber', 'Clinic Admin'),
  createData({ name: 'Tom Turtle', email: 'foo@bar.com' }, '', 'Prescriber', 'Clinic Member'),
  createData({ name: 'Perry Porpoise', email: 'foo@bar.com' }, 'pending', '', 'Clinic Admin'),
  createData({ name: 'Marco Manowar', email: 'foo@bar.com' }, 'success', '', 'Clinic Admin'),
];

const stickyHeader = () => boolean('Sticky Header', false);
const rowHover = () => boolean('Enable Row Hover', false);


const variants = {
  Default: 'default',
  Condensed: 'condensed',
};

const variant = () => options('Variant', variants, 'default', { display: 'inline-radio' });

const backgrounds = {
  None: 'transparent',
  'Light Grey': 'lightestGrey',
};

const background = () => options('Background Color', backgrounds, 'transparent', { display: 'inline-radio' });

export const Simple = () => (
  <React.Fragment>
    <Table
      stickyHeader={stickyHeader()}
      rowHover={rowHover()}
      variant={variant()}
      data={data}
      columns={columns}
      bg={background()}
    />
  </React.Fragment>
);

Simple.story = {
  name: 'Simple',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=4%3A993',
    },
  },
};
