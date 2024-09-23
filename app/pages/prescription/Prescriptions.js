import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import SearchIcon from '@material-ui/icons/Search';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import DeleteForeverRoundedIcon from '@material-ui/icons/DeleteForeverRounded';
import EditRoundedIcon from '@material-ui/icons/EditRounded';
import KeyboardArrowDownRoundedIcon from '@material-ui/icons/KeyboardArrowDownRounded';
import OpenInNewRoundedIcon from '@material-ui/icons/OpenInNewRounded';
import VisibilityRoundedIcon from '@material-ui/icons/VisibilityRounded';
import FileCopyRoundedIcon from '@material-ui/icons/FileCopyRounded';
import { Box, Flex, Text } from 'theme-ui';
import map from 'lodash/map';
import filter from 'lodash/filter';
import forEach from 'lodash/forEach';
import get from 'lodash/get';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import keyBy from 'lodash/keyBy';
import keys from 'lodash/keys';
import reduce from 'lodash/reduce';
import transform from 'lodash/transform';
import values from 'lodash/values';
import without from 'lodash/without';
import { useFlags, useLDClient } from 'launchdarkly-react-client-sdk';
import { components as vizComponents } from '@tidepool/viz';

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

const { ClipboardButton } = vizComponents;
import Button from '../../components/elements/Button';
import Icon from '../../components/elements/Icon';
import Checkbox from '../../components/elements/Checkbox';
import Pill from '../../components/elements/Pill';
import Popover from '../../components/elements/Popover';
import PopoverMenu from '../../components/elements/PopoverMenu';
import Table from '../../components/elements/Table';
import Pagination from '../../components/elements/Pagination';
import TextInput from '../../components/elements/TextInput';
import { Body1, MediumTitle } from '../../components/elements/FontStyles';
import { dateRegex, prescriptionStateOptions } from './prescriptionFormConstants';
import { useToasts } from '../../providers/ToastProvider';
import { useIsFirstRender } from '../../core/hooks';
import FilterIcon from '../../core/icons/FilterIcon.svg';
import * as actions from '../../redux/actions';
import { borders } from '../../themes/baseTheme';

