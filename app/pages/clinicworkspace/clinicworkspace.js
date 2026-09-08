import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useLocation, useHistory } from 'react-router-dom';
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
import TideDashboardV2 from './TideDashboardV2';
import ConnectionIssues from './ConnectionIssues';
import Prescriptions from '../prescription/Prescriptions';
import { PatientInvites } from '../share';
import * as actions from '../../redux/actions';
import { resetTideDashboardState } from './TideDashboardV2/tideDashboardSlice';

const TAB = {
  PATIENTS: 'patients',
  CONNECTION_ISSUES: 'connection-issues',
  TIDE_DASHBOARD: 'tide-dashboard',
  INVITES: 'invites',
  PRESCRIPTIONS: 'prescriptions',
};

const useTabOptions = (tabParam) => {
  const { t } = useTranslation();
  const { showPrescriptions, showTideDashboard } = useFlags();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const patientInvites = values(clinic?.patientInvites);

  // If the LD flag is false but the tabParam is set, the user is probably
  // authorized but LD is still fetching. So we show the tab anyway

  const showPrescriptionsTab = (
    showPrescriptions ||
    tabParam === TAB.PRESCRIPTIONS
  );

  const showTideDashboardTab = (
    showTideDashboard ||
    clinic?.entitlements?.tideDashboard ||
    tabParam === TAB.TIDE_DASHBOARD
  );

  const tabOptions = useMemo(() => (
    [
      {
        slug: TAB.PATIENTS,
        label: t('Patient List'),
        metric: 'Clinic - View patient list',
      },
      {
        slug: TAB.CONNECTION_ISSUES,
        label: t('Connection Issues'),
        metric: 'Clinic - View connection issues',
      },
      showTideDashboardTab && {
        slug: TAB.TIDE_DASHBOARD,
        label: t('TIDE Dashboard'),
        metric: 'Clinic - View TIDE Dashboard',
      },
      {
        slug: TAB.INVITES,
        label: t('Invites ({{count}})', { count: patientInvites.length }),
        metric: 'Clinic - View patient invites',
      },
      showPrescriptionsTab && {
        slug: TAB.PRESCRIPTIONS,
        label: t('Tidepool Loop Start Orders'),
        metric: 'Clinic - View prescriptions',
      },
    ].filter(Boolean)
  ), [showPrescriptionsTab, showTideDashboardTab, patientInvites.length, t]);

  return tabOptions;
};

const tabThemeProps = { panel: { p: 4, pb: 0, sx: { minHeight: '10em' } } };

const Content = (props) => {
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);

  switch (props.selectedTab) {
    case TAB.PATIENTS:
      return <ClinicPatients key={clinic?.id} {...props} />;
    case TAB.CONNECTION_ISSUES:
      return <ConnectionIssues key={clinic?.id} {...props} />;
    case TAB.TIDE_DASHBOARD:
      return <TideDashboardV2 key={clinic?.id} {...props} />;
    case TAB.INVITES:
      return <PatientInvites {...props} />;
    case TAB.PRESCRIPTIONS:
      return <Prescriptions {...props} />;
    default:
      return null;
  }
};

export const ClinicWorkspace = (props) => {
  const { api, trackMetric } = props;
  const dispatch = useDispatch();
  const { tab: tabParam } = useParams();
  const location = useLocation();
  const history = useHistory();
  const tabOptions = useTabOptions(tabParam);

  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const currentPatientInViewId = useSelector((state) => state.blip.currentPatientInViewId);
  const { fetchingPatientInvites } = useSelector((state) => state.blip.working);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);

  const tabIndices = useMemo(() => Object.fromEntries(tabOptions.map(({ slug }, i) => [slug, i])), [tabOptions]);

  const selectedTabIndex = get(tabIndices, tabParam, 0);
  const selectedTab = tabOptions[selectedTabIndex]?.slug;

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
    const newTab = tabOptions[newValue];

    if (newTab?.slug === TAB.TIDE_DASHBOARD) {
      dispatch(resetTideDashboardState());
    }

    trackMetric(newTab?.metric, { clinicId: selectedClinicId, source: 'Workspace table' });
    history.push({ pathname: `/clinic-workspace/${newTab.slug}`, search: location.search });
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
          tabs={tabOptions}
          value={selectedTabIndex}
          onChange={handleSelectTab}
          themeProps={tabThemeProps}
        >
          {tabOptions.map(({ slug }) => (
            <Box key={slug} id={`${slug}-tab-panel-content`}>
              {selectedTab === slug && <Content selectedTab={slug} {...props} />}
            </Box>
          ))}
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
