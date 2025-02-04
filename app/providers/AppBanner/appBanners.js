import { push } from 'connected-react-router';

import i18next from '../../core/language';
import { async } from '../../redux/actions';
import api from '../../core/api';
import personUtils from '../../core/personutils';
import { resendEmailVerification } from '../../redux/actions/async';

const t = i18next.t.bind(i18next);

// const bannerMetricsArgs = {
//   shareDataBanner: ['Share Data banner displayed'],
//   donateBanner: ['Big Data banner displayed'],
//   updateTypeBanner: ['Update Type banner displayed'],
// };

export const appBanners = [
  {
    id: 'dataSourceJustConnected',
    variant: 'info',
    priority: 0,
    context: ['patient'],
    paths: [/^\/patients\/\S+\/data/],
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
    paths: [/^\/patients\/\S+\/data/],
    getProps: (dispatch, provider) => ({
      label: t('Data Source Reconnect banner'),
      message: t('Tidepool is no longer receiving data from your {{displayName}} account.', provider),
      show: {
        metric: 'Displayed Data Source Reconnect banner displayed',
        metricProps: { providerName: provider?.dataSourceFilter?.providerName },
      },
      action: {
        text: t('Reconnect my Account'),
        metric: 'Data Source Reconnect banner clicked',
        handler: () => {
          if (provider) {
            const { id, restrictedTokenCreate, dataSourceFilter } = provider;
            return dispatch(async.connectDataSource(api, id, restrictedTokenCreate, dataSourceFilter));
          }
        },
      },
      dismiss: {
        metric: 'Data Source Reconnect banner dismissed',
        metricProps: { providerName: provider?.dataSourceFilter?.providerName }
      },
    }),
  },

  {
    id: 'uploader',
    priority: 2,
    context: ['patient'],
    paths: [/^\/patients\/\S+\/data/],
    getProps: () => ({
      label: t('Uploader banner'),
      message: t('If you\'ll be uploading your devices at home, download the latest version of Tidepool Uploader.'),
      show: {
        metric: 'Uploader banner displayed',
      },
      action: {
        text: t('Download Latest'),
        metric: 'clicked get started on Uploader Install banner',
        handler: () => window.open('https://www.tidepool.org/download'),
      },
      messageLink: {
        text: t('See the Install Guide'),
        metric: 'clicked learn more on Uploader Install banner',
        handler: () => window.open('https://support.tidepool.org/hc/en-us/articles/360029368552-Installing-Tidepool-Uploader'),
      },
      dismiss: {
        metric: 'dismiss Uploader Install banner',
      },
    }),
  },

  {
    id: 'addEmail',
    priority: 3,
    context: ['clinic'],
    paths: [/^\/patients\/\S+\/data/],
    showIcon: false,
    getProps: (dispatch, patient) => ({
      label: t('Add Email banner'),
      message: t('Add {{fullName}}\'s email to invite them to upload and view data from home', { fullName: personUtils.patientFullName(patient)}),
      show: {
        metric: 'Banner displayed Add Email',
      },
      action: {
        text: t('Add Email'),
        metric: 'Clicked Banner Add Email',
        metricProps: { source: 'none', location: 'banner' },
        handler: () => dispatch(push(`/patients/${patient?.userid}/profile#edit`)),
      },
      dismiss: {
        metric: 'Add Email banner dismissed',
      },
    }),
  },

  {
    id: 'sendVerification',
    priority: 4,
    context: ['clinic'],
    paths: [/^\/patients\/\S+\/data/],
    showIcon: false,
    getProps: (dispatch, patient) => ({
      label: t('Send Verification banner'),
      message: t('Resend {{fullName}}\'s email to invite them to upload and view data from home', { fullName: personUtils.patientFullName(patient)}),
      show: {
        metric: 'Banner displayed Send Verification',
      },
      action: {
        text: t('Resend Verification Email'),
        processingText: t('Resending Verification Email'),
        metric: 'Clicked Banner Resend Verification',
        metricProps: { source: 'none', location: 'banner' },
        handler: () => dispatch(resendEmailVerification(api, patient?.email)),
        working: {
          key: 'resendingEmailVerification',
          successMessage: t('Verification email sent to {{email}}', { email: patient?.email }),
          errorMessage: t('Error sending verification email'),
        },
      },
      dismiss: {
        metric: 'Send Verification banner banner dismissed',
      },
    }),
  },
];
