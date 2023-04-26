/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { translate, Trans } from 'react-i18next';
import { push } from 'connected-react-router';
import { connect, useDispatch, useSelector } from 'react-redux';
import get from 'lodash/get';

import { URL_DEXCOM_CONNECT_INFO } from '../../core/constants';
import { useIsFirstRender } from '../../core/hooks';
import { async, sync } from '../../redux/actions';
import { useToasts } from '../../providers/ToastProvider';
import ResendDexcomConnectRequestDialog from '../clinic/ResendDexcomConnectRequestDialog';

export const DexcomBanner = translate()((props) => {
  const {
    api,
    clinicPatient,
    userIsCurrentPatient,
    dataSourceState,
    onClick,
    onClose,
    patient,
    selectedClinicId,
    trackMetric,
    t,
    push,
  } = props;

  const dispatch = useDispatch();
  const isFirstRender = useIsFirstRender();
  const { set: setToast } = useToasts();
  const [showResendDexcomConnectRequest, setShowResendDexcomConnectRequest] = useState(false);
  const { sendingPatientDexcomConnectRequest } = useSelector((state) => state.blip.working);

  const redirectToProfile = (source = 'banner') => {
    push(`/patients/${patient.userid}/profile?dexcomConnect=${source}`);
  };

  function handleAsyncResult(workingState, successMessage) {
    const { inProgress, completed, notification } = workingState;

    if (!isFirstRender && !inProgress) {
      if (completed) {
        setShowResendDexcomConnectRequest(false);
        dispatch(sync.dismissBanner('dexcom'));

        setToast({
          message: successMessage,
          variant: 'success',
        });
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
    handleAsyncResult(sendingPatientDexcomConnectRequest, t('Dexcom connection request to {{email}} has been resent.', {
      email: patient?.email,
    }));
  }, [sendingPatientDexcomConnectRequest]);

  const handleSendReconnectionEmail = () => {
    trackMetric('Clinic - Resend Dexcom connect email', { clinicId: selectedClinicId, dexcomConnectState: dataSourceState, source: 'banner' })
    setShowResendDexcomConnectRequest(true);
  };

  const handleSendReconnectionEmailConfirm = () => {
    trackMetric('Clinic - Resend Dexcom connect email confirm', { clinicId: selectedClinicId, source: 'banner' });
    dispatch(async.sendPatientDexcomConnectRequest(api, selectedClinicId, clinicPatient.id));
  };

  const handleDismiss = () => {
    onClose(clinicPatient?.id || patient?.userid);
    clinicPatient && dispatch(sync.dismissBanner('dexcom'));

    if (trackMetric) {
      trackMetric('dismiss Dexcom OAuth banner');
    }
  };

  const handleClickLearnMore = () => {
    if (trackMetric) {
      trackMetric('clicked learn more Dexcom OAuth banner');
    }
  };

  const handleSubmit = () => {
    onClick(clinicPatient?.id || patient?.userid);
    let metric = 'clicked get started on Dexcom banner';
    let source = 'banner';

    if (userIsCurrentPatient) {
      if (dataSourceState === 'error') {
        metric = 'clicked reconnect on Dexcom banner';
        source = 'reconnectBanner';
      }

      redirectToProfile(source);
    } else if (clinicPatient) {
      metric = 'clicked request reconnection on Dexcom banner';
      handleSendReconnectionEmail();
    }

    if (trackMetric) {
      trackMetric(metric);
    }
  }

  const getMessageText = () => {
    let text = (
      <Trans i18nKey="html.dexcom-banner-connect">
        Using Dexcom G5 Mobile on Android? See your data in Tidepool.
        <a
          className="message-link"
          target="_blank"
          rel="noreferrer noopener"
          href={URL_DEXCOM_CONNECT_INFO}
          onClick={handleClickLearnMore}
        >
          Learn More
        </a>
      </Trans>
    );

    if (dataSourceState === 'error') {
      text = clinicPatient
        ? (
            <>
              {t('Tidepool is no longer receiving CGM data for this account.')}<br />
              {t('Click \'Request Reconnection\' to send an email to the account owner enabling them to reconnect their Dexcom Clarity account to Tidepool.')}
            </>
        ) : (
          t('Tidepool is no longer receiving CGM data for your account.')
        );
    }

    return text;
  };

  const getButtonText = () => {
    let text = t('Get Started');

    if (dataSourceState === 'error') {
      text = userIsCurrentPatient
        ? t('Fix in My Data Sources')
        : t('Request Reconnection');
    }

    return text;
  };

  return (
    <>
      <div className='dexcomBanner container-box-outer'>
        <div className="container-box-inner">
          <div className="dexcomBanner-message">
            <div className="message-text" children={getMessageText()} />
          </div>

          <div className="dexcomBanner-action">
            <button onClick={handleSubmit}>{getButtonText()}</button>
          </div>

          <div className="dexcomBanner-close">
            <a href="#" className="close" onClick={handleDismiss}>&times;</a>
          </div>
        </div>
      </div>

      <ResendDexcomConnectRequestDialog
        api={api}
        onClose={() => setShowResendDexcomConnectRequest(false)}
        onConfirm={handleSendReconnectionEmailConfirm}
        open={showResendDexcomConnectRequest}
        patient={clinicPatient}
        t={t}
        trackMetric={trackMetric}
      />
    </>
  );
});

DexcomBanner.propTypes = {
  onClick: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  trackMetric: PropTypes.func.isRequired,
  clinicPatient: PropTypes.object,
  patient: PropTypes.object.isRequired,
  dataSourceState: PropTypes.string.isRequired,
  selectedClinicId: PropTypes.string,
  userIsCurrentPatient: PropTypes.bool,
};

export default connect(null, { push })(DexcomBanner);
