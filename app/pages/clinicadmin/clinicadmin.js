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
  const [selectedClinic, setSelectedClinic] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (trackMetric) {
      trackMetric('Web - Clinic Admin');
    }
  }, []);

  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const clinics = useSelector((state) => state.blip.clinics);
  const working = useSelector((state) => state.blip.working);
  const previousWorking = usePrevious(working);
  const fetchingClinicsForClinician = working.fetchingClinicsForClinician;
  const fetchingCliniciansFromClinic = working.fetchingCliniciansFromClinic;
  const allUsers = useSelector((state) => state.blip.allUsersMap);

  useEffect(() => {
    const { inProgress, completed, notification } = working.updatingClinician;
    const prevInProgress = get(
      previousWorking,
      'updatingClinician.inProgress'
    );
    if (!inProgress && completed && prevInProgress) {
      if (notification) {
        setToast({
          message: notification.message,
          variant: 'danger',
        });
      } else {
        setToast({
          message: t('You have successfully updated clinician.'),
          variant: 'success',
        });
      }
    }
  }, [working.updatingClinician]);

  useEffect(() => {
    const {
      inProgress,
      completed,
      notification,
    } = working.sendingClinicianInvite;
    const prevInProgress = get(
      previousWorking,
      'sendingClinicianInvite.inProgress'
    );
    if (!inProgress && completed && prevInProgress) {
      if (notification) {
        setToast({
          message: notification.message,
          variant: 'danger',
        });
      } else {
        setToast({
          message: t('Clinician invite sent.'),
          variant: 'success',
        });
      }
    }
  }, [working.sendingClinicianInvite]);

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
    if (
      !fetchingClinicsForClinician.inProgress &&
      !fetchingClinicsForClinician.completed &&
      !fetchingClinicsForClinician.notification
    ) {
      dispatch(actions.async.getClinicsForClinician(api, loggedInUserId));
    } else {
      if (keys(clinics).length) {
        setSelectedClinic(keys(clinics)[0]);
      }
      if (
        !fetchingCliniciansFromClinic.inProgress &&
        !fetchingCliniciansFromClinic.completed &&
        !fetchingCliniciansFromClinic.notification
      ) {
        forEach(clinics, (clinic) => {
          dispatch(actions.async.fetchCliniciansFromClinic(api, clinic.id));
        });
      }
    }
  }, [
    loggedInUserId,
    fetchingClinicsForClinician,
    fetchingCliniciansFromClinic,
  ]);

  const clinicianArray = map(
    get(clinics, [selectedClinic, 'clinicians'], {}),
    (clinician) => {
      const { roles, email, id: clinicianId, inviteId } = clinician;
      const user = get(allUsers, clinicianId, {});
      const role = includes(roles, 'CLINIC_ADMIN')
        ? 'Clinic Admin'
        : includes(roles, 'CLINIC_MEMBER')
        ? 'Clinic Member'
        : '';
      return {
        fullName: personUtils.fullName(user),
        fullNameOrderable: (personUtils.fullName(user) || '').toLowerCase(),
        role,
        prescriberPermission: includes(roles, 'PRESCRIBER'),
        userid: clinicianId,
        inviteId: inviteId,
        email,
        roles,
      };
    }
  );

  const userRolesInClinic = get(
    find(clinicianArray, { userid: loggedInUserId }),
    'roles',
    []
  );

  function closeDeleteDialog() {
    setShowDeleteDialog(false);
    setSelectedUser(null);
  }

  function handleSearchChange(event) {
    setSearchText(event.target.value);
  }

  function handleEdit(userid) {
    dispatch(
      push('/clinician-edit', {
        clinicianId: userid,
        clinicId: selectedClinic,
      })
    );
  }

  function handleDelete(selectedClinicianId) {
    dispatch(
      actions.async.deleteClinicianFromClinic(
        api,
        selectedClinic,
        selectedClinicianId
      )
    );
  }

  function handleResendInvite(inviteId) {
    dispatch(
      actions.async.resendClinicianInvite(api, selectedClinic, inviteId)
    );
  }

  function handleDeleteInvite(inviteId) {
    dispatch(
      actions.async.deleteClinicianInvite(api, selectedClinic, inviteId)
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
      {inviteId ? <Pill text="invite sent" colorPalette="greens" /> : ''}
    </Box>
  );

  const renderPermission = ({ prescriberPermission }) => (
    <Box>
      <Text fontWeight="medium">
        {prescriberPermission ? 'Prescriber' : ''}
      </Text>
    </Box>
  );

  const renderRole = ({ role }) => (
    <Box>
      <Text fontWeight="medium">{role}</Text>
    </Box>
  );

  const renderEdit = ({ userid }) => {
    if (userid) {
      return (
        <Button
          p={0}
          fontSize="inherit"
          variant="textPrimary"
          onClick={() => handleEdit(userid)}
        >
          Edit
        </Button>
      );
    }
  };

  const renderMore = ({ ...props }) => {
    let items;
    if (props.userid) {
      items = [
        {
          icon: DeleteForeverIcon,
          iconLabel: 'Remove User',
          iconPosition: 'left',
          id: `delete-${props.userId}`,
          variant: 'actionListItemDanger',
          onClick: () => {
            setSelectedUser(props);
            setShowDeleteDialog(true);
          },
          text: 'Remove User',
        },
      ];
    }
    if (props.inviteId) {
      items = [
        {
          icon: InputIcon,
          iconLabel: 'Resend Invitation',
          iconPosition: 'left',
          id: `resendInvite-${props.inviteId}`,
          variant: 'actionListItem',
          onClick: () => handleResendInvite(props.inviteId),
          text: 'Resend Invitation',
        },
        {
          icon: DeleteForeverIcon,
          iconLabel: 'Delete Invitation',
          iconPosition: 'left',
          id: `deleteInvite-${props.inviteId}`,
          variant: 'actionListItemDanger',
          onClick: () => handleDeleteInvite(props.inviteId),
          text: 'Delete item',
        },
      ];
    }

    return (
      <PopoverMenu id="action-menu" items={items} />
    );
  };

  const columns = [
    {
      title: 'Name',
      field: 'fullName',
      align: 'left',
      sortable: true,
      sortBy: 'fullNameOrderable',
      render: renderClinician,
      searchable: true,
      searchBy: ['fullName'],
    },
    {
      title: 'Status',
      field: 'inviteSent',
      align: 'left',
      sortable: true,
      sortBy: 'inviteSent',
      render: renderStatus,
    },
    {
      title: 'Permission',
      field: 'prescriberPermission',
      align: 'left',
      sortable: true,
      sortBy: 'prescriberPermission',
      render: renderPermission,
    },
    {
      title: 'Role',
      field: 'role',
      align: 'left',
      sortable: true,
      sortBy: 'role',
      render: renderRole,
    },
  ];

  if (includes(userRolesInClinic, 'CLINIC_ADMIN')) {
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
      <Box
        mx={'auto'}
        my={2}
        p={4}
        bg="white"
        width={[1, 0.75, 0.75, 0.5]}
        sx={{
          border: baseTheme.borders.default,
          borderRadius: baseTheme.radii.default,
        }}
      >
        <Flex alignItems={'flex-start'}>
          <Title py={4} pr={4}>
            Clinic Profile
          </Title>
          <Box flexDirection="column" flexGrow="1">
            <TextInput
              name="clinic_name"
              label="Clinic name"
              disabled={true}
              value={get(clinics, [selectedClinic, 'name'])}
              width="100%"
              themeProps={{
                px: 2,
                pb: 2,
                sx: {
                  '&& input:disabled': {
                    color: baseTheme.colors.text.primary,
                    bg: 'white',
                  },
                },
              }}
            ></TextInput>
            <TextInput
              name="clinic_address"
              label="Clinic address"
              disabled={true}
              value={get(clinics, [selectedClinic, 'address'])}
              width="100%"
              color={baseTheme.colors.text.primary}
              bg="white"
              themeProps={{
                px: 2,
                sx: {
                  '&& input:disabled': {
                    color: baseTheme.colors.text.primary,
                    bg: 'white',
                  },
                },
              }}
            ></TextInput>
          </Box>
          <Box flexDirection="column" flexGrow="1">
            <Box>
              <TextInput
                name="clinic_contact"
                label="Clinic contact"
                disabled={true}
                value={get(clinics, [selectedClinic, 'email'])}
                width="100%"
                themeProps={{
                  px: 2,
                  pb: 2,
                  sx: {
                    '&& input:disabled': {
                      color: baseTheme.colors.text.primary,
                      bg: 'white',
                    },
                  },
                }}
              ></TextInput>
            </Box>
            <Box>
              <TextInput
                name="clinic_cityzip"
                label="City, State, Zipcode"
                disabled={true}
                value={`${get(clinics, [
                  selectedClinic,
                  'city',
                ])}, ${get(clinics, [
                  selectedClinic,
                  'state',
                ])}, ${get(clinics, [selectedClinic, 'postalCode'])}`}
                width="100%"
                themeProps={{
                  px: 2,
                  sx: {
                    '&& input:disabled': {
                      color: baseTheme.colors.text.primary,
                      bg: 'white',
                    },
                  },
                }}
              ></TextInput>
            </Box>
          </Box>
          <Box flexDirection="column" flexGrow="1">
            <TextInput
              name="clinic_sharecode"
              label="Clinic share code"
              disabled={true}
              value={get(clinics, [selectedClinic, 'shareCode'])}
              width="100%"
              themeProps={{
                px: 2,
                pb: 2,
                sx: {
                  '&& input:disabled': {
                    color: baseTheme.colors.text.primary,
                    bg: 'white',
                  },
                },
              }}
            ></TextInput>
          </Box>
        </Flex>
      </Box>
      <Box
        mx={'auto'}
        my={2}
        bg="white"
        width={[1, 0.75, 0.75, 0.5]}
        sx={{
          border: baseTheme.borders.default,
          borderRadius: baseTheme.radii.default,
        }}
      >
        <Flex
          sx={{ borderBottom: baseTheme.borders.default }}
          alignItems={'center'}
        >
          <Title p={4} flexGrow={1}>
            Access Management
          </Title>
          <Box>
            <Button
              mr={4}
              variant="primary"
              onClick={() => {
                dispatch(push('/clinic-invite', { clinicId: selectedClinic }));
              }}
            >
              Invite new clinic team member
            </Button>
          </Box>
        </Flex>

        <Box mx={4}>
          <TextInput
            themeProps={{
              minWidth: '250px',
              py: 3,
            }}
            placeholder={t('search')}
            icon={SearchIcon}
            id="search-members"
            name="search-members"
            onChange={handleSearchChange}
            variant="condensed"
          />
          <Table
            id={'clinicianTable'}
            lablel={'cliniciantablelabel'}
            columns={columns}
            data={clinicianArray}
            orderBy="fullNameOrderable"
            order="asc"
            searchText={searchText}
            rowsPerPage={8}
            pagination={true}
            style={{ fontSize: '14px' }}
            label=""
          />
        </Box>
      </Box>
      <Dialog
        id={'deleteUser'}
        aria-labelledBy="dialog-title"
        open={showDeleteDialog}
        onClose={closeDeleteDialog}
      >
        <DialogTitle onClose={closeDeleteDialog}>
          <MediumTitle id="dialog-title">Remove {selectedUser?.fullName}</MediumTitle>
        </DialogTitle>
        <DialogContent>
          <Body1>
            {selectedUser?.fullName} will lose all access to this clinic workspace and
            its patient list. Are you sure you want to remove this user?
          </Body1>
        </DialogContent>
        <DialogActions>
          <Button variant="secondary" onClick={closeDeleteDialog}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              handleDelete(selectedUser.userid);
              closeDeleteDialog();
            }}
          >
            Remove User
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
