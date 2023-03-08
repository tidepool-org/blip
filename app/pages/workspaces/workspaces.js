import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { translate } from 'react-i18next';
import { push } from 'connected-react-router';
import filter from 'lodash/filter';
import forEach from 'lodash/forEach';
import get from 'lodash/get'
import has from 'lodash/has';
import indexOf from 'lodash/indexOf';
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';
import values from 'lodash/values';
import { Box, Flex, Text } from 'rebass/styled-components';
import AddIcon from '@material-ui/icons/Add';

import {
  Title,
  Headline,
  MediumTitle,
  Body1,
  Subheading,
} from '../../components/elements/FontStyles';

import Button from '../../components/elements/Button';
import NotificationIcon from '../../components/elements/NotificationIcon';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '../../components/elements/Dialog';

import { useToasts } from '../../providers/ToastProvider';
import baseTheme from '../../themes/baseTheme';
import * as actions from '../../redux/actions';
import { useIsFirstRender } from '../../core/hooks';

export const Workspaces = (props) => {
  const { t, api, trackMetric } = props;
  const isFirstRender = useIsFirstRender();
  const dispatch = useDispatch();
  const { set: setToast } = useToasts();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [deleteDialogContent, setDeleteDialogContent] = useState(null);
  const [popupState, setPopupState] = useState(null);
  const clinics = useSelector((state) => state.blip.clinics);
  const pendingReceivedClinicianInvites = useSelector((state) => state.blip.pendingReceivedClinicianInvites);
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);

  const {
    fetchingClinicianInvites,
    fetchingClinicsForClinician,
    deletingClinicianFromClinic,
    acceptingClinicianInvite,
    dismissingClinicianInvite,
  } = useSelector((state) => state.blip.working);

  function handleAsyncResult(workingState, successMessage) {
    const { inProgress, completed, notification } = workingState;

    if (!isFirstRender && !inProgress) {
      if (completed) {
        popupState?.close();
        setShowDeleteDialog(false);

        setToast({
          message: successMessage,
          variant: 'success',
        });

        setSelectedWorkspace(null);
        setPopupState(null);
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
    handleAsyncResult(deletingClinicianFromClinic, t('You have left {{name}}.', {
      name: selectedWorkspace?.name,
    }));
  }, [deletingClinicianFromClinic]);

  useEffect(() => {
    handleAsyncResult(acceptingClinicianInvite, t('You\'re in. You now have access to {{name}}.', {
      name: selectedWorkspace?.name,
    }));

    // Refetch clinician clinics to include newly-accepeted invitation
    if (acceptingClinicianInvite.completed) dispatch(actions.async.getClinicsForClinician(api, loggedInUserId, { limit: 1000, offset: 0 }));
  }, [acceptingClinicianInvite]);

  useEffect(() => {
    handleAsyncResult(dismissingClinicianInvite, t('Invite to {{name}} has been declined.', {
      name: selectedWorkspace?.name,
    }));
  }, [dismissingClinicianInvite]);

  useEffect(() => {
    const { inProgress, completed, notification } = fetchingClinicsForClinician;

    if (!isFirstRender && !inProgress && completed === false) {
      setToast({
        message: get(notification, 'message'),
        variant: 'danger',
      });
    }
  }, [fetchingClinicsForClinician]);

  // Fetchers
  useEffect(() => {
    if (loggedInUserId) {
      forEach([
        {
          workingState: fetchingClinicianInvites,
          action: actions.async.fetchClinicianInvites.bind(null, api, loggedInUserId),
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
  }, [loggedInUserId]);

  useEffect(() => {
    if (loggedInUserId && Object.keys(clinics).length && isFirstRender) {
      const userClinics = filter(values(clinics), ({ clinicians }) =>
        has(clinicians, loggedInUserId)
      );
      const singleAdminClinics = filter(
        userClinics,
        ({ clinicians }) =>
          filter(clinicians, { roles: ['CLINIC_ADMIN'] }).length === 1
      );
      // clinics with one admin could have unfetched clinician lists
      forEach(singleAdminClinics, (clinic) => {
        dispatch(
          actions.async.fetchCliniciansFromClinic(api, clinic.id, {
            limit: 1000,
          })
        );
      });
    }
  }, [api, clinics, dispatch, isFirstRender, loggedInUserId]);

  // Populate workspaces with fetched results
  useEffect(() => {
    const userClinics = filter(values(clinics), ({ clinicians }) => has(clinicians, loggedInUserId));

    const userWorkspaces = [
      ...sortBy(map(userClinics, clinic => ({
        id: clinic.id,
        name: clinic.name,
        nameOrderable: clinic.name.toLowerCase(),
        type: 'clinic',
        isAdmin: indexOf(clinic.clinicians[loggedInUserId].roles, 'CLINIC_ADMIN') >= 0,
        adminCount: filter(clinic.clinicians, {roles: ['CLINIC_ADMIN']}).length
      })), 'nameOrderable'),
      ...sortBy(map(pendingReceivedClinicianInvites, invite => ({
        id: invite.clinicId,
        key: invite.key,
        name: invite.creator?.clinicName,
        nameOrderable: invite.creator?.clinicName?.toLowerCase(),
        type: invite.type,
      })), 'nameOrderable'),
    ];

    setWorkspaces(userWorkspaces);
  }, [clinics, loggedInUserId, pendingReceivedClinicianInvites]);

  useEffect(() => {
    if (selectedWorkspace) {
      let title, submitText, body, cancelText = t('Cancel');

      if (selectedWorkspace.type === 'clinic') {
        if (selectedWorkspace.adminCount === 1 && selectedWorkspace.isAdmin){
          title = t('Unable to leave {{name}}', { name: selectedWorkspace.name });
          body = t('Before you remove yourself from {{name}}, please assign Admin permissions to at least one other Clinic member.', {name: selectedWorkspace.name });
          cancelText = t('OK');
        } else {
          title = t('Leave {{name}}', { name: selectedWorkspace.name });
          submitText = t('Leave Clinic');
          body = t('You will lose all access to {{name}} and its patient list. Are you sure you want to leave this clinic?', { name: selectedWorkspace.name });
        }
      } else if (selectedWorkspace.type === 'clinician_invitation') {
        title = t('Decline {{name}}', { name: selectedWorkspace.name });
        submitText = t('Decline Invite');
        body = t('If you decline this invite you will need to ask your Clinic Admin to send a new one. Are you sure you want to decline the invite to the {{name}} clinic workspace? ', { name: selectedWorkspace.name });
      }

      setDeleteDialogContent({
        title,
        body,
        submitText,
        cancelText,
      })
    }
  }, [selectedWorkspace]);

  function handleLeaveClinic(workspace) {
    trackMetric('Clinic - Workspaces - Leave clinic', { clinicId: workspace?.id });
    setSelectedWorkspace(workspace);
    setShowDeleteDialog(true);
  }

  function handleAcceptInvite(workspace) {
    trackMetric('Clinic - Workspaces - Join clinic', { clinicId: workspace?.id });
    setSelectedWorkspace(workspace);

    dispatch(
      actions.async.acceptClinicianInvite(
        api,
        loggedInUserId,
        workspace.key,
      )
    );
  }

  function handleDeclineInvite(workspace) {
    trackMetric('Clinic - Workspaces - Ignore clinic invite', { clinicId: workspace?.id });
    setSelectedWorkspace(workspace);
    setShowDeleteDialog(true);
  }

  function handleConfirmDelete(workspace) {
    if (workspace.type === 'clinic') {
      trackMetric('Clinic - Workspaces - Leave clinic confirmed', { clinicId: workspace?.id });

      dispatch(
        actions.async.deleteClinicianFromClinic(
          api,
          selectedWorkspace.id,
          loggedInUserId
        )
      );
    } else if (workspace.type === 'clinician_invitation') {
      trackMetric('Clinic - Workspaces - Ignore clinic invite confirmed', { clinicId: workspace?.id });

      dispatch(
        actions.async.dismissClinicianInvite(
          api,
          loggedInUserId,
          selectedWorkspace.key
        )
      );
    }
  }

  function handleGoToWorkspace(workspace) {
    const metric = workspace?.id
      ? ['Clinic - Workspaces - Go to clinic workspace', { clinicId: workspace.id }]
      : ['Clinic - Workspaces - Go to private workspace'];

    trackMetric(...metric);
    dispatch(actions.sync.selectClinic(workspace?.id || null));
    dispatch(push(workspace?.id ? '/clinic-workspace' : '/patients', { selectedClinicId: workspace.id }));
  }

  function handleCreateNewClinic(source) {
    trackMetric('Clinic - Workspaces - Create new clinic', { source });
    dispatch(actions.sync.selectClinic(null));
    dispatch(push('/clinic-details/new', { selectedClinicId: null }));
  }

  const RenderClinicWorkspace = (workspace, key) => {
    const workspaceActions = workspace.type === 'clinic' ? (
      <>
        <Button variant='secondary' onClick={handleLeaveClinic.bind(null, workspace)}>{t('Leave Clinic')}</Button>
        <Button ml={[3]} onClick={handleGoToWorkspace.bind(null, workspace)}>{t('Go To Workspace')}</Button>
      </>
    ) : (
      <>
        <Button variant='secondary' onClick={handleDeclineInvite.bind(null, workspace)}>{t('Decline')}</Button>
        <Button ml={[3]} onClick={handleAcceptInvite.bind(null, workspace)}>{t('Accept Invite')}</Button>
      </>
    );

    return (
      <Flex
        key={key}
        className={`workspace-item-${workspace.type}`}
        alignItems="center"
        justifyContent="space-between"
        flexWrap={['wrap']}
        pr={[3, 4]}
        pl={[3, 3, 0]}
        pt={4}
        sx={{
          borderBottom: baseTheme.borders.divider,
          '&:last-child': {
            borderBottom: 'none',
          }
        }}
      >
        <Flex className='workspace-details' alignItems="center" pb={[2,4]} mr={2}>
          <Subheading>{workspace.name}</Subheading>
          {workspace.type === 'clinician_invitation' && <NotificationIcon />}
        </Flex>
        <Flex
          className='workspace-actions'
          justifyContent="flex-start"
          width={['100%', 'auto']}
          pb={4}
        >
          {workspaceActions}
        </Flex>
      </Flex>
    );
  };

  return (
    <>
      <Box
        variant="containers.largeBordered"
        sx={{
          borderLeft: ['none', baseTheme.borders.default],
          borderRight: ['none', baseTheme.borders.default],
          borderRadius: ['none', baseTheme.radii.default],
        }}
      >
        <Flex
          sx={{ borderBottom: baseTheme.borders.default }}
          alignItems={'center'}
          flexWrap={['wrap', 'nowrap']}
          px={[3, 4, 5, 6]}
        >
          <Headline flexGrow={1} pr={[0, 3]} py={[3, 4]} textAlign={['center', 'left']}>
            {t('Welcome To Tidepool')}
          </Headline>
        </Flex>

        <Box px={[3, 4, 5, 6]} py={[3, 4, 5]}>
          <Box
            mb={[3,4,5]}
            sx={{
              borderRadius: '4px',
              border: baseTheme.borders.modal,
            }}
            {...props}
          >
            <Flex
              justifyContent="space-between"
              flexWrap="wrap"
              align="center"
              bg="lightestGrey"
              px={[3, 4]}
              py={[2, 3]}
              sx={{
                borderBottom: baseTheme.borders.modal,
              }}
            >
              <Box>
                <Title fontWeight="medium">{t('Clinic Workspace')}</Title>
                <Body1>{t('View, share and manage patient data')}</Body1>
              </Box>

              <Button
                id="workspace-create-clinic"
                variant="textPrimary"
                fontSize={1}
                fontWeight="medium"
                py={3}
                pr={0}
                pl={[0, 0, 3]}
                icon={AddIcon}
                iconPosition="left"
                onClick={handleCreateNewClinic.bind(null, 'header cta')}
              >
                {t('Create a New Clinic')}
              </Button>
            </Flex>

            <Box pl={[0, 0, 5, 6]} id="workspaces-clinics-list">
              {map(workspaces, RenderClinicWorkspace)}
            </Box>

            {!workspaces.length && (
              <Box
                id="workspaces-empty"
                fontSize={1}
                fontWeight="medium"
                px={[3, 4]} py={4}
                color="text.primary"
              >
                <Body1 mb={1}>{t('With your Clinic account, you will be able to:')}</Body1>

                <Box as="ol" pl={4} mb={4} sx={{ li: { py: 1 } }}>
                  <li>{t('Provide every member of your team with their own unique account and login credentials to access patient data.')}</li>
                  <li>{t('Directly manage Clinic team member access.')}</li>
                  <li>{t('Leverage a Clinic Share Code to connect with patients.')}</li>
                  <li>{t('Switch between multiple Clinic Workspaces, as needed.')}</li>
                  <li>{t('Create and manage access to patient accounts without requiring Tidepool Uploader.')}</li>
                </Box>

                <Body1>{t('Start by creating a new clinic.')}</Body1>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      <Dialog
        id="deleteUser"
        aria-labelledby="dialog-title"
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
            {deleteDialogContent?.cancelText}
          </Button>
          {deleteDialogContent?.submitText && (
            <Button
              className="remove-account-access"
              variant="danger"
              processing={deletingClinicianFromClinic.inProgress}
              onClick={() => {
                handleConfirmDelete(selectedWorkspace);
              }}
            >
              {deleteDialogContent?.submitText}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

Workspaces.propTypes = {
  api: PropTypes.object.isRequired,
  trackMetric: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default translate()(Workspaces);
