import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { translate, Trans } from 'react-i18next';
import { push } from 'connected-react-router';
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import map from 'lodash/map';
import includes from 'lodash/includes';
import filter from 'lodash/filter';
import find from 'lodash/find';
import has from 'lodash/has';
import { Box, Flex, Text } from 'rebass/styled-components';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import EditIcon from '@material-ui/icons/EditRounded';
import InputIcon from '@material-ui/icons/Input';
import SearchIcon from '@material-ui/icons/Search';
import sundial from 'sundial';

import {
  Title,
  MediumTitle,
  Body1,
} from '../../components/elements/FontStyles';

import TextInput from '../../components/elements/TextInput';
import Button from '../../components/elements/Button';
import Table from '../../components/elements/Table';
import Pagination from '../../components/elements/Pagination';
import PopoverMenu from '../../components/elements/PopoverMenu';
import Pill from '../../components/elements/Pill';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '../../components/elements/Dialog';

import ClinicProfile from '../../components/clinic/ClinicProfile';
import { useToasts } from '../../providers/ToastProvider';
import baseTheme from '../../themes/baseTheme';
import * as actions from '../../redux/actions';
import { usePrevious } from '../../core/hooks';
import config from '../../config';

export const ClinicAdmin = (props) => {
  const { t, api, trackMetric } = props;
  const dispatch = useDispatch();
  const { set: setToast } = useToasts();
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showResendInviteDialog, setShowResendInviteDialog] = useState(false);
  const [showRevokeInviteDialog, setShowRevokeInviteDialog] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState(null);
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const clinics = useSelector((state) => state.blip.clinics);
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const working = useSelector((state) => state.blip.working);
  const previousWorking = usePrevious(working);
  const fetchingCliniciansFromClinic = working.fetchingCliniciansFromClinic;
  const clinic = get(clinics, selectedClinicId);
  const pendingSentClinicianInvites = useSelector((state) => state.blip.pendingSentClinicianInvites);
  const timePrefs = useSelector((state) => state.blip.timePrefs);
  const [clinicianArray, setClinicianArray] = useState([]);
  const [userRolesInClinic, setUserRolesInClinic] = useState([]);
  const rowsPerPage = 8;

  const isClinicAdmin = () => includes(userRolesInClinic, 'CLINIC_ADMIN');
  const isOnlyClinicAdmin = () => filter(clinicianArray, { isAdmin: true, inviteId: undefined }).length === 1;

  useEffect(() => {
    const {
      inProgress,
      completed,
      notification,
    } = working.resendingClinicianInvite;
    const prevInProgress = get(
      previousWorking,
      'resendingClinicianInvite.inProgress'
    );
    if (!inProgress && prevInProgress) {
      if (completed) {
        setToast({
          message: t('Clinician invite resent to {{email}}.', { email: selectedInvite?.email }),
          variant: 'success',
        });
      }
      if (notification) {
        setToast({
          message: notification.message,
          variant: 'danger',
        });
      }
      closeResendInviteDialog();
    }
  }, [working.resendingClinicianInvite]);

  useEffect(() => {
    const {
      inProgress,
      completed,
      notification,
    } = working.deletingClinicianInvite;
    const prevInProgress = get(
      previousWorking,
      'deletingClinicianInvite.inProgress'
    );
    if (!inProgress && prevInProgress) {
      if (completed) {
        setToast({
          message: t('Clinician invite to {{email}} has been revoked.', {
            email: selectedInvite?.email,
          }),
          variant: 'success',
        });
      }
      if (notification) {
        setToast({
          message: notification.message,
          variant: 'danger',
        });
      }
      closeRevokeInviteDialog();
    }
  }, [working.deletingClinicianInvite]);

  useEffect(() => {
    const {
      inProgress,
      completed,
      notification,
    } = working.deletingClinicianFromClinic;
    const prevInProgress = get(
      previousWorking,
      'deletingClinicianFromClinic.inProgress'
    );
    if (!inProgress && prevInProgress) {
      if (completed) {
        setToast({
          message: t('Clinician removed from clinic.'),
          variant: 'success',
        });
      }
      if (notification) {
        setToast({
          message: notification.message,
          variant: 'danger',
        });
      }
    }
  }, [working.deletingClinicianFromClinic]);

  useEffect(() => {
    const { inProgress, notification } = working.fetchingClinicianInvite;
    const prevInProgress = get(
      previousWorking,
      'fetchingClinicianInvite.inProgress'
    );
    if (!inProgress && prevInProgress) {
      if (notification) {
        setToast({
          message: notification.message,
          variant: 'danger',
        });
      }
    }
  }, [working.fetchingClinicianInvite]);

  useEffect(() => {
    const { inProgress, notification } = working.fetchingCliniciansFromClinic;
    const prevInProgress = get(
      previousWorking,
      'fetchingCliniciansFromClinic.inProgress'
    );
    if (!inProgress && prevInProgress) {
      if (notification) {
        setToast({
          message: notification.message,
          variant: 'danger',
        });
      }
    }
  }, [working.fetchingCliniciansFromClinic]);

  useEffect(() => {
    if (
      loggedInUserId &&
      clinic?.id &&
      !fetchingCliniciansFromClinic.inProgress
    ) {
      dispatch(actions.async.fetchCliniciansFromClinic(api, clinic.id, { limit: 1000, offset: 0 }));
    }
  }, [loggedInUserId, clinic?.id]);

  const getClinicianArray = () => map(
    get(clinics, [selectedClinicId, 'clinicians'], {}),
    (clinician) => {
      const { roles, email, id: clinicianId, inviteId, name = '' } = clinician;
      let role = '';

      if (includes(roles, 'CLINIC_ADMIN')) {
        role = t('Clinic Admin');
      } else if (includes(roles, 'CLINIC_MEMBER')) {
        role = t('Clinic Member');
      }

      return {
        fullName: name,
        fullNameOrderable: name.toLowerCase(),
        role,
        prescriberPermission: includes(roles, 'PRESCRIBER'),
        isAdmin: includes(roles, 'CLINIC_ADMIN'),
        userId: clinicianId,
        inviteId,
        status: inviteId ? t('invite sent') : '',
        email,
        roles,
      };
    }
  );

  useEffect(() => {
    setClinicianArray(getClinicianArray());
    setUserRolesInClinic()
  }, [clinic]);

  useEffect(() => {
    setUserRolesInClinic(get(find(clinicianArray, { userId: loggedInUserId }), 'roles', []));
    setPageCount(Math.ceil(clinicianArray.length / rowsPerPage));
  }, [clinicianArray]);


  function closeDeleteDialog() {
    setShowDeleteDialog(false);
  }

  function clearSelectedUser() {
    setSelectedUser(null);
  }

  function closeResendInviteDialog() {
    setShowResendInviteDialog(false);
  }

  function closeRevokeInviteDialog() {
    setShowRevokeInviteDialog(false);
  }

  function clearSelectedInvite() {
    setSelectedInvite(null);
  }

  function handleInviteNewMember() {
    trackMetric('Clinic - Invite new clinic team member', { clinicId: selectedClinicId });
    dispatch(push('/clinic-invite', { clinicId: selectedClinicId }));
  }

  function handleEdit(userId) {
    trackMetric('Clinic - Edit clinic team member', { clinicId: selectedClinicId });

    dispatch(
      push('/clinician-edit', {
        clinicianId: userId,
        clinicId: selectedClinicId,
      })
    );
  }

  function handleDelete(selectedClinician) {
    trackMetric('Clinic - Remove clinic team member', { clinicId: selectedClinicId });
    setSelectedUser(selectedClinician);
    setShowDeleteDialog(true);
  }

  function handleConfirmDelete(selectedClinicianId) {
    trackMetric('Clinic - Remove clinic team member confirmed', { clinicId: selectedClinicId });

    dispatch(
      actions.async.deleteClinicianFromClinic(
        api,
        selectedClinicId,
        selectedClinicianId
      )
    );
  }

  function handleResendInvite(invite) {
    trackMetric('Clinic - Resend clinic team invite', { clinicId: selectedClinicId });
    setSelectedInvite(invite);

    if(!has(pendingSentClinicianInvites, invite.inviteId)){
      dispatch(
        actions.async.fetchClinicianInvite(
          api,
          selectedClinicId,
          invite.inviteId
        )
      );
    }

    setShowResendInviteDialog(true);
  }

  function handleConfirmResendInvite(inviteId) {
    trackMetric('Clinic - Resend clinic team invite confirmed', { clinicId: selectedClinicId });
    dispatch(actions.async.resendClinicianInvite(api, selectedClinicId, inviteId));
  }

  function handleRevokeInvite(invite) {
    trackMetric('Clinic - Remove clinic team invite', { clinicId: selectedClinicId });
    setSelectedInvite(invite);
    setShowRevokeInviteDialog(true);
  }

  function handleConfirmRevokeInvite(inviteId) {
    trackMetric('Clinic - Remove clinic team invite confirmed', { clinicId: selectedClinicId });
    dispatch(actions.async.deleteClinicianInvite(api, selectedClinicId, inviteId));
  }

  function handleSearchChange(event) {
    setPage(1);
    setSearchText(event.target.value);
    if (isEmpty(event.target.value)) {
      setPageCount(Math.ceil(clinicianArray.length / rowsPerPage));
    }
  }

  function handleClearSearch(event) {
    setPage(1);
    setSearchText('');
    setPageCount(Math.ceil(clinicianArray.length / rowsPerPage));
  }

  const handlePageChange = (event, newValue) => {
    setPage(newValue);
  };

  const handleTableFilter = (data) => {
    console.log('handleTableFilter', data);
  };

  const renderClinician = ({ fullName, email }) => (
    <Box>
      <Text fontWeight="medium">{fullName}</Text>
      <Text>{email || '\u00A0'}</Text>
    </Box>
  );

  const renderStatus = ({ status }) => (
    !isEmpty(status) ? <Box sx={{ whiteSpace: 'nowrap' }}>
      <Pill label={status} text={status} colorPalette="greens" />
    </Box> : null
  );

  const renderPermission = ({ prescriberPermission }) => (
    prescriberPermission ? <Box>
      <Text fontWeight="medium">
        {t('Prescriber')}
      </Text>
    </Box> : null
  );

  const renderRole = ({ role }) => (
    <Box>
      <Text fontWeight="medium">{role}</Text>
    </Box>
  );

  const renderEdit = ({ userId }) => {
    if (userId) {
      return (
        <Button
          p={0}
          fontSize="inherit"
          variant="textPrimary"
          onClick={() => handleEdit(userId)}
        >
          {t('Edit')}
        </Button>
      );
    }
  };

  const renderMore = props => {
    const items = [];

    if (props.userId) {
      items.push({
        icon: EditIcon,
        iconLabel: t('Edit Clinician Information'),
        iconPosition: 'left',
        id: `edit-${props.userId}`,
        variant: 'actionListItem',
        onClick: _popupState => {
          _popupState.close();
          handleEdit(props.userId);
        },
        text: t('Edit Clinician Information'),
      });

      if (!props.isAdmin || !isOnlyClinicAdmin()) {
        items.push({
          icon: DeleteForeverIcon,
          iconLabel: t('Remove User'),
          iconPosition: 'left',
          id: `delete-${props.userId}`,
          variant: 'actionListItemDanger',
          onClick: _popupState => {
            _popupState.close();
            handleDelete(props);
          },
          text: t('Remove User'),
        });
      }
    }

    if (props.inviteId) {
      items.push(...[
        {
          icon: InputIcon,
          iconLabel: t('Resend Invite'),
          iconPosition: 'left',
          id: `resendInvite-${props.inviteId}`,
          variant: 'actionListItem',
          onClick: _popupState => {
            _popupState.close();
            handleResendInvite(props);
          },
          text: t('Resend Invite'),
        },
        {
          icon: DeleteForeverIcon,
          iconLabel: t('Revoke Invite'),
          iconPosition: 'left',
          id: `deleteInvite-${props.inviteId}`,
          variant: 'actionListItemDanger',
          onClick: _popupState => {
            _popupState.close();
            handleRevokeInvite(props);
          },
          text: t('Revoke Invite'),
        },
      ]);
    }

    return items.length ? (
      <PopoverMenu id="action-menu" items={items} />
    ) : '';
  };

  const columns = [
    {
      title: t('Name'),
      field: 'fullName',
      align: 'left',
      sortable: true,
      sortBy: 'fullNameOrderable',
      render: renderClinician,
      searchable: true,
      searchBy: ['fullName'],
    },
    {
      title: t('Status'),
      field: 'status',
      align: 'left',
      sortable: true,
      sortBy: 'status',
      render: renderStatus,
      hideEmpty: true,
    },
  ];

  if (config.RX_ENABLED) {
    columns.push({
      title: t('Permission'),
      field: 'prescriberPermission',
      align: 'left',
      sortable: true,
      sortBy: 'prescriberPermission',
      render: renderPermission,
      hideEmpty: true,
    });
  }

  columns.push({
    title: t('Role'),
    field: 'role',
    align: 'left',
    sortable: true,
    sortBy: 'role',
    render: renderRole,
  });

  if (((isClinicAdmin()))) {
    columns.push(
      // {
      //   title: '',
      //   field: 'edit',
      //   render: renderEdit,
      //   align: 'left',
      // },
      {
        title: '',
        field: 'more',
        render: renderMore,
        align: 'right',
        className: 'action-menu',
      }
    );
  }

  const formattedInviteDate =
    pendingSentClinicianInvites?.[selectedInvite?.inviteId]?.modified &&
    sundial.formatInTimezone(
      pendingSentClinicianInvites?.[selectedInvite?.inviteId]?.modified,
      timePrefs?.timezoneName ||
        new Intl.DateTimeFormat().resolvedOptions().timeZone,
      'MM/DD/YYYY [at] h:mm a'
    );

  return (
    <>
      <ClinicProfile api={api} trackMetric={trackMetric} />
      <Box mb={8}>
        <Box variant="containers.largeBordered" mb={4}>
          <Flex
            px={4}
            py={2}
            sx={{ borderBottom: baseTheme.borders.default }}
            alignItems={'center'}
          >
            <Title flexGrow={1}>
              {t('Clinic Members')}
            </Title>
          </Flex>

          <Box mx={4}>
            {/* Flex Group 1: Search Box and Add Patient button */}
            <Flex
              alignItems="center"
              my={4}
              justifyContent="space-between"
              width={['100%', null, 'auto']}
              sx={{ gap: 2 }}
            >
              {isClinicAdmin() && (
                <Button
                  id="add-patient"
                  variant="primary"
                  onClick={handleInviteNewMember}
                  fontSize={0}
                  px={[2, 3]}
                  lineHeight={['inherit', null, 1]}
                >
                  {t('Invite New Clinic Team Member')}
                </Button>
              )}

              <Box flex={1} sx={{ position: ['static', null, 'absolute'], top: '8px', right: 4 }}>
                <TextInput
                  themeProps={{
                    width: ['100%', null, '250px'],
                  }}
                  fontSize="12px"
                  id="search-members"
                  placeholder={t('Search by Name')}
                  icon={!isEmpty(searchText) ? CloseRoundedIcon : SearchIcon}
                  iconLabel={t('Search')}
                  onClickIcon={!isEmpty(searchText) ? handleClearSearch : null}
                  name="search-members"
                  onChange={handleSearchChange}
                  value={searchText}
                  variant="condensed"
                />
              </Box>
            </Flex>

            <Table
              id="clinicianTable"
              label={t('Clinician Table')}
              columns={columns}
              data={clinicianArray}
              orderBy="fullNameOrderable"
              order="asc"
              rowHover={false}
              rowsPerPage={rowsPerPage}
              searchText={searchText}
              page={page}
              onFilter={handleTableFilter}
              fontSize={1}
            />
          </Box>
        </Box>

        {clinicianArray.length > rowsPerPage && (
          <Box variant="containers.large" bg="transparent" mb={0}>
            <Pagination
              px="5%"
              width="100%"
              id="clinic-clinicians-pagination"
              count={pageCount}
              page={page}
              disabled={pageCount < 2}
              onChange={handlePageChange}
              showFirstButton={false}
              showLastButton={false}
            />
          </Box>
        )}
      </Box>

      <Dialog
        id="deleteUser"
        aria-labelledby="dialog-title"
        open={showDeleteDialog}
        onClose={closeDeleteDialog}
        TransitionProps={{onExited:clearSelectedUser}}
      >
        <DialogTitle onClose={closeDeleteDialog}>
          <MediumTitle id="dialog-title">{t('Remove {{name}}', { name: selectedUser?.fullName || selectedUser?.email })}</MediumTitle>
        </DialogTitle>

        <DialogContent>
          <Body1>
            {t('{{name}} will lose all access to this clinic workspace and patient list. Are you sure you want to remove this user?', { name: selectedUser?.fullName || selectedUser?.email })}
          </Body1>
        </DialogContent>

        <DialogActions>
          <Button variant="secondary" onClick={closeDeleteDialog}>
            {t('Cancel')}
          </Button>

          <Button
            variant="danger"
            onClick={() => {
              handleConfirmDelete(selectedUser.userId);
              closeDeleteDialog();
            }}
          >
            {t('Remove User')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        id="resendInvite"
        aria-labelledby="dialog-title"
        open={showResendInviteDialog && !!pendingSentClinicianInvites?.[selectedInvite?.inviteId]?.created}
        onClose={closeResendInviteDialog}
        TransitionProps={{onExited:clearSelectedInvite}}
      >
        <DialogTitle onClose={closeResendInviteDialog}>
          <MediumTitle id="dialog-title">{t('Confirm Resending Invite')}</MediumTitle>
        </DialogTitle>

        <DialogContent>
          <Body1>
          <Trans>
            <Text>
              You invited <Text as='span' fontWeight='bold'>{{inviteName: selectedInvite?.name || selectedInvite?.email}}</Text> to your clinic on <Text as='span' fontWeight='bold'>{{inviteDate: formattedInviteDate}}</Text>.
            </Text>
            <Text>
              Are you sure you want to resend this invite?
            </Text>
          </Trans>
          </Body1>
        </DialogContent>

        <DialogActions>
          <Button variant="secondary" onClick={closeResendInviteDialog}>
            {t('Cancel')}
          </Button>

          <Button
            variant="primary"
            processing={working.resendingClinicianInvite.inProgress}
            onClick={() => handleConfirmResendInvite(selectedInvite.inviteId)}
          >
            {t('Resend Invite')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        id="revokeInvite"
        aria-labelledby="dialog-title"
        open={showRevokeInviteDialog}
        onClose={closeRevokeInviteDialog}
        TransitionProps={{onExited:clearSelectedInvite}}
      >
        <DialogTitle onClose={closeRevokeInviteDialog}>
          <MediumTitle id="dialog-title">{t('Confirm Revoking Invite')}</MediumTitle>
        </DialogTitle>

        <DialogContent>
          <Body1>
          <Trans>
            <Text>
              Are you sure you want to revoke this invite to <Text as='span' fontWeight='bold'>{{inviteName: selectedInvite?.name || selectedInvite?.email}}</Text>?
            </Text>
          </Trans>
          </Body1>
        </DialogContent>

        <DialogActions>
          <Button variant="secondary" onClick={closeRevokeInviteDialog}>
            {t('Cancel')}
          </Button>

          <Button
            variant="danger"
            processing={working.deletingClinicianInvite.inProgress}
            onClick={() => handleConfirmRevokeInvite(selectedInvite.inviteId)}
          >
            {t('Revoke Invite')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

ClinicAdmin.propTypes = {
  api: PropTypes.object.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default translate()(ClinicAdmin);
