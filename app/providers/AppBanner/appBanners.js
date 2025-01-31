import { push } from 'connected-react-router';
import i18next from '../../core/language';
import { async, sync } from '../../redux/actions';

const t = i18next.t.bind(i18next);

export const appBanners = [
  {
    id: 'dataSourceReconnectBanner',
    variant: 'warning',
    priority: 0,
    context: ['patient'],
    paths: [/^\/patients\/\S+\/data/],
    getProps: (dispatch, provider) => ({
      label: t('Data Source Reconnect Banner'),
      message: t('Tidepool is no longer receiving data from your {{displayName}} account.', provider),
      action: {
        text: t('Reconnect my Account'),
        metric: 'clicked get started on Uploader Install banner',
        onClick: () => dispatch(push(`${window.location.pathname}?chart=settings`)),
      },
      dismiss: {
        metric: 'dismiss Uploader Install banner',
      },
    }),
  },

  {
    id: 'uploaderBanner',
    priority: 10,
    context: ['patient', 'clinic'],
    paths: [/^\/patients\/\S+\/data/],
    getProps: () => ({
      label: t('Uploader Banner'),
      message: t('If you\'ll be uploading your devices at home, download the latest version of Tidepool Uploader.'),
      action: {
        text: t('Download Latest'),
        metric: 'clicked get started on Uploader Install banner',
        onClick: () => window.open('https://www.tidepool.org/download'),
      },
      messageLink: {
        text: t('See the Install Guide'),
        metric: 'clicked learn more on Uploader Install banner',
        onClick: () => window.open('https://support.tidepool.org/hc/en-us/articles/360029368552-Installing-Tidepool-Uploader'),
      },
      dismiss: {
        metric: 'dismiss Uploader Install banner',
      },
    }),
  },
];
