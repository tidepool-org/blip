import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux'
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { translate } from 'react-i18next';
import filter from 'lodash/filter'
import forEach from 'lodash/forEach';
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import keys from 'lodash/keys';
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

export const ClinicWorkspace = (props) => {
  const { t, api, trackMetric } = props;
  const dispatch = useDispatch();
  const { tab } = useParams();
  const history = useHistory();
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const { fetchingPatientInvites, fetchingPatientsForClinic } = useSelector((state) => state.blip.working);
  const clinics = useSelector((state) => state.blip.clinics);
  const clinic = get(clinics, selectedClinicId);
  const patientInvites = filter(values(clinic?.patients), patient => patient.status === 'pending');

  const tabIndices = {
    patients: 0,
    invites: 1,
    prescriptions: 2,
  }

  const tabs = [
    {
      name: 'patients',
      label: t('Patient List'),
    },
    {
      name: 'invites',
      label: t('Invites ({{count}})', { count: patientInvites.length }),
    },
  ];

  if (config.RX_ENABLED) {
    tabs.push({
      name: 'prescriptions',
      label: t('Prescriptions'),
    });
  }

  const [selectedTab, setSelectedTab] = useState(get(tabIndices, tab, 0));

  useEffect(() => {
    if (trackMetric) {
      trackMetric('Clinic - View clinic workspace', {
        selectedTab,
      });
    }
  }, [selectedTab]);

  useEffect(() => {
    if (tab && tabIndices[tab] !== selectedTab) {
      setSelectedTab(tabIndices[tab]);
    }
  }, [tab]);

  useEffect(() => {
    if(loggedInUserId && keys(clinics).length && !selectedClinicId) {
      dispatch(actions.sync.selectClinic(keys(clinics)[0]));
    }
  }, [
    clinics,
    loggedInUserId,
    selectedClinicId,
  ]);

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
          action: actions.async.fetchPatientsForClinic.bind(null, api, clinic.id),
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
    if(loggedInUserId && keys(clinics).length && !selectedClinicId) {
      dispatch(actions.sync.selectClinic(keys(clinics)[0]));
    }
  }, [
    clinics,
    loggedInUserId,
    selectedClinicId,
  ]);

  function handleSelectTab(event, newValue) {
    setSelectedTab(newValue);
    history.push({
      pathname: `/clinic-workspace/${tabs[newValue].name}`,
    });
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

  const boundActions = bindActionCreators({
    deletePatientFromClinic: actions.async.deletePatientFromClinic,
  }, dispatch);

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
          <Box>
            {selectedTab === 0 && (
              <PeopleTable
                layout="tab"
                people={clinicPatients()}
                trackMetric={trackMetric}
                onRemovePatient={boundActions.deletePatientFromClinic.bind(null, api, selectedClinicId)}
              />
            )}
          </Box>

          <Box>
            {selectedTab === 1 && <PatientInvites {...props} />}
          </Box>

          {config.RX_ENABLED && (
            <Box>
              {selectedTab === 2 && <Prescriptions {...props} />}
            </Box>
          )}
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
