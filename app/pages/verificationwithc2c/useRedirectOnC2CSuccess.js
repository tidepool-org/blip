import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { usePrevious } from '../../core/hooks';
import { useToasts } from '../../providers/ToastProvider';
import { toastMessages } from '../../components/datasources/useProviderConnectionPopup';

const useRedirectOnC2CSuccess = ({ onRedirect }) => {
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);

  const justConnectedDataSourceProviderName = useSelector(state => state.blip.justConnectedDataSourceProviderName);
  const previousJustConnectedDataSourceProviderName = usePrevious(justConnectedDataSourceProviderName);
  const { set: setToast } = useToasts();

  useEffect(() => {
    if (justConnectedDataSourceProviderName && justConnectedDataSourceProviderName !== previousJustConnectedDataSourceProviderName) {
      setToast({ message: toastMessages.authorized, variant: 'success' });
      onRedirect(queryParams);
    }
  }, [justConnectedDataSourceProviderName, previousJustConnectedDataSourceProviderName]);
};

export default useRedirectOnC2CSuccess;
