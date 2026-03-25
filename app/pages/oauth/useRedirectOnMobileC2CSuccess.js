import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import utils from '../../core/utils';
import noop from 'lodash/noop';

const useRedirectOnCustodialMobileC2CSuccess = ({
  isAuthorized = false,
  onRedirect = noop,
}) => {
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const isCustodial = queryParams.has('signupEmail') && queryParams.has('signupKey');
  const isMobile = utils.isMobile();

  const isCustodialMobileC2CSuccess = isAuthorized && isCustodial && isMobile;

  useEffect(() => {
    if (isCustodialMobileC2CSuccess) {
      const params = new URLSearchParams(queryParams);
      params.append('isC2CSuccess', 'true');

      onRedirect(params);
    }
  }, [isCustodialMobileC2CSuccess]);
};

export default useRedirectOnCustodialMobileC2CSuccess;
