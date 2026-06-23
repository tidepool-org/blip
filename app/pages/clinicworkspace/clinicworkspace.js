import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { push } from 'connected-react-router';
import { useTranslation, withTranslation } from 'react-i18next';
import forEach from 'lodash/forEach';
import get from 'lodash/get'
import values from 'lodash/values'
import { Box } from 'theme-ui';
import { Element } from 'react-scroll';
import { useFlags } from 'launchdarkly-react-client-sdk';

import TabGroup from '../../components/elements/TabGroup';
import ClinicWorkspaceHeader from '../../components/clinic/ClinicWorkspaceHeader';
import ClinicPatients from './ClinicPatients';
import DeviceIssues from './DeviceIssues';
import TideDashboardV2 from './TideDashboardV2';
import Prescriptions from '../prescription/Prescriptions';
import { PatientInvites } from '../share';
import * as actions from '../../redux/actions';
import config from '../../config';

const TAB = {
  PATIENTS: 'patients',
  DEVICE_ISSUES: 'device-issues',
  TIDE_DASHBOARD: 'tide-dashboard',
  INVITES: 'invites',
  PRESCRIPTIONS: 'prescriptions',
};

const useTabs = () => {
  const { t } = useTranslation();
  const { showPrescriptions, showSummaryDashboard, showTideDashboard } = useFlags();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const patientInvites = values(clinic?.patientInvites);

  const showDeviceIssuesUI = clinic?.entitlements?.deviceIssues;

  const showTideDashboardUI = (showSummaryDashboard || clinic?.entitlements?.summaryDashboard)
    && (showTideDashboard || clinic?.entitlements?.tideDashboard);

  const tabs = useMemo(() => (
    [
      {
        name: TAB.PATIENTS,
        label: t('Patient List'),
        metric: 'Clinic - View patient list'
      },
      showDeviceIssuesUI && {
        name: TAB.DEVICE_ISSUES,
        label: t('Device Issues'),
        metric: 'Clinic - View device issues'
      },
      showTideDashboardUI && {
        name: TAB.TIDE_DASHBOARD,
        label: t('TIDE Dashboard'),
        metric: 'Clinic - View TIDE Dashboard'
      },
      {
        name: TAB.INVITES,
        label: t('Invites ({{count}})', { count: patientInvites.length }),
        metric: 'Clinic - View patient invites'
      },
      showPrescriptions && {
        name: TAB.PRESCRIPTIONS,
        label: t('Tidepool Loop Start Orders'),
        metric: 'Clinic - View prescriptions'
      },
    ].filter(Boolean)
  ), [showPrescriptions, showDeviceIssuesUI, showTideDashboardUI, patientInvites.length, t]);

  return tabs;
};

export const ClinicWorkspace = (props) => {
  const { t, api, trackMetric } = props;
  const dispatch = useDispatch();
  const { tab } = useParams();
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const currentPatientInViewId = useSelector((state) => state.blip.currentPatientInViewId);
  const { fetchingPatientInvites } = useSelector((state) => state.blip.working);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const tabs = useTabs();

  const tabIndices = useMemo(() => Object.fromEntries(tabs.map(({ name }, i) => [name, i])), [tabs]);

  const [selectedTab, setSelectedTab] = useState(get(tabIndices, tab, 0));

  useEffect(() => {
    if (tab && tab in tabIndices && tabIndices[tab] !== selectedTab) {
      setSelectedTab(tabIndices[tab]);
    }
  }, [tab]);

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
    dispatch(actions.worker.dataWorkerRemoveDataRequest(null, currentPatientInViewId));
    dispatch(actions.sync.clearPatientInView());

    if (props.location?.state?.selectedClinicId && props.location?.state?.selectedClinicId !== selectedClinicId) {
      dispatch(actions.async.selectClinic(api, props.location?.state?.selectedClinicId));
    }
  }, [props.location?.state?.selectedClinicId]);

  function handleSelectTab(event, newValue) {
    trackMetric(tabs[newValue]?.metric, { clinicId: selectedClinicId, source: 'Workspace table' });
    setSelectedTab(newValue);
    dispatch(push(`/clinic-workspace/${tabs[newValue].name}`));
  }

  return (
    <>
      <ClinicWorkspaceHeader api={api} trackMetric={trackMetric} />

      <Box id="clinic-workspace" sx={{ alignItems: 'center' }} variant="containers.largeBordered" mb={9}>
        <Element name="workspaceTabsTop" />
        <TabGroup
          aria-label="Clinic workspace tabs"
          id="clinic-workspace-tabs"
          variant="horizontal"
          tabs={tabs}
          value={selectedTab}
          onChange={handleSelectTab}
          themeProps={{
            panel: {
              p: 4,
              pb: 0,
              sx: {
                minHeight: '10em',
              },
            },
          }}
        >
          <Box id="patientsTab">
            {selectedTab === tabIndices[TAB.PATIENTS] && <ClinicPatients key={clinic?.id} {...props} />}
          </Box>

          <Box id="deviceIssuesTab">
            {selectedTab === tabIndices[TAB.DEVICE_ISSUES] && <DeviceIssues key={clinic?.id} {...props} />}
          </Box>

          <Box id="tideDashboardTab">
            {selectedTab === tabIndices[TAB.TIDE_DASHBOARD] && <TideDashboardV2 key={clinic?.id} {...props} />}
          </Box>

          <Box id="invitesTab">
            {selectedTab === tabIndices[TAB.INVITES] && <PatientInvites {...props} />}
          </Box>

          <Box id="prescriptionsTab">
            {selectedTab === tabIndices[TAB.PRESCRIPTIONS] && <Prescriptions {...props} />}
          </Box>
        </TabGroup>
      </Box>
    </>
  );
};

ClinicWorkspace.propTypes = {
  api: PropTypes.object.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default withTranslation()(ClinicWorkspace);
