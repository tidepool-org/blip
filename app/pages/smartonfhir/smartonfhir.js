import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { push } from 'connected-react-router';
import PropTypes from 'prop-types';

import { async } from '../../redux/actions';

export const SmartOnFhir = (props) => {
  const {
    api,
    fetchPatients,
    push,
    smartOnFhirData,
    working,
    window: windowObj = window, // Default to global window if not provided
  } = props;

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (smartOnFhirData && !isProcessing && !working.fetchingPatients.inProgress && !error) {
      setIsProcessing(true);

      const correlationId = windowObj.sessionStorage.getItem('smart_correlation_id');
      if (!correlationId) {
        setError('Missing correlation ID');
        setIsProcessing(false);
        return;
      }

      const patientInfo = smartOnFhirData.patients?.[correlationId];
      if (!patientInfo) {
        setError('Patient information not found in token');
        setIsProcessing(false);
        return;
      }

      const { mrn } = patientInfo;
      if (!mrn) {
        setError('MRN not found in patient information');
        setIsProcessing(false);
        return;
      }

      // Fetch the patient by MRN
      // TODO: add dob when available
      fetchPatients(api, { mrn }, (err, results) => {
        if (err) {
          setError(`Error fetching patient: ${err.message}`);
          setIsProcessing(false);
          return;
        }
        if (!results || results.length === 0) {
          setError('No patients found with the provided MRN');
          setIsProcessing(false);
          return;
        }
        if (results.length > 1) {
          setError('Multiple patients found with the provided MRN');
          setIsProcessing(false);
          return;
        }

        const { patient } = results[0];
        push(`/patients/${patient.id}/data`);
      });
    }
  }, [smartOnFhirData, isProcessing, working.fetchingPatients.inProgress, api, fetchPatients, push, error, windowObj.sessionStorage]);

  if (isProcessing || working.fetchingPatients.inProgress) {
    return (
      <div className="container-box-outer">
        <div className="container-box-inner">
          <div className="container-box-content">
            <div className="loading-message">
              <p>Loading patient data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-box-outer">
        <div className="container-box-inner">
          <div className="container-box-content">
            <div className="error-message">
              <p>Error: {error}</p>
              <p>Please contact your healthcare provider for assistance.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-box-outer">
      <div className="container-box-inner">
        <div className="container-box-content">
          <div className="loading-message">
            <p>Initializing Smart on FHIR...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

SmartOnFhir.propTypes = {
  api: PropTypes.object.isRequired,
  fetchPatients: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  smartOnFhirData: PropTypes.object,
  working: PropTypes.object.isRequired,
  window: PropTypes.object,
};

export function mapStateToProps(state) {
  return {
    smartOnFhirData: state.blip.smartOnFhirData,
    working: state.blip.working,
  };
}

export function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    fetchPatients: async.fetchPatients,
    push,
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SmartOnFhir);
