import i18next from '../../core/language';
import { async } from '../../redux/actions';
import api from '../../core/api';

const t = i18next.t.bind(i18next);

// const bannerMetricsArgs = {
//   uploaderBanner: ['Uploader banner displayed'],
//   shareDataBanner: ['Share Data banner displayed'],
//   donateBanner: ['Big Data banner displayed'],
//   dexcomConnectBanner: ['Dexcom OAuth banner displayed', { clinicId: this.props.selectedClinicId, dexcomConnectState: dexcomDataSource?.state }],
//   updateTypeBanner: ['Update Type banner displayed'],
// };

export const appBanners = [
  {
    id: 'dataSourceReconnect',
    variant: 'warning',
    priority: 0,
    context: ['patient'],
    paths: [/^\/patients\/\S+\/data/],
    getProps: (dispatch, provider) => ({
      label: t('Data Source Reconnect Banner'),
      message: t('Tidepool is no longer receiving data from your {{displayName}} account.', provider),
      show: {
        metric: 'Displayed Data Source Reconnect Banner',
        metricProps: { providerName: provider?.dataSourceFilter?.providerName },
      },
      action: {
        text: t('Reconnect my Account'),
        metric: 'Clicked Data Source Reconnect Banner',
        handler: () => {
          if (provider) {
            const { id, restrictedTokenCreate, dataSourceFilter } = provider;
            return dispatch(async.connectDataSource(api, id, restrictedTokenCreate, dataSourceFilter));
          }
        },
      },
      dismiss: {
        metric: 'Dismissed Data Source Reconnect Banner',
        metricProps: { providerName: provider?.dataSourceFilter?.providerName }
      },
    }),
  },

  {
    id: 'dataSourceJustConnected',
    variant: 'info',
    priority: 1,
    context: ['patient'],
    paths: [/^\/patients\/\S+\/data/],
    getProps: provider => ({
      label: t('Data Source Just Connected Banner'),
      title: t('Data from {{displayName}} is on its way. This usually takes a few minutes but occasionally takes a bit longer.', provider),
      show: {
        metric: 'Displayed Data Source Just Connected Banner',
        metricProps: { providerName: provider?.dataSourceFilter?.providerName },
      },
      dismiss: {
        metric: 'Dismissed Data Source Just Connected Banner',
        metricProps: { providerName: provider?.dataSourceFilter?.providerName }
      },
    }),
  },

  {
    id: 'uploader',
    priority: 10,
    context: ['patient', 'clinic'],
    paths: [/^\/patients\/\S+\/data/],
    getProps: () => ({
      label: t('Uploader Banner'),
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
];
