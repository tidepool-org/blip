import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import PropTypes from 'prop-types';
import { Box, Flex, Card } from 'theme-ui';
import { Body1 } from '../../components/elements/FontStyles';

import { async, sync } from '../../redux/actions';
import * as ErrorMessages from '../../redux/constants/errorMessages';
import MultiplePatientError from './MultiplePatientError';
import NoPatientMatch from './NoPatientMatch';

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
  const { api, window: windowObj = window } = props;

  const smartOnFhirData = useSelector(state => state.blip.smartOnFhirData);
  const smartCorrelationId = useSelector(state => state.blip.smartCorrelationId);
  const working = useSelector(state => state.blip.working);

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

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Hide Zendesk widget in Smart-on-FHIR mode
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max (50 * 100ms)

    const checkZendesk = () => {
      if (window.zE) {
        window.zE('webWidget', 'hide');
        return;
      }

      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(checkZendesk, 100);
      }
    };

    checkZendesk();
  }, []);

  useEffect(() => {
    if (smartOnFhirData && !isProcessing && !working.fetchingPatients.inProgress && !error) {
      setIsProcessing(true);

      let correlationId = smartCorrelationId;

      if (!correlationId) {
        correlationId = windowObj.sessionStorage.getItem('smart_correlation_id');

        if (correlationId) {
          setSmartCorrelationId(correlationId);
        } else {
          setError(ErrorMessages.ERR_SMARTONFHIR_MISSING_CORRELATION_ID);
          setIsProcessing(false);
          return;
        }
      }

      const patientInfo = smartOnFhirData.patients?.[correlationId];
      if (!patientInfo) {
        setError(ErrorMessages.ERR_SMARTONFHIR_PATIENT_INFO_NOT_FOUND);
        setIsProcessing(false);
        return;
      }

      const { mrn, dob } = patientInfo;
      if (!mrn) {
        setError(ErrorMessages.ERR_SMARTONFHIR_MRN_NOT_FOUND);
        setIsProcessing(false);
        return;
      }
      if (!dob) {
        setError(ErrorMessages.ERR_SMARTONFHIR_DOB_NOT_FOUND);
        setIsProcessing(false);
        return;
      }

      fetchPatients(api, { mrn, birthDate: dob }, (err, results) => {
        if (err) {
          setError(ErrorMessages.ERR_SMARTONFHIR_FETCHING_PATIENT);
          setIsProcessing(false);
          return;
        }
        if (!results || results.length === 0) {
          setError(ErrorMessages.ERR_SMARTONFHIR_NO_PATIENTS_FOUND);
          setIsProcessing(false);
          return;
        }
        if (results.length > 1) {
          setError(ErrorMessages.ERR_SMARTONFHIR_MULTIPLE_PATIENTS_FOUND);
          setIsProcessing(false);
          return;
        }

        const patient = results[0]?.patient;
        if (!patient || !patient.id) {
          setError('Invalid patient data received');
          setIsProcessing(false);
          return;
        }
        navigateTo(`/patients/${patient.id}/data`);
      });
    }
  }, [smartOnFhirData, isProcessing, working.fetchingPatients.inProgress, api, fetchPatients, navigateTo, error, smartCorrelationId, setSmartCorrelationId, windowObj]);

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
    const isCustomError = isMultiplePatientError || isNoPatientMatchError;

    return (
      <SmartOnFhirLayout>
        <Box sx={{ color: isCustomError ? 'text.primary' : 'feedback.danger' }}>
          {isMultiplePatientError ? (
            <MultiplePatientError />
          ) : isNoPatientMatchError ? (
            <NoPatientMatch />
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
};

export default SmartOnFhir;
