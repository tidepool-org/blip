import React from 'react';
import { translate } from 'react-i18next';
import SearchIcon from '@material-ui/icons/Search';
import KeyboardArrowDownRoundedIcon from '@material-ui/icons/KeyboardArrowDownRounded';
import MoreHorizRoundedIcon from '@material-ui/icons/MoreHorizRounded';
import OpenInNewRoundedIcon from '@material-ui/icons/OpenInNewRounded';
import { Box, Flex, Text } from 'rebass/styled-components';
import map from 'lodash/map';
import filter from 'lodash/filter';
import get from 'lodash/get';
import includes from 'lodash/includes';
import keyBy from 'lodash/keyBy';
import reduce from 'lodash/reduce';
import transform from 'lodash/transform';
import values from 'lodash/values';

import {
  bindPopover,
  bindTrigger,
  usePopupState,
} from 'material-ui-popup-state/hooks';

import Table from '../../components/elements/Table';
import Button from '../../components/elements/Button';
import Checkbox from '../../components/elements/Checkbox';
import { DialogContent, DialogActions } from '../../components/elements/Dialog';
import Icon from '../../components/elements/Icon';
import Popover from '../../components/elements/Popover';
import TextInput from '../../components/elements/TextInput';
import { Headline } from '../../components/elements/FontStyles';
import withPrescriptions from './withPrescriptions';
import { dateRegex, prescriptionStateOptions } from './prescriptionFormConstants';

const Prescriptions = props => {
  const {
    t,
    deletePrescription,
    deletingPrescription,
    history,
    prescriptions = [],
  } = props;


  console.log('props', props);
  console.log('prescriptions', prescriptions);

  const prescriptionStates = keyBy(prescriptionStateOptions, 'value');

  const [searchText, setSearchText] = React.useState();

  const [activeStates, setActiveStates] = React.useState(reduce(prescriptionStateOptions, (result, { value }) => {
    result[value] = true;
    return result;
  }, {}));

  const [pendingActiveStates, setPendingActiveStates] = React.useState(activeStates);
  const togglePendingActiveState = (value) => setPendingActiveStates({ ...pendingActiveStates, [value]: !pendingActiveStates[value] })

  const data = filter(
    map(prescriptions, prescription => ({
      birthday: get(prescription, 'latestRevision.attributes.birthday').replace(dateRegex, '$2/$3/$1'),
      createdTime: get(prescription, 'latestRevision.attributes.createdTime'),
      firstName: get(prescription, 'latestRevision.attributes.firstName'),
      id: get(prescription, 'id'),
      lastName: get(prescription, 'latestRevision.attributes.lastName'),
      mrn: get(prescription, 'latestRevision.attributes.mrn'),
      patientUserId: get(prescription, 'patientUserId'),
      state: get(prescription, 'state'),
    })),
    prescription => activeStates[prescription.state]
  );

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

  const renderMore = ({ firstName }) => (
    <Icon variant="button" icon={MoreHorizRoundedIcon} label="More actions" onClick={() => console.log(`"More actions" called for ${firstName}`)} />
  );

  const openPatientData = (patientUserId) => {
    const href = history.createHref({
      pathname: `/patients/${patientUserId}/data`,
    });

    window.open(href, '_blank');
  }

  const renderName = ({ firstName, lastName, patientUserId }) => (
    <>
     {patientUserId ? <Button
        p={0}
        m={0}
        color="text.primary"
        fontSize={0}
        icon={OpenInNewRoundedIcon}
        iconLabel="Open patient data in new tab"
        variant="textPrimary"
        onClick={() => openPatientData(patientUserId)}>{`${firstName} ${lastName}`}
      </Button> : `${firstName} ${lastName}`
     }
    </>
  );
  const renderState = ({ state }) => get(prescriptionStates, [state, 'label'], '');

  const columns = [
    { title: t('Name'), field: 'patient', align: 'left', sortable: true, sortBy: 'firstName', render: renderName, searchable: true, searchBy: ['firstName', 'lastName'] },
    { title: t('MRN'), field: 'mrn', align: 'left', sortable: true, searchable: true },
    { title: t('Date of birth'), field: 'birthday', align: 'left', sortable: true, searchable: true },
    { title: t('Status'), field: 'state', render: renderState, align: 'left', sortable: true },
    { title: '', field: 'more', render: renderMore, align: 'left' },
    // { title: t('Edit'), field: 'edit', render: renderEdit, align: 'left' },
    // { title: t('Delete'), field: 'delete', render: renderDelete, align: 'left' },
  ];

  const popupFilterState = usePopupState({
    variant: 'popover',
    popupId: 'filterState',
  });

  const [filterStateActive, setFilterStateActive] = React.useState(false);

  return (
    <Box mx={3} my={2} px={2} py={4} bg='white'>
      <Flex my={3} justifyContent="space-between">
        <Box alignSelf="flex-end">
          <Flex>
            <Headline mr={3}>{t('Prescriptions')}</Headline>
            <Button variant="primary" onClick={handleAddNew}>{t('Add New')}</Button>
          </Flex>
        </Box>
        <Box>
          <Flex>
            <Button
              variant="filter"
              active={filterStateActive}
              {...bindTrigger(popupFilterState)}
              icon={KeyboardArrowDownRoundedIcon}
              iconLabel="Filter By Status"
            >
              {t('Filter By Status')}
            </Button>

            <Popover width="15em" {...bindPopover(popupFilterState)}>
              <DialogContent px={2} py={3} dividers>
                {map(prescriptionStateOptions, ({label, value}) => (
                  <Checkbox
                    checked={pendingActiveStates[value]}
                    key={`filter-${value}`}
                    name={`filter-${value}`}
                    label={label}
                    onChange={() => togglePendingActiveState(value)}
                  />
                ))}
              </DialogContent>
              <DialogActions justifyContent="space-between" p={1}>
                <Button
                  fontSize={0}
                  variant="textSecondary"
                  onClick={() => {
                    setPendingActiveStates(transform(pendingActiveStates, function(result, value, key) {
                      result[key] = true;
                    }, {}));
                  }}
                >
                  {(filter(values(pendingActiveStates), true).length === 0) ? t('Select All') : t('Deselect All')}
                </Button>
                <Button fontSize={0} variant="textPrimary" onClick={() => {
                  setActiveStates(pendingActiveStates);
                  setFilterStateActive(includes(values(pendingActiveStates), false));
                  popupFilterState.close();
                }}>
                  {t('Apply')}
                </Button>
              </DialogActions>
            </Popover>

            <TextInput
              themeProps={{
                width: 'auto',
                minWidth: '250px',
              }}
              placeholder={t('Search Entries')}
              icon={SearchIcon}
              label={t('Search Prescriptions')}
              name="search-prescriptions"
              onChange={handleSearchChange}
              variant="condensed"
            />
          </Flex>
        </Box>
      </Flex>
      <Table
        label="Sample clinician list"
        id="prescriptions-table"
        data={data}
        columns={columns}
        rowsPerPage={10}
        searchText={searchText}
        orderBy="createdTime"
        order="desc"
        pagination
      />
    </Box>
  );
};

export default withPrescriptions(translate()(Prescriptions));
