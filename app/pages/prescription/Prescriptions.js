import React from 'react';
import { translate } from 'react-i18next';
import SearchIcon from '@material-ui/icons/Search';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import DeleteForeverRoundedIcon from '@material-ui/icons/DeleteForeverRounded';
import EditRoundedIcon from '@material-ui/icons/EditRounded';
import KeyboardArrowDownRoundedIcon from '@material-ui/icons/KeyboardArrowDownRounded';
import OpenInNewRoundedIcon from '@material-ui/icons/OpenInNewRounded';
import VisibilityRoundedIcon from '@material-ui/icons/VisibilityRounded';
import { Box, Flex } from 'rebass/styled-components';
import map from 'lodash/map';
import filter from 'lodash/filter';
import get from 'lodash/get';
import includes from 'lodash/includes';
import keyBy from 'lodash/keyBy';
import keys from 'lodash/keys';
import noop from 'lodash/noop';
import reduce from 'lodash/reduce';
import transform from 'lodash/transform';
import values from 'lodash/values';
import without from 'lodash/without';

import {
  bindPopover,
  bindTrigger,
  usePopupState,
} from 'material-ui-popup-state/hooks';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '../../components/elements/Dialog';

import Button from '../../components/elements/Button';
import Checkbox from '../../components/elements/Checkbox';
import Pill from '../../components/elements/Pill';
import Popover from '../../components/elements/Popover';
import PopoverMenu from '../../components/elements/PopoverMenu';
import Table from '../../components/elements/Table';
import TextInput from '../../components/elements/TextInput';
import { Body1, Headline, MediumTitle } from '../../components/elements/FontStyles';
import withPrescriptions from './withPrescriptions';
import withAssociatedAccounts from './withAssociatedAccounts';
import { dateRegex, prescriptionStateOptions } from './prescriptionFormConstants';
import { useToasts } from '../../providers/ToastProvider';
import { useIsFirstRender } from '../../core/hooks';

