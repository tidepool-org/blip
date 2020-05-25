import React from 'react';
import { browserHistory } from 'react-router';
import { translate } from 'react-i18next';
import SearchIcon from '@material-ui/icons/Search';
import { Box, Flex, Text } from 'rebass/styled-components';

import Table from '../../components/elements/Table';
import Button from '../../components/elements/Button';
import TextInput from '../../components/elements/TextInput';
import { Headline } from '../../components/elements/FontStyles';

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

  const [searchText, setSearchText] = React.useState();

  function handleSearchChange(event) {
    setSearchText(event.target.value);
  }

  const handleAddNew = () => browserHistory.push('prescriptions/new');


  const renderEdit = ({ id }) => (
    <Button p={0} fontSize="inherit" variant="textPrimary" onClick={() => browserHistory.push(`prescriptions/${id}/edit`)}>{t('Edit')}</Button>
  );

  const renderState = ({ state }) => {
    let colors = {
      draft: {
        color: 'indigos.9',
        bg: 'indigos.0',
      },
      pending: {
        color: 'oranges.9',
        bg: 'oranges.0',
      },
      submitted: {
        color: 'greens.9',
        bg: 'greens.0',
      },
    };

    const stateColors = colors[state] || {
      color: 'text.primary',
      bg: 'transparent',
    }

    return <Text as="span" px={2} py={1} fontWeight="medium" sx={{ borderRadius: 4 }} color={stateColors.color} bg={stateColors.bg}>{state}</Text>;
  };

  const columns = [
    { title: t('First Name'), field: 'firstName', align: 'left', sortable: true, searchable: true },
    { title: t('Last Name'), field: 'lastName', align: 'left', sortable: true, searchable: true },
    { title: t('MRN #'), field: 'mrn', align: 'left', searchable: true },
    { title: t('State'), field: 'state', render: renderState, align: 'left', sortable: true},
    { title: t('Edit'), field: 'edit', render: renderEdit, align: 'left' },
  ];

  return (
    <Box mx={3} my={2} px={2} py={4} bg='white'>
      <Flex my={3} justifyContent="space-between">
        <Box alignSelf="flex-end">
          <Flex>
            <Headline mr={3}>{t('Prescriptions')}</Headline>
            <Button variant="primary" onClick={handleAddNew}>{t('Add New')}</Button>
          </Flex>
        </Box>
        <TextInput
          themeProps={{
            width: 'auto',
            minWidth: '250px',
          }}
          placeholder={t('search by name or MRN #')}
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
