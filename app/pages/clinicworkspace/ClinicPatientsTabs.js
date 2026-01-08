import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { push } from 'connected-react-router';
import { withTranslation } from 'react-i18next';
import forEach from 'lodash/forEach';
import get from 'lodash/get';
import values from 'lodash/values';
import { Box } from 'theme-ui';
import { Element } from 'react-scroll';
import { useFlags } from 'launchdarkly-react-client-sdk';

import TabGroup from '../../components/elements/TabGroup';
import ClinicPatients from './ClinicPatients';
import Prescriptions from '../prescription/Prescriptions';
import { PatientInvites } from '../share';
import * as actions from '../../redux/actions';

export const ClinicPatientsTabs = (props) => {
  const { t, api, trackMetric } = props;
  const dispatch = useDispatch();
  const { tab } = useParams();
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const currentPatientInViewId = useSelector((state) => state.blip.currentPatientInViewId);
  const { fetchingPatientInvites } = useSelector((state) => state.blip.working);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const patientInvites = values(clinic?.patientInvites);
  const { showPrescriptions } = useFlags();

  const tabIndices = {
    patients: 0,
    invites: 1,
    prescriptions: 2,
  };

  const tabs = [
    {
      name: 'patients',
      label: t('Patient List'),
      metric: 'Clinic - View patient list',
    },
    {
      name: 'invites',
      label: t('Invites ({{count}})', { count: patientInvites.length }),
      metric: 'Clinic - View patient invites',
    },
  ];

  if (showPrescriptions) {
    tabs.push({
      name: 'prescriptions',
      label: t('Tidepool Loop Start Orders'),
      metric: 'Clinic - View prescriptions',
    });
  }

  const [selectedTab, setSelectedTab] = useState(get(tabIndices, tab, 0));

  useEffect(() => {
    if (tab && tabIndices[tab] !== selectedTab) {
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

  function handleSelectTab(_event, newValue) {
    trackMetric(tabs[newValue]?.metric, { clinicId: selectedClinicId, source: 'Workspace table' });
    setSelectedTab(newValue);
    dispatch(push(`/clinic-workspace/${tabs[newValue].name}`));
  }

  return (
    <Box id="clinic-patients-tabs" sx={{ alignItems: 'center' }}>
      <Element name="workspaceTabsTop" />
      <TabGroup
        aria-label="Clinic patients tabs"
        id="clinic-patients-tabs-group"
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
          {selectedTab === 0 && <ClinicPatients key={clinic?.id} {...props} />}
        </Box>

        <Box id="invitesTab">
          {selectedTab === 1 && <PatientInvites {...props} />}
        </Box>

        <Box id="prescriptionsTab">
          {selectedTab === 2 && <Prescriptions {...props} />}
        </Box>
      </TabGroup>
    </Box>
  );
};

ClinicPatientsTabs.propTypes = {
  api: PropTypes.object.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default withTranslation()(ClinicPatientsTabs);
