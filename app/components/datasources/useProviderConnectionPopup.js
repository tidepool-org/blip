import { useCallback, useEffect, useState } from 'react';
import { find, last, min, noop } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';

import { async, sync } from '../../redux/actions';
import { providers } from './DataConnections';
import { useToasts } from '../../providers/ToastProvider';
import i18next from '../../core/language';
import api from '../../core/api';
import { usePrevious } from '../../core/hooks';
import utils from '../../core/utils';
import { useHistory } from 'react-router-dom';
import { selectUser } from '../../core/selectors';

const t = i18next.t.bind(i18next);

export const toastMessages = {
  authorized: t('Connection Authorized. Thank you for connecting!'),
  declined: t('Connection Declined. You can always decide to connect at a later time.'),
  error: t('Connection Authorization Error. Please try again.'),
};

export const toastVariants = {
  authorized: 'success',
  declined: 'info',
  error: 'danger',
};

const useProviderConnectionPopup = ({ popupWatchTimeout = 500, trackMetric = noop } = {}) => {
  const dispatch = useDispatch();
  const { location } = useHistory();
  const { set: setToast } = useToasts();
  const [providerConnectionPopup, setProviderConnectionPopup] = useState(null);
  const authorizedDataSource = useSelector(state => state.blip.authorizedDataSource);
  const justConnectedDataSourceProviderName = useSelector(state => state.blip.justConnectedDataSourceProviderName);
  const fetchingDataSources = useSelector(state => state.blip.working.fetchingDataSources);
  const previousJustConnectedDataSourceProviderName = usePrevious(justConnectedDataSourceProviderName);
  const user = useSelector(state => selectUser(state));
  const hasUser = !!user;

  const trackConnectionMetric = useCallback((status = null) => {
    const action = status ? 'Completed' : 'Started';

    let providerName;
    if (authorizedDataSource?.id) {
      const authorizedProvider = find(providers, { id: authorizedDataSource.id });
      providerName = authorizedProvider?.dataSourceFilter?.providerName;
    } else {
      providerName = location?.query?.dataConnectionProviderName;
    }

    trackMetric(`${action} provider connection flow`, { providerName, status });
  } , [
    trackMetric,
    authorizedDataSource,
    location?.query?.dataConnectionProviderName,
  ]);

  const openProviderConnectionPopup = useCallback((url, displayName) => {
    const popupWidth = min([window.innerWidth * .85, 1080]);
    const popupHeight = min([window.innerHeight * .85, 840]);
    const popupLeft = window.screenX + (window.outerWidth - popupWidth) / 2;
    const popupTop = window.screenY + (window.outerHeight - popupHeight) / 2;

    trackConnectionMetric();

    if (utils.isMobile()) {
      window.location.href = url; // Safari iOS doesn't like window.open, so we redirect
    } else {
      const popupOptions = [
        'toolbar=no',
        'location=no',
        'directories=no',
        'status=no',
        'menubar=no',
        'scrollbars=yes',
        'resizable=yes',
        'copyhistory=no',
        `width=${popupWidth}`,
        `height=${popupHeight}`,
        `left=${popupLeft}`,
        `top=${popupTop}`,
      ];

      const popup = window.open(url, `Connect ${displayName} to Tidepool`, popupOptions.join(','));
      setProviderConnectionPopup(popup);
    }
  }, [trackConnectionMetric]);

  useEffect(() => {
    if (justConnectedDataSourceProviderName && justConnectedDataSourceProviderName !== previousJustConnectedDataSourceProviderName) {
      if (!fetchingDataSources?.inProgress) dispatch(async.fetchDataSources(api));
    }
  }, [justConnectedDataSourceProviderName, fetchingDataSources?.inProgress, previousJustConnectedDataSourceProviderName, dispatch]);

  useEffect(() => {
    if (authorizedDataSource?.id) {
      const authorizedProvider = find(providers, { id: authorizedDataSource.id});
      if (authorizedProvider) openProviderConnectionPopup(authorizedDataSource?.url, authorizedProvider?.displayName);
    }
  }, [authorizedDataSource, openProviderConnectionPopup]);

  // If a user just connected a provider using a mobile device, they will have this query param.
  // In that case, we still want to show the toast message indicating the status of their connection.
  useEffect(() => {
    if (hasUser && location?.query?.dataConnectionStatus) {
      const status = location.query.dataConnectionStatus;

      setToast({
        message: toastMessages[status],
        variant: toastVariants[status],
      });

      trackConnectionMetric(status);
    }
  }, [
    location?.query?.dataConnectionStatus,
    setToast,
    trackConnectionMetric,
    hasUser,
  ]);

  useEffect(() => {
    let timer;
    if (!providerConnectionPopup || providerConnectionPopup.closed) {
      return;
    }

    timer = setInterval(() => {
      if (!providerConnectionPopup || providerConnectionPopup.closed) {
        dispatch(sync.clearAuthorizedDataSource());
        setProviderConnectionPopup(null);
        return;
      }

      try {
        const currentUrl = providerConnectionPopup.location.href;
        const currentPath = providerConnectionPopup.location.pathname;

        if (!currentUrl) return;

        if (currentUrl.indexOf(authorizedDataSource?.id) !== -1) {
          const status = last(currentPath.split('/'));

          // The initial platorm oauth redirect url is in the format of /v1/oauth/[providerName]/redirect
          // It then issues the redirect to the /oauth/[providerName]/[status] url that we want to watch for.
          // Depending on the timing of this interval check, we may get the redirect url
          // We return early in this case, and wait for the final redirect to happen.
          if (status === 'redirect') return;

          setToast({
            message: toastMessages[status],
            variant: toastVariants[status],
          });

          const authorizedProvider = find(providers, { id: authorizedDataSource.id});

          if (status === 'authorized') {
            dispatch(sync.setJustConnectedDataSourceProviderName(authorizedProvider?.dataSourceFilter?.providerName));
          }

          trackConnectionMetric(status);
          providerConnectionPopup.close();
        }
      } catch (e) {
        // The above try block will fail while the user is navigated to an external site, due to
        // trying to access the currentUrl being a CORS violation.
        // Once they complete the authorization flow, they will be redirected to our
        // /oauth/[providerName]/[status] route where we can react to the results and then close the
        // modal. So, we just return while this loop runs in the meantime.
        return;
      }
    }, popupWatchTimeout);

    return () => {
      clearInterval(timer);
    };
  }, [
    authorizedDataSource,
    dispatch,
    popupWatchTimeout,
    providerConnectionPopup,
    setToast,
    trackConnectionMetric,
  ]);

  return providerConnectionPopup;
};

export default useProviderConnectionPopup;
