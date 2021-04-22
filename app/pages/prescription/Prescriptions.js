import React from 'react';
import { translate } from 'react-i18next';
import SearchIcon from '@material-ui/icons/Search';
import { Box, Flex, Text } from 'rebass/styled-components';
import map from 'lodash/map';
import get from 'lodash/get';

import Table from '../../components/elements/Table';
import Button from '../../components/elements/Button';
import TextInput from '../../components/elements/TextInput';
import { Headline } from '../../components/elements/FontStyles';
import withPrescriptions from './withPrescriptions';

const Prescriptions = props => {
  const {
    t,
    deletePrescription,
    deletingPrescription,
    prescriptions = [],
  } = props;

  const [searchText, setSearchText] = React.useState();

  const data = map(prescriptions, prescription => ({
    id: get(prescription, 'id'),
    patientUserId: get(prescription, 'patientUserId', prescription.id === '607846c36b119c2bad8e5a5d' ? '676404ec56' : undefined), // TODO: remove debugging fallback
    ...get(prescription, 'latestRevision.attributes', {}),
  }));

  function handleSearchChange(event) {
    setSearchText(event.target.value);
  }

  const handleAddNew = () => props.history.push('/prescriptions/new');
  const handleEdit = id => () => props.history.push(`/prescriptions/${id}/edit`);
  const handleDelete = id => () => deletePrescription(id);

  const renderEdit = ({ id }) => (
    <Button p={0} fontSize="inherit" variant="textPrimary" onClick={handleEdit(id)}>{t('Edit')}</Button>
  );

  const renderDelete = ({ id }) => (
    <Button processing={deletingPrescription.prescriptionId === id && deletingPrescription.inProgress} p={0} fontSize="inherit" variant="textPrimary" onClick={handleDelete(id)}>{t('Delete')}</Button>
  );

  const renderName = ({ firstName, lastName, patientUserId }) => (
    <>
     {patientUserId
      ? <Button variant="textPrimary" onClick={() => props.history.push(`/patients/${patientUserId}/data`)}>{`${firstName} ${lastName}`}</Button>
      : `${firstName} ${lastName}`
     }
    </>
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
    };

    return <Text as="span" px={2} py={1} fontWeight="medium" sx={{ borderRadius: 4 }} color={stateColors.color} bg={stateColors.bg}>{state}</Text>;
  };

  const columns = [
    { title: t('Name'), field: 'patient', align: 'left', sortable: true, sortBy: 'firstName', render: renderName, searchable: true, searchBy: ['firstName', 'lastName'] },
    { title: t('MRN #'), field: 'mrn', align: 'left', searchable: true },
    { title: t('State'), field: 'state', render: renderState, align: 'left', sortable: true},
    { title: t('Edit'), field: 'edit', render: renderEdit, align: 'left' },
    { title: t('Delete'), field: 'delete', render: renderDelete, align: 'left' },
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

export default withPrescriptions(translate()(Prescriptions));
