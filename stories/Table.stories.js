import React from 'react';

import { withDesign } from 'storybook-addon-designs';
import { withKnobs, boolean, optionsKnob as options } from '@storybook/addon-knobs';
import { ThemeProvider } from 'styled-components';
import toUpper from 'lodash/toUpper';
import random from 'lodash/random';
import { Flex, Box, Text } from 'rebass/styled-components';

import baseTheme from '../app/themes/baseTheme';
import Table from '../app/components/elements/Table';
import Avatar from '../app/components/elements/Avatar';
import TextInput from '../app/components/elements/TextInput';
import SearchIcon from '@material-ui/icons/Search';

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

function createPatient(name, email) {
  const colors = [
    'blues',
    'cyans',
    'greens',
    'indigos',
    'oranges',
    'pinks',
    'purples',
  ];

  return { name, email, color: colors[random(colors.length - 1)] };
}

function createData(patient, status, permission, role) {
  return { patient, status, permission, role };
}

function renderPatient({ patient }) {
  let initials = patient.name.match(/\b\w/g) || [];
  initials = toUpper((initials.shift() || '') + (initials.pop() || ''));

  return (
    <Flex alignItems="center">
      <Avatar color={`${patient.color}.9`} bg={`${patient.color}.0`} mr={3} initials={initials} />
      <Box>
        <Text fontWeight="medium">{patient.name}</Text>
        <Text>{patient.email}</Text>
      </Box>
    </Flex>
  );
}

function renderStatus({ status }) {
  let color = 'text.primary';
  let bg = 'transparent';

  if (status) {
    color = status === 'success' ? 'greens.9' : 'indigos.9';
    bg = status === 'success' ? 'greens.0' : 'indigos.0';
  }

  return <Text as="span" px={2} py={1} fontWeight="medium" sx={{ borderRadius: 4 }} color={color} bg={bg}>{status}</Text>;
}

const columns = [
  { title: 'Patient', field: 'patient', align: 'left', sortable: true, sortBy: 'patient.name', render: renderPatient, searchable: true, searchBy: ['patient.name', 'patient.email'] },
  { title: 'Status', field: 'status', align: 'left', sortable: true, render: renderStatus, searchable: true },
  { title: 'Permission', field: 'permission', align: 'left' },
  { title: 'Role', field: 'role', align: 'left' },
];

const data = [
  createData(createPatient('Claire Clownfish', 'claire@testemail.com'), '', 'Prescriber', 'Clinic Admin'),
  createData(createPatient('James Jellyfish', 'james@testemail.com'), 'success', '', 'Clinic Member'),
  createData(createPatient('Bill Barracuda', 'bill@testemail.com'), '', 'Prescriber', 'Clinic Admin'),
  createData(createPatient('Sam Jellyfish', 'sam@testemail.com'), '', 'Prescriber', 'Clinic Member'),
  createData(createPatient('Oprah Orca', 'oprah@testemail.com'), 'pending', '', 'Clinic Admin'),
  createData(createPatient('Wendy Barracuda', 'wendy@testemail.com'), 'pending', '', 'Clinic Admin'),
  createData(createPatient('George Grouper', 'george@testemail.com'), '', 'Prescriber', 'Clinic Admin'),
  createData(createPatient('Peter Pike', 'peter@testemail.com'), 'success', '', 'Clinic Member'),
  createData(createPatient('Patsy Pickeral', 'patsy@testemail.com'), '', 'Prescriber', 'Clinic Admin'),
  createData(createPatient('Tom Turtle', 'tom@testemail.com'), '', 'Prescriber', 'Clinic Member'),
  createData(createPatient('Perry Porpoise', 'perry@testemail.com'), 'pending', '', 'Clinic Admin'),
  createData(createPatient('Marco Manowar', 'marco@testemail.com'), 'success', '', 'Clinic Admin'),
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

export const Simple = () => {
  const [searchText, setSearchText] = React.useState();

  function handleSearchChange(event) {
    setSearchText(event.target.value);
  }

  return (
    <React.Fragment>
      <Flex my={3} justifyContent="flex-end">
        <TextInput
          placeholder="search clinicians"
          icon={SearchIcon}
          label="search clinicians"
          name="search"
          onChange={handleSearchChange}
        />
      </Flex>
      <Table
        label="Sample clinician list"
        id="my-table"
        stickyHeader={stickyHeader()}
        rowHover={rowHover()}
        variant={variant()}
        data={data}
        columns={columns}
        bg={background()}
        searchText={searchText}
        // orderBy="patient.name"
        // order="desc"
      />
    </React.Fragment>
  );
};

Simple.story = {
  name: 'Simple',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=4%3A993',
    },
  },
};
