import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { translate } from 'react-i18next';
import { push } from 'connected-react-router';
import get from 'lodash/get'
import keys from 'lodash/keys';
import map from 'lodash/map';
import forEach from 'lodash/forEach';
import includes from 'lodash/includes';
import filter from 'lodash/filter';
import find from 'lodash/find';
import { Box, Flex, Text } from 'rebass/styled-components';
import SearchIcon from '@material-ui/icons/Search';
import InputIcon from '@material-ui/icons/Input';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';

import {
  Title,
  MediumTitle,
  Body1,
} from '../../components/elements/FontStyles';

import TextInput from '../../components/elements/TextInput';
import Button from '../../components/elements/Button';
import Table from '../../components/elements/Table';
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
import personUtils from '../../core/personutils';
import baseTheme from '../../themes/baseTheme';
import * as actions from '../../redux/actions';
import { usePrevious } from '../../core/hooks';

export const ClinicAdmin = (props) => {
  const { t, api, trackMetric } = props;
  const dispatch = useDispatch();
  const { set: setToast } = useToasts();
  const [searchText, setSearchText] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const clinics = useSelector((state) => state.blip.clinics);
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const working = useSelector((state) => state.blip.working);
  const previousWorking = usePrevious(working);
  const fetchingCliniciansFromClinic = working.fetchingCliniciansFromClinic;
  const allUsers = useSelector((state) => state.blip.allUsersMap);
  const clinic = get(clinics, selectedClinicId);

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
    if (!inProgress && completed && prevInProgress) {
      if (notification) {
        setToast({
          message: notification.message,
          variant: 'danger',
        });
      } else {
        setToast({
          message: t('Clinician invite resent.'),
          variant: 'success',
        });
      }
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
    if (!inProgress && completed && prevInProgress) {
      if (notification) {
        setToast({
          message: notification.message,
          variant: 'danger',
        });
      } else {
        setToast({
          message: t('Clinician invite deleted.'),
          variant: 'success',
        });
      }
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
    if (!inProgress && completed && prevInProgress) {
      if (notification) {
        setToast({
          message: notification.message,
          variant: 'danger',
        });
      } else {
        setToast({
          message: t('Clinician removed from clinic.'),
          variant: 'success',
        });
      }
    }
  }, [working.deletingClinicianFromClinic]);

  useEffect(() => {
    if(loggedInUserId && clinic) {
      if (
        !fetchingCliniciansFromClinic.inProgress &&
        !fetchingCliniciansFromClinic.completed &&
        !fetchingCliniciansFromClinic.notification
      ) {
        dispatch(actions.async.fetchCliniciansFromClinic(api, clinic.id));
      }
    }
  }, [
    clinic,
    loggedInUserId,
    selectedClinicId,
    fetchingCliniciansFromClinic,
  ]);

  const clinicianArray = map(
    get(clinics, [selectedClinicId, 'clinicians'], {}),
    (clinician) => {
      const { roles, email, id: clinicianId, inviteId, name = '' } = clinician;
      const user = get(allUsers, clinicianId, {});
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
        inviteId: inviteId,
        email,
        roles,
      };
    }
  );

  const userRolesInClinic = get(
    find(clinicianArray, { userId: loggedInUserId }),
    'roles',
    []
  );

  const isClinicAdmin = includes(userRolesInClinic, 'CLINIC_ADMIN');
  const isOnlyClinicAdmin = filter(clinicianArray, { isAdmin: true, inviteId: undefined }).length === 1;

  function closeDeleteDialog() {
    setShowDeleteDialog(false);
    setSelectedUser(null);
  }

  function handleSearchChange(event) {
    setSearchText(event.target.value);
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

  function handleResendInvite(inviteId) {
    trackMetric('Clinic - Resend clinic team invite', { clinicId: selectedClinicId });

    dispatch(
      actions.async.resendClinicianInvite(api, selectedClinicId, inviteId)
    );
  }

  function handleDeleteInvite(inviteId) {
    trackMetric('Clinic - Remove clinic team invite', { clinicId: selectedClinicId });

    dispatch(
      actions.async.deleteClinicianInvite(api, selectedClinicId, inviteId)
    );
  }

  const renderClinician = ({ fullName, email }) => (
    <Box>
      <Text fontWeight="medium">{fullName}</Text>
      <Text>{email || '\u00A0'}</Text>
    </Box>
  );

  const renderStatus = ({ inviteId }) => (
    <Box>
      {inviteId ? <Pill text={t('invite sent')} colorPalette="greens" /> : ''}
    </Box>
  );

  const renderPermission = ({ prescriberPermission }) => (
    <Box>
      <Text fontWeight="medium">
        {prescriberPermission ? t('Prescriber') : ''}
      </Text>
    </Box>
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

    if (props.userId && (!props.isAdmin || !isOnlyClinicAdmin)) {
      items.push({
        icon: DeleteForeverIcon,
        iconLabel: t('Remove User'),
        iconPosition: 'left',
        id: `delete-${props.userId}`,
        variant: 'actionListItemDanger',
        onClick: () => handleDelete(props),
        text: t('Remove User'),
      });
    }

    if (props.inviteId) {
      items.push(...[
        {
          icon: InputIcon,
          iconLabel: t('Resend Invitation'),
          iconPosition: 'left',
          id: `resendInvite-${props.inviteId}`,
          variant: 'actionListItem',
          onClick: () => handleResendInvite(props.inviteId),
          text: t('Resend Invitation'),
        },
        {
          icon: DeleteForeverIcon,
          iconLabel: t('Delete Invitation'),
          iconPosition: 'left',
          id: `deleteInvite-${props.inviteId}`,
          variant: 'actionListItemDanger',
          onClick: () => handleDeleteInvite(props.inviteId),
          text: t('Delete item'),
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
      field: 'inviteSent',
      align: 'left',
      sortable: true,
      sortBy: 'inviteSent',
      render: renderStatus,
    },
    {
      title: t('Permission'),
      field: 'prescriberPermission',
      align: 'left',
      sortable: true,
      sortBy: 'prescriberPermission',
      render: renderPermission,
    },
    {
      title: t('Role'),
      field: 'role',
      align: 'left',
      sortable: true,
      sortBy: 'role',
      render: renderRole,
    },
  ];

  if (isClinicAdmin) {
    columns.push(
      {
        title: '',
        field: 'edit',
        render: renderEdit,
        align: 'left',
      },
      {
        title: '',
        field: 'more',
        render: renderMore,
        align: 'left',
      }
    );
  }

  return (
    <>
      <ClinicProfile api={api} trackMetric={trackMetric} />

      <Box variant="containers.largeBordered">
        <Flex
          sx={{ borderBottom: baseTheme.borders.default }}
          alignItems={'center'}
        >
          <Title p={4} flexGrow={1}>
            {t('Clinic Members')}
          </Title>

          {isClinicAdmin && (
            <Box>
              <Button
                mr={4}
                variant="primary"
                onClick={handleInviteNewMember}
              >
                {t('Invite new clinic team member')}
              </Button>
            </Box>
          )}
        </Flex>

        <Box mx={4}>
          <Flex>
            <TextInput
              themeProps={{
                minWidth: '250px',
                my: 4,
                flexBasis: 1/2,
              }}
              placeholder={t('Search by Name')}
              icon={SearchIcon}
              id="search-members"
              name="search-members"
              onChange={handleSearchChange}
              variant="condensed"
            />
          </Flex>

          <Table
            id="clinicianTable"
            label={t('Clinician Table')}
            columns={columns}
            data={clinicianArray}
            orderBy="fullNameOrderable"
            order="asc"
            rowHover={false}
            rowsPerPage={8}
            searchText={searchText}
            pagination={true}
            style={{ fontSize: '14px' }}
          />
        </Box>
      </Box>
      <Dialog
        id="deleteUser"
        aria-labelledBy="dialog-title"
        open={showDeleteDialog}
        onClose={closeDeleteDialog}
      >
        <DialogTitle onClose={closeDeleteDialog}>
          <MediumTitle id="dialog-title">{t('Remove {{name}}', { name: selectedUser?.fullName })}</MediumTitle>
        </DialogTitle>

        <DialogContent>
          <Body1>
            {t('{{name}} will lose all access to this clinic workspace and patient list. Are you sure you want to remove this user?', { name: selectedUser?.fullName })}
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
    </>
  );
};

ClinicAdmin.propTypes = {
  api: PropTypes.object.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default translate()(ClinicAdmin);
