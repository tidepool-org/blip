import { useCallback, useEffect, useState } from 'react';
import { find, last, min } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';

import { async, sync } from '../../redux/actions';
import { providers } from './DataConnections';
import { useToasts } from '../../providers/ToastProvider';
import i18next from '../../core/language';
import api from '../../core/api';
import { usePrevious } from '../../core/hooks';
import utils from '../../core/utils';

const t = i18next.t.bind(i18next);

const useProviderConnectionPopup = ({ popupWatchTimeout = 500 } = {}) => {
  const dispatch = useDispatch();
  const { set: setToast } = useToasts();
  const [providerConnectionPopup, setProviderConnectionPopup] = useState(null);
  const authorizedDataSource = useSelector(state => state.blip.authorizedDataSource);
  const justConnectedDataSourceProviderName = useSelector(state => state.blip.justConnectedDataSourceProviderName);
  const fetchingDataSources = useSelector(state => state.blip.working.fetchingDataSources);
  const previousJustConnectedDataSourceProviderName = usePrevious(justConnectedDataSourceProviderName);

  const openProviderConnectionPopup = useCallback((url, displayName) => {
    const popupWidth = min([window.innerWidth * .85, 1080]);
    const popupHeight = min([window.innerHeight * .85, 840]);
    const popupLeft = window.screenX + (window.outerWidth - popupWidth) / 2;
    const popupTop = window.screenY + (window.outerHeight - popupHeight) / 2;

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

    if (utils.isMobile()) {
      window.location.href = url; // Safari iOS doesn't like window.open, so we redirect
    } else {
      const popup = window.open(url, `Connect ${displayName} to Tidepool`, popupOptions.join(','));
      setProviderConnectionPopup(popup);
    }
  }, []);

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

          const toastMessages = {
            authorized: t('Connection Authorized. Thank you for connecting!'),
            declined: t('Connection Declined. You can always decide to connect at a later time.'),
            error: t('Connection Authorization Error. Please try again.'),
          };

          const toastVariants = {
            authorized: 'success',
            declined: 'info',
            error: 'danger',
          };

          setToast({
            message: toastMessages[status],
            variant: toastVariants[status],
          });

          if (status === 'authorized') {
            const authorizedProvider = find(providers, { id: authorizedDataSource.id});
            dispatch(sync.setJustConnectedDataSourceProviderName(authorizedProvider?.dataSourceFilter?.providerName));
          }

          // providerConnectionPopup.close();
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
  ]);

  return providerConnectionPopup;
};

export default useProviderConnectionPopup;