const Prescriptions = props => {
  const {
    t,
    deletePrescription,
    deletingPrescription,
    history,
    prescriptions = [],
    membershipPermissionsInOtherCareTeams = {},
  } = props;

  const isFirstRender = useIsFirstRender();
  const { set: setToast } = useToasts();
  const prescriptionStates = keyBy(prescriptionStateOptions, 'value');

  const popupFilterState = usePopupState({
    variant: 'popover',
    popupId: 'filterState',
  });

  const initialDeleteDialogState = {
    closeParentPopover: noop,
    open: false,
    prescription: {},
  };

  const [deleteDialog, setDeleteDialog] = React.useState(initialDeleteDialogState);

  function closeDeleteDialog() {
    setDeleteDialog({
      ...deleteDialog,
      open: false,
    });

    // We fully reset the dialog after it's had time to close, so that we don't see the patient name
    // in the delete dialog disappear before it closes.
    setTimeout(() => setDeleteDialog(initialDeleteDialogState), 100);
  }

  const [searchText, setSearchText] = React.useState('');
  const [filterStateActive, setFilterStateActive] = React.useState(false);

  const [activeStates, setActiveStates] = React.useState(reduce(prescriptionStateOptions, (result, { value }) => {
    result[value] = true;
    return result;
  }, {}));

  const activeStatesCount = without(values(activeStates), false).length;

  const [pendingActiveStates, setPendingActiveStates] = React.useState(activeStates);
  const togglePendingActiveState = (value) => setPendingActiveStates({ ...pendingActiveStates, [value]: !pendingActiveStates[value] })

  const data = filter(
    map(prescriptions, prescription => ({
      birthday: get(prescription, 'latestRevision.attributes.birthday', '').replace(dateRegex, '$2/$3/$1'),
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

  function clearSearchText() {
    setSearchText('');
  }

  const handleAddNew = () => props.history.push('/prescriptions/new');

  const handleOpenPrescription = prescription => popupState => {
    props.history.push(`/prescriptions/${prescription.id}`);
  };

  const handleDeletePrescription = prescription => popupState => {
    setDeleteDialog({
      closeParentPopover: popupState.close,
      open: true,
      prescription,
    });
  }

  function handleRowClick(prescription) {
    return handleOpenPrescription(prescription)();
  }

  const actionMenuItems = prescription => {
    const isEditable = includes(['draft', 'pending'], prescription.state);

    const items = [
      {
        icon: isEditable ? EditRoundedIcon : VisibilityRoundedIcon,
        iconLabel: isEditable ? t('Update') : t('View'),
        iconPosition: 'left',
        id: isEditable ? 'update' : 'view',
        onClick: handleOpenPrescription(prescription),
        text: isEditable ? t('Update prescription') : t('View Prescription'),
        variant: 'actionListItem',
      },
    ];

    if (isEditable) items.push({
      icon: DeleteForeverRoundedIcon,
      iconLabel: 'Delete',
      iconPosition: 'left',
      id: 'delete',
      onClick: handleDeletePrescription(prescription),
      text: 'Delete prescription',
      variant: 'actionListItemDanger',
      disabled: !isEditable,
    });

    return items;
  };

  const renderMore = (prescription) => (
    <Box onClick={e => {
      // Prevent clicks from propogating up to the table row click handlers
      e.stopPropagation();
    }}>
      <PopoverMenu
        id="more-prescription-actions"
        label="More actions"
        items={actionMenuItems(prescription)}
      />
    </Box>
  );

  const openPatientData = (patientUserId) => {
    const href = history.createHref({
      pathname: `/patients/${patientUserId}/data`,
    });

    window.open(href, '_blank');
  }

  const patientNameFromPrescription = ({ firstName = '', lastName = '' }) => [firstName, lastName].join(' ');

  const renderName = prescription => (
    <React.Fragment>
      {prescription.patientUserId && get(membershipPermissionsInOtherCareTeams, [prescription.patientUserId, 'view']) ? <Button
        p={0}
        m={0}
        color="text.link"
        fontSize={1}
        icon={OpenInNewRoundedIcon}
        iconLabel="Open patient data in new tab"
        variant="textPrimary"
        onClick={(e) => {
          // Prevent clicks from propogating up to the table row click handlers
          e.stopPropagation();
          openPatientData(prescription.patientUserId);
        }}
      >
        {patientNameFromPrescription(prescription)}
      </Button> : patientNameFromPrescription(prescription)
     }
    </React.Fragment>
  );

  const renderState = ({ state }) => {
    const label = get(prescriptionStates, [state, 'label'], '');
    const colorPalette = get(prescriptionStates, [state, 'colorPalette'])
    return <Pill label="prescription status" colorPalette={colorPalette} text={label} />
  }

  const columns = [
    { title: t('Name'), field: 'patient', align: 'left', sortable: true, sortBy: 'firstName', render: renderName, searchable: true, searchBy: ['firstName', 'lastName'] },
    { title: t('MRN'), field: 'mrn', align: 'left', sortable: true, searchable: true },
    { title: t('Date of birth'), field: 'birthday', align: 'left', sortable: true, searchable: true },
    { title: t('Status'), field: 'state', render: renderState, align: 'left', sortable: true },
    { title: '', field: 'more', render: renderMore, align: 'left' },
  ];

  // Handle successful or failed deletion attempts
  React.useEffect(() => {
    const { inProgress, completed, notification } = deletingPrescription;

    if (!isFirstRender && !inProgress) {
      if (completed) {
        if (deleteDialog.open) {
          deleteDialog.closeParentPopover();
          closeDeleteDialog();
        }

        setToast({
          message: t('You have successfully {{messageAction}} a Tidepool Loop prescription.', { messageAction: 'deleted' }),
          variant: 'success',
        });
      }

      if (completed === false) {
        setToast({
          message: get(notification, 'message'),
          variant: 'danger',
        });
      }
    }
  }, [deletingPrescription]);

  // Render
  return (
    <Box mx={3} mb={5} px={4} py={4} bg='white'>
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
              iconLabel="Filter by status"
              mr={2}
              fontSize={1}
            >
              {t('Status{{count}}', {
                count: activeStatesCount < keys(prescriptionStates).length ? ` (${activeStatesCount})` : '',
              })}
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
                  fontSize={1}
                  variant="textSecondary"
                  onClick={() => {
                    const active = without(values(pendingActiveStates), false).length < keys(prescriptionStates).length;

                    setPendingActiveStates(transform(pendingActiveStates, function(result, value, key) {
                      result[key] = active;
                    }, {}));
                  }}
                >
                  {(without(values(pendingActiveStates), false).length < keys(prescriptionStates).length) ? t('Select All') : t('Deselect All')}
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
              icon={searchText ? CloseRoundedIcon : SearchIcon}
              iconLabel="search"
              onClickIcon={searchText ? clearSearchText : null}
              name="search-prescriptions"
              onChange={handleSearchChange}
              value={searchText}
              variant="condensed"
            />
          </Flex>
        </Box>
      </Flex>
      <Table
        fontSize={1}
        label="Prescription List"
        id="prescriptions-table"
        data={data}
        columns={columns}
        rowsPerPage={10}
        searchText={searchText}
        onClickRow={handleRowClick}
        orderBy="createdTime"
        order="desc"
        pagination
      />
      <Dialog
        id={'prescription-delete'}
        aria-labelledby="dialog-title"
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
      >
        <DialogTitle onClose={closeDeleteDialog}>
          <MediumTitle mr={2} id="dialog-title">Delete Prescription for {patientNameFromPrescription(deleteDialog.prescription)}</MediumTitle>
        </DialogTitle>
        <DialogContent>
          <Body1>
            Are you sure you want to delete this prescription?
          </Body1>
        </DialogContent>
        <DialogActions>
          <Button variant="secondary" onClick={closeDeleteDialog}>
            Cancel
          </Button>
          <Button
            variant="danger"
            processing={deletingPrescription.inProgress}
            onClick={() => deletePrescription(deleteDialog.prescription.id)}
          >
            Delete Prescription
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default withPrescriptions(withAssociatedAccounts(translate()(Prescriptions)));
