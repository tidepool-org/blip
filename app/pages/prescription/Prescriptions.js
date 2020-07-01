import React from 'react';
import { browserHistory } from 'react-router';
import { translate } from 'react-i18next';
import SearchIcon from '@material-ui/icons/Search';
import { Box, Flex, Text } from 'rebass/styled-components';
import values from 'lodash/values';

import Table from '../../components/elements/Table';
import Button from '../../components/elements/Button';
import TextInput from '../../components/elements/TextInput';
import { Headline } from '../../components/elements/FontStyles';
import { useLocalStorage } from '../../core/hooks';

const Prescriptions = props => {
  const { t } = props;

  const [searchText, setSearchText] = React.useState();

  // TODO: Get prescriptions from backend service when ready
  const [prescriptions] = useLocalStorage('prescriptions', {});

  const data = values(prescriptions);

  function handleSearchChange(event) {
    setSearchText(event.target.value);
  }

  const handleAddNew = () => browserHistory.push('prescriptions/new');

  const handleEdit = id => () => browserHistory.push({
    pathname: `prescriptions/${id}/edit`,
    state: {
      prescription: prescriptions[id],
      foo: 'bar',
    },
  });


  const renderEdit = ({ id }) => (
    <Button p={0} fontSize="inherit" variant="textPrimary" onClick={handleEdit(id)}>{t('Edit')}</Button>
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
        data={data}
        columns={columns}
        searchText={searchText}
        orderBy="lastName"
        order="asc"
      />
    </Box>
  );
};

export default translate()(Prescriptions);