const Prescriptions = props => {
  const { t, history, location, api, trackMetric } = props;
  const dispatch = useDispatch();
  const membershipPermissionsInOtherCareTeams = useSelector((state) => state.blip.membershipPermissionsInOtherCareTeams);
  const prescriptions = useSelector((state) => state.blip.prescriptions);
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const { showPrescriptions } = useFlags();
  const ldClient = useLDClient();
  const ldContext = ldClient.getContext();
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState();
  const rowsPerPage = 10;

  const {
    deletingPrescription,
    fetchingAssociatedAccounts,
    fetchingClinicPrescriptions,
  } = useSelector((state) => state.blip.working);

  useEffect(() => {
    // Redirect to the base workspace if the LD clinic context is set and showPrescriptions flag is false
    // and the clinic does not have the prescriptions entitlement
    if ((clinic?.entitlements && !clinic.entitlements.prescriptions) && (ldContext?.clinic?.tier && !showPrescriptions)) dispatch(push('/clinic-workspace/patients'));
  }, [ldContext, showPrescriptions, selectedClinicId, clinic?.entitlements, dispatch]);

  // Fetchers
  useEffect(() => {
    if (loggedInUserId && selectedClinicId) {
      forEach([
        {
          workingState: fetchingAssociatedAccounts,
          action: actions.async.fetchAssociatedAccounts.bind(null, api),
        },
        {
          workingState: fetchingClinicPrescriptions,
          action: actions.async.fetchClinicPrescriptions.bind(null, api, selectedClinicId),
        },
      ], ({ workingState, action }) => {
        if (
          !workingState.inProgress &&
          (!workingState.completed || location?.state?.reloadPrescriptions) &&
          !workingState.notification
        ) {
          dispatch(action());
        }
      });
    }
  }, [loggedInUserId, selectedClinicId]);

  const isFirstRender = useIsFirstRender();
  const { set: setToast } = useToasts();
  const prescriptionStates = keyBy(prescriptionStateOptions, 'value');

  const popupFilterState = usePopupState({
    variant: 'popover',
    popupId: 'filterState',
  });

  const initialDeleteDialogState = {
    open: false,
    prescription: {},
  };

  const [deleteDialog, setDeleteDialog] = useState(initialDeleteDialogState);

  function closeDeleteDialog() {
    setDeleteDialog({
      ...deleteDialog,
      open: false,
    });

    // We fully reset the dialog after it's had time to close, so that we don't see the patient name
    // in the delete dialog disappear before it closes.
    setTimeout(() => setDeleteDialog(initialDeleteDialogState), 100);
  }

  const [searchText, setSearchText] = useState('');
  const [filterStateActive, setFilterStateActive] = useState(false);

  const [activeStates, setActiveStates] = useState(reduce(prescriptionStateOptions, (result, { value }) => {
    result[value] = true;
    return result;
  }, {}));

  const activeStatesCount = without(values(activeStates), false).length;

  const [pendingActiveStates, setPendingActiveStates] = useState(activeStates);
  const togglePendingActiveState = (value) => setPendingActiveStates({ ...pendingActiveStates, [value]: !pendingActiveStates[value] })

  const data = filter(
    map(filter(prescriptions, { clinicId: selectedClinicId }), prescription => ({
      accessCode: get(prescription, 'accessCode'),
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

  const handlePageChange = (event, newValue) => {
    setPage(newValue);
  };

  useEffect(() => {
    setPageCount(Math.ceil(data.length / rowsPerPage));
  }, [data]);

  function handleSearchChange(event) {
    setSearchText(event.target.value);
  }

  function handleClearSearch() {
    setSearchText('');
  }

  const handleAddNew = () => dispatch(push('/prescriptions/new'));

  const handleOpenPrescription = prescription => popupState => {
    dispatch(push(`/prescriptions/${prescription.id}`));
  };

  const handleDeletePrescription = prescription => popupState => {
    trackMetric('Clinic - Delete prescription', { clinicId: selectedClinicId });
    popupState.close();
    setDeleteDialog({
      open: true,
      prescription,
    });
  }

  function handleConfirmDeletePrescription(invite) {
    trackMetric('Clinic - Delete prescription confirmed', { clinicId: selectedClinicId });
    dispatch(actions.async.deletePrescription(api, selectedClinicId, deleteDialog.prescription.id));
  }

  function handleRowClick(prescription) {
    return handleOpenPrescription(prescription)();
  }

  const actionMenuItems = prescription => {
    const isEditable = includes(['draft', 'pending'], prescription.state);

    const items = [
      {
        icon: isEditable ? EditRoundedIcon : VisibilityRoundedIcon,
        iconLabel: isEditable ? t('Update Tidepool Loop Start Order') : t('View Tidepool Loop Start Order'),
        iconPosition: 'left',
        id: isEditable ? 'update' : 'view',
        onClick: handleOpenPrescription(prescription),
        text: isEditable ? t('Update Tidepool Loop Start Order') : t('View Tidepool Loop Start Order'),
        variant: 'actionListItem',
      },
    ];

    if (isEditable) items.push({
      icon: DeleteForeverRoundedIcon,
      iconLabel: 'Delete Tidepool Loop Start Order',
      iconPosition: 'left',
      id: 'delete',
      onClick: handleDeletePrescription(prescription),
      text: t('Delete Tidepool Loop Start Order'),
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
        sx={{ color: 'text.link', fontSize: 1 }}
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

  const copyCodeButtonText = useMemo(() =>
    <Icon
      variant="static"
      icon={FileCopyRoundedIcon}
      label={t('Copy Activation Code')}
      title={t('Copy Activation Code')}
    />, [t]
  );

  const copyCodeButtonSuccessText = useMemo(() => <span className="success">{t('✓')}</span>, [t]);

  const copyCodeButtonOnClick = useCallback(() => {
    trackMetric('Clinic - Copy prescription activation code', {
      clinicId: selectedClinicId,
    });
  }, [selectedClinicId]);


  const renderAccessCode = ({ accessCode, state }) => {
    return state !== 'submitted' ? '' : (
      <Flex
        onClick={e => {
          // Prevent clicks from propogating up to the table row click handlers
          e.stopPropagation();
        }}
        sx={{
          columnGap: 2,
          alignItems: 'flex-start',
          button: {
            border: 'none',
            color: 'text.primary',
            top: '1px',
            p: 0,
            m: 0,
            position: 'relative',
            '&:hover,&:active': {
              border: 'none',
              color: 'text.primary',
              backgroundColor: 'transparent',
            },
          },
          '.success': {
            position: 'relative',
            display: 'block',
            top: '2px',
          },
        }}
      >
        <Text as="span" sx={{ whiteSpace: 'nowrap', fontWeight: 'medium' }}>{accessCode}</Text>
        <ClipboardButton
          buttonTitle={t('Copy Activation Code')}
          buttonText={copyCodeButtonText}
          successText={(copyCodeButtonSuccessText)}
          onClick={copyCodeButtonOnClick}
          getText={() => accessCode}
        />
      </Flex>
    );
  }

  const columns = [
    { title: t('Name'), field: 'patient', align: 'left', sortable: true, sortBy: 'firstName', render: renderName, searchable: true, searchBy: ['firstName', 'lastName'] },
    { title: t('MRN'), field: 'mrn', align: 'left', sortable: true, searchable: true },
    { title: t('Date of birth'), field: 'birthday', align: 'left', sortable: true, searchable: true },
    { title: t('Status'), field: 'state', render: renderState, align: 'left', sortable: true },
    { title: t('Activation Code'), field: 'accessCode', render: renderAccessCode, align: 'left', sortable: false },
    { title: '', field: 'more', render: renderMore, align: 'right', className: 'action-menu' },
  ];

  // Handle successful or failed deletion attempts
  useEffect(() => {
    const { inProgress, completed, notification } = deletingPrescription;

    if (!isFirstRender && !inProgress) {
      if (completed) {
        if (deleteDialog.open) {
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
    <>
      <Flex sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3 }}>
        {/* Flex Group 1: Search Box and Add Prescription button */}
        <Flex
          width={['100%', null, 'auto']}
          sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2 }}
        >
          <Button
            id="add-prescription"
            variant="primary"
            onClick={handleAddNew}
            px={[2, 3]}
            sx={{ fontSize: 1, lineHeight: ['inherit', null, 1] }}
          >
            {t('Create New Tidepool Loop Start Order')}
          </Button>

          <Box sx={{ flex: 1, position: ['static', null, 'absolute'], top: '8px', right: 4 }}>
            <TextInput
              themeProps={{
                sx: {
                  width: ['100%', null, '250px'],
                },
              }}
              fontSize="12px"
              id="search-prescriptions"
              placeholder={t('Search Entries')}
              icon={!isEmpty(searchText) ? CloseRoundedIcon : SearchIcon}
              iconLabel={t('Search')}
              onClickIcon={!isEmpty(searchText) ? handleClearSearch : null}
              name="search-prescriptions"
              onChange={handleSearchChange}
              value={searchText}
              variant="condensed"
            />
          </Box>
        </Flex>

        {/* Flex Group 2: Filters */}
        <Flex
          pt={0}
          sx={{ gap: 3, alignItems: 'center', flexGrow: 1, flexWrap: 'wrap' }}
        >
          {/* Flex Group 2a: Status Filters */}
          <Flex sx={{ gap: 2, alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
            <Flex
              color={keys(prescriptionStates).length > activeStatesCount > 0 ? 'purpleMedium' : 'grays.4'}
              pl={2}
              py={1}
              sx={{ alignItems: 'center', gap: 1, borderLeft: ['none', null, borders.divider] }}
            >
              {keys(prescriptionStates).length > activeStatesCount > 0  ? (
                <Pill
                  id="filter-count"
                  label="filter count"
                  round
                  width="14px"
                  lineHeight="15px"
                  fontSize="9px"
                  colorPalette={['purpleMedium', 'white']}
                  text={`${activeStatesCount}`}
                />
              ) : (
                <Icon
                  id="filter-icon"
                  variant="static"
                  iconSrc={FilterIcon}
                  label={t('Filter')}
                  fontSize={1}
                  width="14px"
                  color={'grays.4'}
                />
              )}
              <Text fontSize={0}>{t('Filter By')}</Text>
            </Flex>
            <Box>
              <Flex>
                <Button
                  variant="filter"
                  active={filterStateActive}
                  {...bindTrigger(popupFilterState)}
                  icon={KeyboardArrowDownRoundedIcon}
                  iconLabel="Filter by status"
                  ml={2}
                  sx={{ fontSize: 1 }}
                >
                  {t('Status{{count}}', {
                    count: activeStatesCount < keys(prescriptionStates).length ? ` (${activeStatesCount})` : '',
                  })}
                </Button>

                <Popover width="15em" {...bindPopover(popupFilterState)}>
                  <DialogContent px={2} py={3} dividers>
                    {map(prescriptionStateOptions, ({label, value}) => (
                      <Box>
                        <Checkbox
                          checked={pendingActiveStates[value]}
                          key={`filter-${value}`}
                          name={`filter-${value}`}
                          label={label}
                          onChange={() => togglePendingActiveState(value)}
                        />
                      </Box>
                    ))}
                  </DialogContent>

                  <DialogActions sx={{ justifyContent: 'space-between' }} p={1}>
                    <Button
                      sx={{ fontSize: 1 }}
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

                    <Button sx={{ fontSize: 0 }} variant="textPrimary" onClick={() => {
                      setActiveStates(pendingActiveStates);
                      setFilterStateActive(includes(values(pendingActiveStates), false));
                      popupFilterState.close();
                    }}>
                      {t('Apply')}
                    </Button>
                  </DialogActions>
                </Popover>
              </Flex>
            </Box>
          </Flex>
        </Flex>

        <Table
          sx={{ fontSize: 1 }}
          label="Prescription List"
          id="prescriptions-table"
          data={data}
          columns={columns}
          rowsPerPage={rowsPerPage}
          page={page}
          searchText={searchText}
          emptyText={t('There are no prescriptions to show.')}
          onClickRow={handleRowClick}
          orderBy="createdTime"
          order="desc"
        />

        {data.length > rowsPerPage && (
          <Pagination
            px="5%"
            sx={{ width: '100%', position: 'absolute', bottom: '-50px' }}
            id="prescriptions-pagination"
            count={pageCount}
            page={page}
            disabled={pageCount < 2}
            onChange={handlePageChange}
            showFirstButton={false}
            showLastButton={false}
          />
        )}

        <Dialog
          id="prescription-delete"
          aria-labelledby="dialog-title"
          open={deleteDialog.open}
          onClose={closeDeleteDialog}
        >
          <DialogTitle onClose={closeDeleteDialog}>
            <MediumTitle mr={2} id="dialog-title">Delete Tidepool Loop Start Order for {patientNameFromPrescription(deleteDialog.prescription)}</MediumTitle>
          </DialogTitle>

          <DialogContent>
            <Body1>
              Are you sure you want to delete this Tidepool Loop start order?
            </Body1>
          </DialogContent>

          <DialogActions>
            <Button variant="secondary" onClick={closeDeleteDialog}>
              Cancel
            </Button>

            <Button
              id="prescription-delete-confirm"
              variant="danger"
              processing={deletingPrescription.inProgress}
              onClick={handleConfirmDeletePrescription}
            >
              Delete Tidepool Loop Start Order
            </Button>
          </DialogActions>
        </Dialog>
      </Flex>
    </>
  );
};

export default withTranslation()(Prescriptions);
