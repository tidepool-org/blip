import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import PropTypes from 'prop-types';
import { Box, Flex, Card } from 'theme-ui';
import { Body1 } from '../../components/elements/FontStyles';

import { async, sync } from '../../redux/actions';
import { getClinicsForClinician } from '../../redux/actions/async';
import * as ErrorMessages from '../../redux/constants/errorMessages';
import MultiplePatientError from './MultiplePatientError';
import NoPatientMatch from './NoPatientMatch';
import NoClinicsError from './NoClinicsError';

const SmartOnFhirLayout = ({ children }) => (
  <Flex sx={{ justifyContent: 'center', alignItems: 'center' }}>
    <Box sx={{ maxWidth: '600px', width: '100%', p: 3 }}>
      <Card sx={{ p: 4, boxShadow: 'small', borderRadius: 'default' }}>
        {children}
      </Card>
    </Box>
  </Flex>
);

SmartOnFhirLayout.propTypes = {
  children: PropTypes.node.isRequired
};

export const SmartOnFhir = (props) => {
  const { api, window: windowObj = window, trackMetric } = props;

  const smartOnFhirData = useSelector(state => state.blip.smartOnFhirData);
  const smartCorrelationId = useSelector(state => state.blip.smartCorrelationId);
  const working = useSelector(state => state.blip.working);
  const loggedInUserId = useSelector(state => state.blip.loggedInUserId);

  const dispatch = useDispatch();
  const fetchPatients = useCallback((api, params, callback) =>
    dispatch(async.fetchPatients(api, params, callback)),
    [dispatch]
  );
  const setSmartCorrelationId = useCallback((correlationId) =>
    dispatch(sync.setSmartCorrelationId(correlationId)),
    [dispatch]
  );
  const navigateTo = useCallback((path) =>
    dispatch(push(path)),
    [dispatch]
  );
  const getClinics = useCallback((api, clinicianId, callback) =>
    dispatch(getClinicsForClinician(api, clinicianId, {}, callback)),
    [dispatch]
  );

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleError = useCallback((errorMessage, metricName = null) => {
    if (metricName) {
      trackMetric(metricName);
    }
    setError(errorMessage);
    setIsProcessing(false);
  }, [trackMetric]);

  // Hide Zendesk widget in Smart-on-FHIR mode
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max (50 * 100ms)
    let timeoutId;

    const checkZendesk = () => {
      if (windowObj.zE) {
        windowObj.zE('webWidget', 'hide');
        return;
      }

      attempts++;
      if (attempts < maxAttempts) {
        timeoutId = setTimeout(checkZendesk, 100);
      }
    };

    checkZendesk();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [windowObj]);
  useEffect(() => {
    if (smartOnFhirData && !isProcessing && !working.fetchingPatients.inProgress && !error) {
      setIsProcessing(true);

      let correlationId = smartCorrelationId;

      if (!correlationId) {
        correlationId = windowObj.sessionStorage.getItem('smart_correlation_id');

        if (correlationId) {
          setSmartCorrelationId(correlationId);
        } else {
          handleError(ErrorMessages.ERR_SMARTONFHIR_MISSING_CORRELATION_ID);
          return;
        }
      }

       getClinics(api, loggedInUserId, (err, clinics) => {
         if (err) {
           handleError(ErrorMessages.ERR_SMARTONFHIR_CLINICIAN_NO_CLINICS, 'Direct Connect Clinics Fetch Failure');
           return;
         }
         if (!clinics || clinics.length === 0) {
           handleError(ErrorMessages.ERR_SMARTONFHIR_CLINICIAN_NO_CLINICS, 'Direct Connect Clinician No Clinics');
           return;
         }

         const patientInfo = smartOnFhirData.patients?.[correlationId];
         if (!patientInfo) {
           handleError(ErrorMessages.ERR_SMARTONFHIR_PATIENT_INFO_NOT_FOUND);
           return;
         }

         const { mrn, dob } = patientInfo;
         if (!mrn) {
           handleError(ErrorMessages.ERR_SMARTONFHIR_MRN_NOT_FOUND);
           return;
         }
         if (!dob) {
           handleError(ErrorMessages.ERR_SMARTONFHIR_DOB_NOT_FOUND);
           return;
         }

          fetchPatients(api, { mrn, birthDate: dob }, (err, results) => {
            if (err) {
              handleError(ErrorMessages.ERR_SMARTONFHIR_FETCHING_PATIENT, 'Direct Connect Patient Lookup Failure');
              return;
            }
            if (!results || results.length === 0) {
              handleError(ErrorMessages.ERR_SMARTONFHIR_NO_PATIENTS_FOUND, 'Direct Connect Patient Not Found');
              return;
            }
            if (results.length > 1) {
              handleError(ErrorMessages.ERR_SMARTONFHIR_MULTIPLE_PATIENTS_FOUND, 'Direct Connect Multiple Patients Found');
              return;
            }

            const patient = results[0]?.patient;
            if (!patient || !patient.id) {
              handleError('Invalid patient data received', 'Direct Connect Patient Lookup Failure');
              return;
            }

            trackMetric('Direct Connect Patient Lookup Success');
            navigateTo(`/patients/${patient.id}/data`);
          });
       });
     }
   }, [smartOnFhirData, isProcessing, working.fetchingPatients.inProgress, api, fetchPatients, navigateTo, error, smartCorrelationId, setSmartCorrelationId, windowObj, trackMetric, loggedInUserId, getClinics, handleError]);

  if (isProcessing || working.fetchingPatients.inProgress) {
    return (
      <SmartOnFhirLayout>
        <Box sx={{ textAlign: 'center' }}>
          <Body1>{ErrorMessages.ERR_SMARTONFHIR_LOADING_PATIENT_DATA}</Body1>
        </Box>
      </SmartOnFhirLayout>
    );
  }

  if (error) {
    const isMultiplePatientError = error === ErrorMessages.ERR_SMARTONFHIR_MULTIPLE_PATIENTS_FOUND;
    const isNoPatientMatchError = error === ErrorMessages.ERR_SMARTONFHIR_NO_PATIENTS_FOUND;
    const isNoClinicsError = error === ErrorMessages.ERR_SMARTONFHIR_CLINICIAN_NO_CLINICS;
    const isCustomError = isMultiplePatientError || isNoPatientMatchError || isNoClinicsError;

    return (
      <SmartOnFhirLayout>
        <Box sx={{ color: isCustomError ? 'text.primary' : 'feedback.danger' }}>
          {isMultiplePatientError ? (
            <MultiplePatientError />
          ) : isNoPatientMatchError ? (
            <NoPatientMatch />
          ) : isNoClinicsError ? (
            <NoClinicsError />
          ) : (
            <Body1>Error: {error}</Body1>
          )}
        </Box>
      </SmartOnFhirLayout>
    );
  }

  return (
    <SmartOnFhirLayout>
      <Box sx={{ textAlign: 'center' }}>
        <Body1>{ErrorMessages.ERR_SMARTONFHIR_INITIALIZING}</Body1>
      </Box>
    </SmartOnFhirLayout>
  );
};

SmartOnFhir.propTypes = {
  api: PropTypes.object.isRequired,
  window: PropTypes.object,
  trackMetric: PropTypes.func.isRequired,
};

export default SmartOnFhir;
