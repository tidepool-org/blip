import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { translate } from 'react-i18next';
import filter from 'lodash/filter';
import forEach from 'lodash/forEach';
import get from 'lodash/get'
import map from 'lodash/map';
import values from 'lodash/values';
import { Box, Flex, Text } from 'rebass/styled-components';
import SearchIcon from '@material-ui/icons/Search';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import RefreshRoundedIcon from '@material-ui/icons/RefreshRounded';

import {
  MediumTitle,
  Body1,
} from '../../components/elements/FontStyles';

import Button from '../../components/elements/Button';
import Table from '../../components/elements/Table';
import TextInput from '../../components/elements/TextInput';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '../../components/elements/Dialog';

import { useToasts } from '../../providers/ToastProvider';
import * as actions from '../../redux/actions';
import { useIsFirstRender } from '../../core/hooks';
import { borders, colors } from '../../themes/baseTheme';

export const PatientInvites = (props) => {
  const { t, api, trackMetric } = props;
  const isFirstRender = useIsFirstRender();
  const dispatch = useDispatch();
  const { set: setToast } = useToasts();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [deleteDialogContent, setDeleteDialogContent] = useState(null);
  const [searchText, setSearchText] = React.useState('');
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const clinics = useSelector((state) => state.blip.clinics);
  const clinic = get(clinics, selectedClinicId);

  const {
    fetchingPatientInvites,
    acceptingPatientInvitation,
    deletingPatientInvitation,
  } = useSelector((state) => state.blip.working);

  function handleAsyncResult(workingState, successMessage) {
    const { inProgress, completed, notification } = workingState;

    if (!isFirstRender && !inProgress) {
      if (completed) {
        setShowDeleteDialog(false);

        setToast({
          message: successMessage,
          variant: 'success',
        });

        setSelectedInvitation(null);
      }

      if (completed === false) {
        setToast({
          message: get(notification, 'message'),
          variant: 'danger',
        });
      }
    }
  }

  useEffect(() => {
    handleAsyncResult(acceptingPatientInvitation, t('Patient invite for {{name}} has been accepted.', {
      name: selectedInvitation?.name,
    }));
  }, [acceptingPatientInvitation]);

  useEffect(() => {
    handleAsyncResult(deletingPatientInvitation, t('Patient invite for {{name}} has been declined.', {
      name: selectedInvitation?.name,
    }));
  }, [deletingPatientInvitation]);

  // Fetchers
  useEffect(() => {
    if (loggedInUserId && clinic) {
      forEach([
        {
          workingState: fetchingPatientInvites,
          action: actions.async.fetchPatientInvites.bind(null, api, clinic.id),
        },
      ], ({ workingState, action }) => {
        if (
          !workingState.inProgress &&
          !workingState.completed &&
          !workingState.notification
        ) {
          dispatch(action());
        }
      });
    }
  }, [loggedInUserId, clinic]);

  useEffect(() => {
    if (clinic) {
      setPendingInvites(map(values(clinic?.patientInvites), invite => ({
        key: invite.key,
        name: get(invite, 'creator.profile.fullName', ''),
        nameOrderable: get(invite, 'creator.profile.fullName', '').toLowerCase(),
        birthday: get(invite, 'creator.profile.patient.birthday', ''),
      })));
    }
  }, [clinic]);

  useEffect(() => {
    if (selectedInvitation) {
      setDeleteDialogContent({
        title: t('Decline invite?'),
        submitText: t('Decline Invite'),
        body: t('Are you sure you want to decline this share invite from {{patient}}?', { patient: selectedInvitation.name }),
      })
    }
  }, [selectedInvitation]);

  function handleAccept(invite) {
    trackMetric('Clinic - Accept patient invite', { clinicId: selectedClinicId });
    dispatch(actions.async.acceptPatientInvitation(api, clinic.id, invite.key));
  }

  function handleDecline(member) {
    trackMetric('Clinic - Decline patient invite', { clinicId: selectedClinicId });
    setSelectedInvitation(member);
    setShowDeleteDialog(true);
  }

  function handleConfirmDecline(invite) {
    trackMetric('Clinic - Decline patient invite confirmed', { clinicId: selectedClinicId });
    dispatch(actions.async.deletePatientInvitation(api, clinic.id, invite.key));
  }

  function handleRefetchInvites() {
    trackMetric('Clinic - Refresh patient invites', { clinicId: selectedClinicId });
    dispatch(actions.async.fetchPatientInvites(api, clinic.id));
  }

  function handleSearchChange(event) {
    setSearchText(event.target.value);
  }

  function clearSearchText() {
    setSearchText('');
  }

  const renderName = ({ name }) => (
    <Box>
      <Text>{name}</Text>
    </Box>
  );

  const renderBirthday = ({ birthday }) => (
    <Box>
      <Text>{birthday}</Text>
    </Box>
  );

  const renderActions = member => (
    <Flex justifyContent="flex-end">
      <Button
        className="decline-invite"
        onClick={() => handleDecline(member)}
        processing={deletingPatientInvitation.inProgress && member.key === selectedInvitation.key}
        variant="secondary"
      >
        {t('Decline')}
      </Button>

      <Button
        className="accept-invite"
        onClick={() => {
          setSelectedInvitation(member);
          handleAccept(member);
        }}
        processing={acceptingPatientInvitation.inProgress && member.key === selectedInvitation.key}
        variant="primary"
        color="purpleMedium"
        bg="white"
        ml={2}
      >
        {t('Accept')}
      </Button>
    </Flex>
  );

  const columns = [
    {
      title: t('Name'),
      field: 'nameOrderable',
      align: 'left',
      sortable: true,
      sortBy: 'nameOrderable',
      searchable: true,
      render: renderName,
    },
    {
      title: t('Birthday'),
      field: 'birthday',
      align: 'left',
      sortable: true,
      sortBy: 'birthday',
      render: renderBirthday,
    },
    {
      title: '',
      field: 'actions',
      render: renderActions,
      align: 'left',
    },
  ];

  return (
    <>
      <Flex>
        <TextInput
          themeProps={{
            minWidth: '250px',
            mb: 4,
            flexBasis: 1/2,
          }}
          placeholder={t('Search by Name')}
          icon={searchText ? CloseRoundedIcon : SearchIcon}
          iconLabel="search"
          onClickIcon={searchText ? clearSearchText : null}
          name="search-invites"
          onChange={handleSearchChange}
          value={searchText}
          variant="condensed"
        />
      </Flex>

      <Table
        id="patientInvitesTable"
        label={t('Clinician Table')}
        columns={columns}
        data={pendingInvites}
        orderBy="nameOrderable"
        order="asc"
        searchText={searchText}
        emptyText={null}
        rowHover={false}
        rowsPerPage={10}
        pagination={pendingInvites.length > 10}
        fontSize={1}
      />

      {pendingInvites.length === 0 && (
        <Box id="no-invites" pt={3} sx={{ borderTop: borders.divider }}>
          <Text p={3} fontSize={1} color="text.primary" textAlign="center">
            {t('There are no invites. Refresh to check for pending invites.')}
          </Text>

          <Flex justifyContent="center">
            <Button
              id="refresh-invites"
              variant="secondary"
              icon={RefreshRoundedIcon}
              iconPosition="left"
              processing={fetchingPatientInvites.inProgress}
              onClick={handleRefetchInvites}
              sx={{
                '&:hover,&:active,&.active,&.processing': {
                  color: colors.purpleMedium,
                  backgroundColor: colors.white,
                  borderColor: colors.purpleMedium,
                },
              }}
            >
              {t('Refresh')}
            </Button>
          </Flex>
        </Box>
      )}

      <Dialog
        id="declinePatientInvite"
        aria-labelledBy="dialog-title"
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <DialogTitle onClose={() => setShowDeleteDialog(false)}>
          <MediumTitle id="dialog-title">{deleteDialogContent?.title}</MediumTitle>
        </DialogTitle>
        <DialogContent>
          <Body1>
            {deleteDialogContent?.body}
          </Body1>
        </DialogContent>
        <DialogActions>
          <Button variant="secondary" onClick={() => setShowDeleteDialog(false)}>
            {t('Cancel')}
          </Button>
          <Button
            className="decline-invite"
            variant="danger"
            processing={deletingPatientInvitation.inProgress}
            onClick={() => {
              handleConfirmDecline(selectedInvitation);
            }}
          >
            {deleteDialogContent?.submitText}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

PatientInvites.propTypes = {
  api: PropTypes.object.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default translate()(PatientInvites);
