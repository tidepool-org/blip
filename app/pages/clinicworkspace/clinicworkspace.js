import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { push } from 'connected-react-router';
import { translate } from 'react-i18next';
import includes from 'lodash/includes'
import filter from 'lodash/filter'
import forEach from 'lodash/forEach';
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import map from 'lodash/map'
import values from 'lodash/values'
import { Box } from 'rebass/styled-components';

import TabGroup from '../../components/elements/TabGroup';
import ClinicProfile from '../../components/clinic/ClinicProfile';
import Prescriptions from '../prescription/Prescriptions';
import { PatientInvites } from '../share';
import PeopleTable from '../../components/peopletable';
import * as actions from '../../redux/actions';
import config from '../../config';
import { useIsFirstRender } from '../../core/hooks';
import { useToasts } from '../../providers/ToastProvider';

export const ClinicWorkspace = (props) => {
  const { t, api, trackMetric } = props;
  const isFirstRender = useIsFirstRender();
  const dispatch = useDispatch();
  const { set: setToast } = useToasts();
  const { tab } = useParams();
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const currentPatientInViewId = useSelector((state) => state.blip.currentPatientInViewId);
  const { deletingPatientFromClinic, fetchingPatientInvites, fetchingPatientsForClinic } = useSelector((state) => state.blip.working);
  const clinics = useSelector((state) => state.blip.clinics);
  const clinic = get(clinics, selectedClinicId);
  const patientInvites = filter(values(clinic?.patients), patient => patient.status === 'pending');
  const [selectedPatient, setSelectedPatient] = useState();
  const isClinicAdmin = includes(get(clinic, ['clinicians', loggedInUserId, 'roles'], []), 'CLINIC_ADMIN');
  const [patientFetchOptions, setPatientFetchOptions] = useState({ limit: 8, search: 'tidepool.org', offset: 2 });
  console.log('patientFetchOptions', patientFetchOptions);
  const tabIndices = {
    patients: 0,
    invites: 1,
    prescriptions: 2,
  }

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

  if (config.RX_ENABLED) {
    tabs.push({
      name: 'prescriptions',
      label: t('Prescriptions'),
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
        {
          workingState: fetchingPatientsForClinic,
          action: actions.async.fetchPatientsForClinic.bind(null, api, clinic.id, patientFetchOptions),
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
    const { inProgress, completed, notification } = deletingPatientFromClinic;

    if (!isFirstRender && !inProgress) {

      if (completed) {
        setToast({
          message: t('{{name}} has been removed from the clinic.', {
            name: get(selectedPatient, 'fullName', t('This patient')),
          }),
          variant: 'success',
        });
      }

      if (completed === false) {
        setToast({
          message: get(notification, 'message'),
          variant: 'danger',
        });
      }

      setSelectedPatient(null);
    }
  }, [deletingPatientFromClinic]);

  useEffect(() => {
    dispatch(actions.worker.dataWorkerRemoveDataRequest(null, currentPatientInViewId));
    dispatch(actions.sync.clearPatientInView());
  }, []);

  function handleSelectTab(event, newValue) {
    trackMetric(tabs[newValue]?.metric, { clinicId: selectedClinicId, source: 'Workspace table' });
    setSelectedTab(newValue);
    dispatch(push(`/clinic-workspace/${tabs[newValue].name}`));
  }

  function handleRemovePatient(patientId, cb) {
    setSelectedPatient(get(clinic, ['patients', patientId]));
    dispatch(actions.async.deletePatientFromClinic(api, selectedClinicId, patientId, cb));
  }

  function clinicPatients() {
    const filteredPatients = filter(values(clinic?.patients), patient => !isEmpty(patient.id));

    return map(filteredPatients, patient => ({
      emails: [patient.email],
      permissions: patient.permissions,
      profile: {
        fullName: patient.fullName,
        patient: {
          birthday: patient.birthDate,
        },
      },
      userid: patient.id,
      username: patient.email,
      link: `/patients/${patient.id}/data`,
    }));
  }

  return (
    <>
      <ClinicProfile api={api} trackMetric={trackMetric} />

      <Box id="clinic-workspace" variant="containers.largeBordered">
        <TabGroup
          id="clinic-workspace-tabs"
          variant="horizontal"
          tabs={tabs}
          value={selectedTab}
          onChange={handleSelectTab}
          themeProps={{
            panel: {
              p: 4,
              pb: 6,
              minHeight: '10em',
            },
          }}
        >
          <Box id="patientsTab">
            {selectedTab === 0 && (
              <PeopleTable
                layout="tab"
                people={clinicPatients()}
                selectedClinicId={selectedClinicId}
                trackMetric={trackMetric}
                onRemovePatient={isClinicAdmin ? handleRemovePatient : undefined}
              />
            )}
          </Box>

          <Box id="invitesTab">
            {selectedTab === 1 && <PatientInvites {...props} />}
          </Box>

          <Box id="prescriptionsTab">
            {config.RX_ENABLED && selectedTab === 2 && <Prescriptions {...props} />}
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

export default translate()(ClinicWorkspace);
