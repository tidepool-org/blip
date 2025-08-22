import { push } from 'connected-react-router';

import i18next from '../../core/language';
import { async } from '../../redux/actions';
import api from '../../core/api';
import { TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL, URL_BIG_DATA_DONATION_INFO, URL_SHARE_DATA_INFO, URL_TIDEPOOL_PLUS_CONTACT_SALES } from '../../core/constants';
import { ResendDataSourceConnectRequestDialog } from '../../components/clinic/ResendDataSourceConnectRequestDialog';
import PatientEmailModal from '../../components/datasources/PatientEmailModal';
import { upperFirst } from 'lodash';

const t = i18next.t.bind(i18next);

export const pathRegexes = {
  clinicWorkspace: /^\/clinic-workspace/,
  patientData: /^\/patients\/\S+\/data/,
};

export const appBanners = [
  {
    id: 'dataSourceJustConnected',
    variant: 'info',
    priority: 0,
    context: ['patient'],
    paths: [pathRegexes.patientData],
    getProps: (provider = {}, dataSource) => ({
      ignoreBannerInteractionsBeforeTime: dataSource?.modifiedTime || dataSource?.createdTime,
      interactionId: `${upperFirst(provider?.dataSourceFilter?.providerName)}DataSourceJustConnected`,
      label: t('Data Source Just Connected banner'),
      title: provider?.indeterminateDataImportTime
        ? t('If you have connected your {{displayName}} device, data is on its way. This usually takes a few minutes but occassionally takes longer. Refresh the page to see data.', provider)
        : t('{{displayName}} data is on its way. This usually takes a few minutes but occasionally takes longer. Refresh the page to see data.', provider),
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
    getProps: (dispatch, provider = {}, dataSource) => ({
      ignoreBannerInteractionsBeforeTime: dataSource?.modifiedTime,
      interactionId: `${upperFirst(provider?.dataSourceFilter?.providerName)}DataSourceReconnect`,
      label: t('Data Source Reconnect banner'),
      message: t('Tidepool is no longer receiving {{displayName}} data from your account.', provider),
      show: {
        metric: 'Displayed Data Source Reconnect banner displayed',
        metricProps: { providerName: provider?.dataSourceFilter?.providerName },
      },
      action: {
        text: t('Reconnect My Account'),
        metric: 'Data Source Reconnect banner clicked',
        handler: () => dispatch(async.connectDataSource(api, provider.id, provider.restrictedTokenCreate, provider.dataSourceFilter)),
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
      interactionId: 'Uploader',
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
      interactionId: 'ShareData',
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
    id: 'donateYourData',
    variant: 'info',
    priority: 4,
    context: ['patient'],
    paths: [pathRegexes.patientData],
    getProps: dispatch => ({
      interactionId: 'DonateYourData',
      label: t('Donate your data banner'),
      message: t('Donate your data. Contribute to research.'),
      show: {
        metric: 'Big Data banner displayed',
      },
      action: {
        text: t('Donate my anonymized data'),
        processingText: t('Donating anonymized data...'),
        metric: 'web - big data sign up',
        metricProps: { source: 'none', location: 'banner' },
        handler: () => dispatch(async.updateDataDonationAccounts(api, [ TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL ])),
        working: {
          key: 'updatingDataDonationAccounts',
          successMessage: t('Thank you! Your anonymized data is now being shared'),
          errorMessage: t('Error sharing anonymized data'),
        },
      },
      messageLink: {
        text: t('Learn More'),
        metric: 'clicked learn more Donate banner',
        handler: () => window.open(URL_BIG_DATA_DONATION_INFO, '_blank'),
      },
      dismiss: {
        metric: 'web - dismiss big data sign up banner',
      },
    }),
  },

  {
    id: 'shareProceeds',
    variant: 'info',
    priority: 5,
    context: ['patient'],
    paths: [pathRegexes.patientData],
    getProps: (dispatch, loggedInUserId) => ({
      interactionId: 'ShareProceeds',
      label: t('Share Proceeds banner'),
      message: t('Thanks for contributing! Donate proceeds to a diabetes nonprofit.'),
      show: {
        metric: 'Big Data Share Proceeds banner displayed',
      },
      action: {
        text: t('Choose a diabetes nonprofit'),
        metric: 'web - big data share proceeds',
        metricProps: { source: 'none', location: 'banner' },
        handler: () => dispatch(push(`/patients/${loggedInUserId}/profile`)),
      },
      messageLink: {
        text: t('Learn More'),
        metric: 'clicked learn more Share Proceeds banner',
        handler: () => window.open(URL_BIG_DATA_DONATION_INFO, '_blank'),
      },
      dismiss: {
        metric: 'web - dismiss big data share proceeds banner',
      },
    }),
  },

  {
    id: 'updateType',
    variant: 'info',
    priority: 6,
    context: ['patient'],
    paths: [pathRegexes.patientData],
    getProps: (dispatch, loggedInUserId) => ({
      interactionId: 'UpdateType',
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
    priority: 7,
    context: ['clinic'],
    paths: [pathRegexes.clinicWorkspace],
    getProps: clinic => ({
      interactionId: 'PatientLimit',
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
    priority: 8,
    context: ['clinic'],
    paths: [pathRegexes.patientData],
    getProps: (dispatch, clinicId, patient = {}, provider = {}) => ({
      interactionId: `${upperFirst(provider?.dataSourceFilter?.providerName)}DataSourceReconnectInvite`,
      label: t('Data Source Reconnect Invite banner'),
      message: t('Tidepool is no longer receiving {{displayName}} data from your patient\'s account. Would you like to email them an invite to reconnect?', provider),
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
    priority: 9,
    context: ['clinic'],
    paths: [pathRegexes.patientData],
    showIcon: false,
    getProps: (formikContext, patient = {}) => ({
      interactionId: 'AddEmail',
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
    priority: 10,
    context: ['clinic'],
    paths: [pathRegexes.patientData],
    showIcon: false,
    getProps: (dispatch, patient = {}) => ({
      interactionId: 'SendVerification',
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
        handler: () => dispatch(async.resendEmailVerification(api, patient.email)),
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

  {
    id: 'clinicUsingAltRange',
    variant: 'info',
    priority: 12,
    context: ['patient'],
    paths: [pathRegexes.patientData],
    getProps: (dispatch, loggedInUserId) => ({
      interactionId: 'ClinicUsingAltRange',
      label: t('Clinic is using alternate glycemic range'),
      message: t('Clinic is using alternate glycemic range'),
      show: {
        metric: 'Banner displayed Send Verification',
      },
      action: {
        text: t('See Range'),
        metric: 'Clicked See Alternate Glycemic Range',
        handler: () => dispatch(push(`/patients/${loggedInUserId}/profile`)),
      },
      dismiss: {
        metric: 'See Alternate Glycemic Range dismissed',
      },
    }),
  },
];
