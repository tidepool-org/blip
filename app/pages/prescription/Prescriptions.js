import React from 'react';
import { browserHistory } from 'react-router';
import { translate } from 'react-i18next';
import SearchIcon from '@material-ui/icons/Search';
import { Box, Flex } from 'rebass/styled-components';

import Table from '../../components/elements/Table';
import Button from '../../components/elements/Button';
import TextInput from '../../components/elements/TextInput';

const createPlaceholderPrescription = (id, firstName, lastName, mrn, state) => ({ id, firstName, lastName, mrn, state });

const stubPrescriptions = [
  createPlaceholderPrescription('0', 'Claire', 'Clownfish', '0123', 'draft'),
  createPlaceholderPrescription('1', 'James', 'Jellyfish', '1234', 'draft'),
  createPlaceholderPrescription('2', 'Bill', 'Barracuda', '2345', 'pending'),
  createPlaceholderPrescription('3', 'Sam', 'Jellyfish', '3456', 'draft'),
  createPlaceholderPrescription('4', 'Oprah', 'Orca', '4567', 'pending'),
  createPlaceholderPrescription('5', 'Wendy', 'Barracuda', '5678', 'submitted'),
];

const Prescriptions = props => {
  const { prescriptions = stubPrescriptions, t } = props;

  const renderEdit = ({ id }) => (
    <Button p={0} fontSize="inherit" variant="textPrimary" onClick={() => browserHistory.push(`prescriptions/${id}/edit`)}>{t('Edit')}</Button>
  );

  const columns = [
    { title: 'First Name', field: 'firstName', align: 'left', sortable: true, searchable: true },
    { title: 'Last Name', field: 'lastName', align: 'left', sortable: true, searchable: true },
    { title: 'MRN', field: 'mrn', align: 'left', searchable: true },
    { title: 'Status', field: 'state', align: 'left', sortable: true},
    { title: 'Edit', field: 'edit', render: renderEdit, align: 'left' },
  ];

  const [searchText, setSearchText] = React.useState();

  function handleSearchChange(event) {
    setSearchText(event.target.value);
  }

  const handleAddNew = () => browserHistory.push('prescriptions/new');

  return (
    <Box mx={3} my={2} px={2} py={4} bg='white'>
      <Flex my={3} justifyContent="space-between">
        <Box alignSelf="flex-end">
          <Button variant="primary" onClick={handleAddNew}>{t('Add New')}</Button>
        </Box>
        <TextInput
          themeProps={{
            width: 'auto',
            minWidth: '250px',
          }}
          placeholder={t('enter search text')}
          icon={SearchIcon}
          label={t('Search Prescriptions')}
          name="search-prescriptions"
          onChange={handleSearchChange}
          variant="condensed"
        />
      </Flex>
      <Table
        label="Sample clinician list"
        id="prescriptions-table"
        data={prescriptions}
        columns={columns}
        searchText={searchText}
        orderBy="lastName"
        order="asc"
      />
    </Box>
  );
};

export default translate()(Prescriptions);
