import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { usePrevious } from '../../core/hooks';

const useRedirectOnC2CSuccess = ({ onRedirect }) => {
  const { search } = useLocation();
  const justConnectedDataSourceProviderName = useSelector(state => state.blip.justConnectedDataSourceProviderName);
  const previousJustConnectedDataSourceProviderName = usePrevious(justConnectedDataSourceProviderName);

  useEffect(() => {
    if (justConnectedDataSourceProviderName && justConnectedDataSourceProviderName !== previousJustConnectedDataSourceProviderName) {
      const params = new URLSearchParams(search);
      params.set('isC2CSuccess', 'true');

      onRedirect(params);
    }
  }, [justConnectedDataSourceProviderName, previousJustConnectedDataSourceProviderName]);
};

export default useRedirectOnC2CSuccess;
