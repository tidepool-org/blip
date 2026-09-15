import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import utils from '../../core/utils';
import noop from 'lodash/noop';
import { useToasts } from '../../providers/ToastProvider';
import { toastMessages } from '../../components/datasources/useProviderConnectionPopup';

const useRedirectOnCustodialMobileC2CSuccess = ({
  isAuthorized = false,
  onRedirect = noop,
}) => {
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const { set: setToast } = useToasts();

  const isCustodialSignup = queryParams.has('signupEmail') && queryParams.has('signupKey');
  const isMobile = utils.isMobile();

  const isCustodialMobileC2CSuccess = isAuthorized && isCustodialSignup && isMobile;

  useEffect(() => {
    if (isCustodialMobileC2CSuccess) {
      setToast({ message: toastMessages.authorized, variant: 'success' });
      onRedirect(queryParams);
    }
  }, [isCustodialMobileC2CSuccess]);
};

export default useRedirectOnCustodialMobileC2CSuccess;
