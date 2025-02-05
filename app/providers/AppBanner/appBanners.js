import React from 'react';
import { push } from 'connected-react-router';

import i18next from '../../core/language';
import { async } from '../../redux/actions';
import api from '../../core/api';
import { resendEmailVerification } from '../../redux/actions/async';
import { URL_SHARE_DATA_INFO, URL_TIDEPOOL_PLUS_CONTACT_SALES } from '../../core/constants';
import { ResendDataSourceConnectRequestDialog } from '../../components/clinic/ResendDataSourceConnectRequestDialog';
import PatientEmailModal from '../../components/datasources/PatientEmailModal';

const t = i18next.t.bind(i18next);

const pathRegexes = {
  clinicWorkspace: /^\/clinic-workspace/,
  patientData: /^\/patients\/\S+\/data/,
};

// const bannerMetricsArgs = {
//   donateBanner: ['Big Data banner displayed'],
// };

export const appBanners = [
  {
    id: 'dataSourceJustConnected',
    variant: 'info',
    priority: 0,
    context: ['patient'],
    paths: [pathRegexes.patientData],
    getProps: provider => ({
      label: t('Data Source Just Connected banner'),
      title: t('Data from {{displayName}} is on its way. This usually takes a few minutes but occasionally takes a bit longer.', provider),
      show: {
        metric: 'Data Source Just Connected banner displayed',
        metricProps: { providerName: provider?.dataSourceFilter?.providerName },
      },
      dismiss: {
        metric: 'Data Source Just Connected banner dismissed',
        metricProps: { providerName: provider?.dataSourceFilter?.providerName }
      },
    }),
  },

  {
    id: 'dataSourceReconnect',
    variant: 'warning',
    priority: 1,
    context: ['patient'],
    paths: [pathRegexes.patientData],
    getProps: (dispatch, provider = {}) => ({
      label: t('Data Source Reconnect banner'),
      message: t('Tidepool is no longer receiving data from your {{displayName}} account.', provider),
      show: {
        metric: 'Displayed Data Source Reconnect banner displayed',
        metricProps: { providerName: provider?.dataSourceFilter?.providerName },
      },
      action: {
        text: t('Reconnect my Account'),
        metric: 'Data Source Reconnect banner clicked',
        handler: ({ id, restrictedTokenCreate, dataSourceFilter }) => dispatch(async.connectDataSource(api, id, restrictedTokenCreate, dataSourceFilter)),
      },
      dismiss: {
        metric: 'Data Source Reconnect banner dismissed',
        metricProps: { providerName: provider?.dataSourceFilter?.providerName }
      },
    }),
  },

  {
    id: 'uploader',
    variant: 'info',
    priority: 2,
    context: ['patient'],
    paths: [pathRegexes.patientData],
    getProps: () => ({
      label: t('Uploader banner'),
      message: t('If you\'ll be uploading your devices at home, download the latest version of Tidepool Uploader.'),
      show: {
        metric: 'Uploader banner displayed',
      },
      action: {
        text: t('Download Latest'),
        metric: 'clicked get started on Uploader Install banner',
        handler: () => window.open('https://www.tidepool.org/download', '_blank'),
      },
      messageLink: {
        text: t('See the Install Guide'),
        metric: 'clicked learn more on Uploader Install banner',
        handler: () => window.open('https://support.tidepool.org/hc/en-us/articles/360029368552-Installing-Tidepool-Uploader', '_blank'),
      },
      dismiss: {
        metric: 'dismiss Uploader Install banner',
      },
    }),
  },

  {
    id: 'shareData',
    variant: 'info',
    priority: 3,
    context: ['patient'],
    paths: [pathRegexes.patientData],
    maxUniqueDaysShown: 3,
    getProps: (dispatch, loggedInUserId) => ({
      label: t('Share Data banner'),
      message: t('New Tidepool Account? Share Your Data with your healthcare team.'),
      show: {
        metric: 'Share Data banner displayed',
      },
      action: {
        text: t('Get Started'),
        metric: 'clicked get started on Share Data banner',
        handler: () => dispatch(push(`/patients/${loggedInUserId}/share`)),
      },
      messageLink: {
        text: t('Learn More'),
        metric: 'clicked learn more Share Data banner',
        handler: () => window.open(URL_SHARE_DATA_INFO, '_blank'),
      },
      dismiss: {
        metric: 'dismiss Share Data banner',
      },
    }),
  },

  {
    id: 'updateType',
    variant: 'info',
    priority: 5,
    context: ['patient'],
    paths: [pathRegexes.patientData],
    getProps: (dispatch, loggedInUserId) => ({
      label: t('Update Type banner'),
      message: t('Complete your profile.'),
      show: {
        metric: 'Update Type banner displayed',
      },
      action: {
        text: t('Update My Profile'),
        metric: 'clicked get started on Update Type banner',
        handler: () => dispatch(push(`/patients/${loggedInUserId}/profile`)),
      },
      messageLink: {
        text: t('Add your birthday, diagnosis date, and type'),
        metric: 'clicked learn more Update Type banner',
        handler: () => dispatch(push(`/patients/${loggedInUserId}/profile`)),
        trackInteraction: true,
      },
      dismiss: {
        metric: 'dismiss Update Type banner',
      },
    }),
  },

  {
    id: 'patientLimit',
    variant: 'warning',
    priority: 6,
    context: ['clinic'],
    paths: [pathRegexes.clinicWorkspace],
    getProps: clinic => ({
      label: t('Patient Limit banner'),
      message: t('{{name}} has reached the maximum number of patient accounts.', clinic),
      show: {
        metric: 'Patient limit banner: displayed',
      },
      action: {
        text: t('Contact us to unlock plans'),
        metric: 'Patient limit banner: contact sales clicked',
        handler: () => window.open(URL_TIDEPOOL_PLUS_CONTACT_SALES, '_blank'),
      },
      dismiss: {
        metric: 'Patient limit banner: dismissed',
      },
    }),
  },

  {
    id: 'dataSourceReconnectInvite',
    variant: 'warning',
    priority: 7,
    context: ['clinic'],
    paths: [pathRegexes.patientData],
    getProps: (dispatch, clinicId, patient = {}, provider = {}) => ({
      label: t('Data Source Reconnect Invite banner'),
      message: t('Tidepool is no longer receiving data from your patient\'s {{displayName}} account. Would you like to email an invite to reconnect?', provider),
      show: {
        metric: 'Displayed Data Source Reconnect Invite banner displayed',
        metricProps: { providerName: provider?.dataSourceFilter?.providerName },
      },
      action: {
        text: t('Invite to Reconnect'),
        processingText: t('Sending Reconnection Email'),
        metric: 'Data Source Reconnect Invite banner clicked',
        handler: () => dispatch(async.sendPatientDataProviderConnectRequest(api, clinicId, patient.id, provider?.dataSourceFilter?.providerName)),
        working: {
          key: 'sendingPatientDataProviderConnectRequest',
          successMessage: t('Reconnection email sent to {{email}}', patient),
          errorMessage: t('Error sending reconnection email'),
        },
        modal: {
          component: ResendDataSourceConnectRequestDialog,
          props: { api, patient, providerName: provider?.dataSourceFilter?.providerName, t },
        }
      },
      dismiss: {
        metric: 'Data Source Reconnect Invite banner dismissed',
        metricProps: { providerName: provider?.dataSourceFilter?.providerName }
      },
    }),
  },

  {
    id: 'addEmail',
    variant: 'info',
    priority: 8,
    context: ['clinic'],
    paths: [pathRegexes.patientData],
    showIcon: false,
    getProps: (formikContext, patient = {}) => ({
      label: t('Add Email banner'),
      message: t('Add {{fullName}}\'s email to invite them to upload and view data from home', patient),
      show: {
        metric: 'Banner displayed Add Email',
      },
      action: {
        text: t('Add Email'),
        metric: 'Clicked Banner Add Email',
        metricProps: { source: 'none', location: 'banner' },
        handler: () => formikContext.handleSubmit(),
        modal: {
          component: PatientEmailModal,
          confirmHandlerProp: 'onSubmit',
          props: { patient },
        },
        working: {
          key: 'updatingClinicPatient',
          successMessage: t('Email added and invitation sent to {{email}}', formikContext.values),
          errorMessage: t('Error adding patient email'),
        },
      },
      dismiss: {
        metric: 'Add Email banner dismissed',
      },
    }),
  },

  {
    id: 'sendVerification',
    variant: 'info',
    priority: 9,
    context: ['clinic'],
    paths: [pathRegexes.patientData],
    showIcon: false,
    getProps: (dispatch, patient = {}) => ({
      label: t('Send Verification banner'),
      message: t('Resend {{fullName}}\'s email to invite them to upload and view data from home', patient),
      show: {
        metric: 'Banner displayed Send Verification',
      },
      action: {
        text: t('Resend Verification Email'),
        processingText: t('Resending Verification Email'),
        metric: 'Clicked Banner Resend Verification',
        metricProps: { source: 'none', location: 'banner' },
        handler: () => dispatch(resendEmailVerification(api, patient.email)),
        working: {
          key: 'resendingEmailVerification',
          successMessage: t('Verification email sent to {{email}}', patient),
          errorMessage: t('Error sending verification email'),
        },
      },
      dismiss: {
        metric: 'Send Verification banner banner dismissed',
      },
    }),
  },
];
