import React, { useState } from 'react';
import { action } from '@storybook/addon-actions';
import { boolean as bool, optionsKnob as options } from '@storybook/addon-knobs';
import { ThemeProvider } from '@emotion/react';
import toUpper from 'lodash/toUpper';
import random from 'lodash/random';
import SearchIcon from '@material-ui/icons/Search';
import MoreHorizRoundedIcon from '@material-ui/icons/MoreHorizRounded';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { Flex, Box, Text } from 'theme-ui';

import baseTheme from '../app/themes/baseTheme';
import Table from '../app/components/elements/Table';
import Avatar from '../app/components/elements/Avatar';
import TextInput from '../app/components/elements/TextInput';
import Select from '../app/components/elements/Select';
import Button from '../app/components/elements/Button';
import Icon from '../app/components/elements/Icon';

/* eslint-disable max-len */

// Wrap each story component with the base theme
const withTheme = (Story) => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Tables',
  decorators: [withTheme],
};

const createPatient = (name, email) => {
  const colors = ['blues', 'cyans', 'greens', 'indigos', 'oranges', 'pinks', 'purples'];

  return { name, email, color: colors[random(colors.length - 1)] };
};

const createData = (patient, status, permission, role) => ({ patient, status, permission, role });

const renderPatient = ({ patient }) => {
  let initials = patient.name.match(/\b\w/g) || [];
  initials = toUpper((initials.shift() || '') + (initials.pop() || ''));

  return (
    <Flex sx={{ alignItems: 'center' }}>
      <Avatar color={`${patient.color}.9`} bg={`${patient.color}.0`} mr={3} initials={initials} />
      <Box>
        <Text fontWeight="medium">{patient.name}</Text>
        <Text>{patient.email}</Text>
      </Box>
    </Flex>
  );
};

const renderStatus = ({ status }) => {
  let color = 'text.primary';
  let bg = 'transparent';

  if (status) {
    color = status === 'success' ? 'greens.9' : 'indigos.9';
    bg = status === 'success' ? 'greens.0' : 'indigos.0';
  }

  return (
    <Text px={2} py={1} sx={{ fontWeight: 'medium', borderRadius: 4, color, bg }}>
      {status}
    </Text>
  );
};

const renderEdit = ({ patient }) => (
  <Button
    p={0}
    sx={{ fontSize: 'inherit' }}
    variant="textPrimary"
    onClick={action(`"Edit" called for ${patient.name}`)}
  >
    Edit
  </Button>
);

const renderMore = ({ patient }) => (
  <Icon
    variant="button"
    icon={MoreHorizRoundedIcon}
    label="More actions"
    onClick={action(`"More actions" called for ${patient.name}`)}
  />
);

function RoleTitleComponent() {
  return (
    <Flex sx={{ flexWrap: 'nowrap', alignItems: 'center' }}>
      <Text mr={1}>Role</Text>
      <Icon
        fontSize={1}
        variant="default"
        icon={InfoOutlinedIcon}
        onClick={action('Popover with some info')}
      />
    </Flex>
  );
}

const columns = [
  {
    title: 'Patient',
    field: 'patient',
    align: 'left',
    sortable: true,
    sortBy: 'patient.name',
    render: renderPatient,
    searchable: true,
    searchBy: ['patient.name', 'patient.email'],
  },
  {
    title: 'Status',
    field: 'status',
    align: 'left',
    sortable: true,
    render: renderStatus,
    searchable: true,
  },
  { title: 'Permission', field: 'permission', align: 'left' },
  { title: 'Role', field: 'role', align: 'left', titleComponent: RoleTitleComponent },
  { title: 'Edit', field: 'edit', render: renderEdit, align: 'left' },
  { title: '', field: 'more', render: renderMore, align: 'left' },
];

const data = [
  createData(
    createPatient('Claire Clownfish', 'claire@testemail.com'),
    '',
    'Prescriber',
    'Clinic Admin'
  ),
  createData(
    createPatient('James Jellyfish', 'james@testemail.com'),
    'success',
    '',
    'Clinic Member'
  ),
  createData(
    createPatient('Bill Barracuda', 'bill@testemail.com'),
    '',
    'Prescriber',
    'Clinic Admin'
  ),
  createData(
    createPatient('Sam Jellyfish', 'sam@testemail.com'),
    '',
    'Prescriber',
    'Clinic Member'
  ),
  createData(createPatient('Oprah Orca', 'oprah@testemail.com'), 'pending', '', 'Clinic Admin'),
  createData(
    createPatient('Wendy Barracuda', 'wendy@testemail.com'),
    'pending',
    '',
    'Clinic Admin'
  ),
  createData(
    createPatient('George Grouper', 'george@testemail.com'),
    '',
    'Prescriber',
    'Clinic Admin'
  ),
  createData(createPatient('Peter Pike', 'peter@testemail.com'), 'success', '', 'Clinic Member'),
  createData(
    createPatient('Patsy Pickeral', 'patsy@testemail.com'),
    '',
    'Prescriber',
    'Clinic Admin'
  ),
  createData(createPatient('Tom Turtle', 'tom@testemail.com'), '', 'Prescriber', 'Clinic Member'),
  createData(createPatient('Perry Porpoise', 'perry@testemail.com'), 'pending', '', 'Clinic Admin'),
  createData(createPatient('Marco Manowar', 'marco@testemail.com'), 'success', '', 'Clinic Admin'),
];

const stickyHeader = () => bool('Sticky Header', false);
const rowHover = () => bool('Enable Row Hover', true);

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

export const Simple = {
  render: () => {
    const [searchText, setSearchText] = useState();

    function handleSearchChange(event) {
      setSearchText(event.target.value);
    }

    return (
      <React.Fragment>
        <Flex my={3} sx={{ justifyContent: 'flex-end', flexGrow: 1 }}>
          <TextInput
            themeProps={{
              width: 'auto',
              minWidth: '250px',
            }}
            placeholder="enter search text"
            icon={SearchIcon}
            label="Search clinicians"
            name="search"
            onChange={handleSearchChange}
            variant="condensed"
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
          orderBy="patient.name"
          order="asc"
        />
      </React.Fragment>
    );
  },

  name: 'Simple',

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=4%3A993',
    },
  },
};

export const Paged = {
  render: () => {
    const [searchText, setSearchText] = useState();
    const [rowsPerPage, setRowsPerPage] = React.useState(3);

    function handleSearchChange(event) {
      setSearchText(event.target.value);
    }

    const handleRowsPerPageChange = (event) => {
      setRowsPerPage(+event.target.value);
    };

    const rowsPerPageOptions = [
      { value: 3, label: '3' },
      { value: 5, label: '5' },
      { value: 10, label: '10' },
      { value: 15, label: '15' },
    ];

    return (
      <React.Fragment>
        <Flex my={3} sx={{ justifyContent: 'flex-end', flexGrow: 1 }}>
          <Select
            themeProps={{
              mr: 3,
              width: 'auto',
            }}
            label="Rows per Page"
            name="row-count-select"
            options={rowsPerPageOptions}
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            variant="condensed"
          />
          <TextInput
            themeProps={{
              width: 'auto',
              minWidth: '250px',
            }}
            placeholder="enter search text"
            icon={SearchIcon}
            label="Search clinicians"
            name="search"
            onChange={handleSearchChange}
            variant="condensed"
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
          rowsPerPage={rowsPerPage}
          orderBy="patient.name"
          order="asc"
          pagination
        />
      </React.Fragment>
    );
  },

  name: 'Paged',

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=4%3A993',
    },
  },
};
