import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { translate } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom';
import capitalize from 'lodash/capitalize';
import includes from 'lodash/includes';

import { useToasts } from '../../providers/ToastProvider';


export const OAuthConnection = (props) => {
  const { t, trackMetric } = props;
  const { set: setToast } = useToasts();
  const { providerName, status } = useParams();
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search)
  const dispatch = useDispatch();
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId)
  const allowedProviderNames = ['dexcom'];

  console.log('loggedInUserId', loggedInUserId);

  const statusHandler = {
    authorized: {
      toast: {
        message: t('You have successfully connected your {{providerName}} account to Tidepool.', {
          providerName: capitalize(providerName),
        }),
        variant: 'success',
      },
    },
    declined: {
      toast: {
        message: t('You have declined connecting your {{providerName}} account to Tidepool.', {
          providerName: capitalize(providerName),
        }),
        variant: 'info',
      },
    },
    error: {
      toast: {
        message: t('We were unable to determine your connection status to Tidepool.'),
        variant: 'danger',
      },
    },
  };

  useEffect(() => {
    console.log('queryParams.has(\'signupEmail\')', queryParams.has('signupEmail'), queryParams.get('signupEmail'));
    console.log('queryParams.has(\'signupKey\')', queryParams.has('signupKey'), queryParams.get('signupKey'));
    const canClaimCustodialAccount = queryParams.has('signupEmail') && queryParams.has('signupKey');

    console.log('canClaimCustodialAccount', canClaimCustodialAccount);

    if (trackMetric) {
      trackMetric('Oauth - Connection', { providerName, status });
    }

    // Can we simply redirect to '/login' with the any query params set?

    // 1. If signup query params are present, confirmSignup 409 response will redirect to verification-with-password, which will log out the user if necessary and allow custodial account completion
    // 1a. Well... auth users will be immediately redirected, and confirmSignup will not be called
    // 1b. Also... perhaps the user does not want to claim -- may need some UI here on this page after all, and treat this as analogous to a 'claim account' email they would have received in other flows

    // 2. If signup query params are absent, a redirect to '/login' should be sufficient, as the user is an already claimed account, and, if already authenticated, will be redirected to the default landing page

    // In light of above:
    // If signup query params are present, we cannot redirect to login UNTIL they confirm that they want to claim the account
    // If signup query params are absent, we can safely redirect to login automatically if we choose.

    // We could leave it up to the user in all cases, have a 'Proceed to Tidepool' link that would redirect to the base (`/`) url,
    // or the /login?signupKey=... path (with some extra messaging on this page for claiming accounts lifted from email copy) if applicable


    if (includes(allowedProviderNames, providerName) && statusHandler[status]) {
      setToast(statusHandler[status].toast);
      console.log('loggedInUserId at load', loggedInUserId);
      // dispatch(push('/login', { providerName, status }))
    } else {
      setToast(statusHandler.error.toast);
      // dispatch(push('/login'));
    }
  }, []);

  return (
    <div>
      <p>{loggedInUserId}</p>
      <p>
        {providerName}
      </p>
      <p>
        {status}
      </p>
    </div>
  );
};

OAuthConnection.propTypes = {
  api: PropTypes.object.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default translate()(OAuthConnection);
