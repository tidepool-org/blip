import React from 'react';

import config from '../../config';
import { getSessionTrace, getSessionToken } from '../../redux/api/baseApi';

const validateRestrictedToken = async (restrictedToken, providerName) => {
  const LOGIN_URL = `${config.API_HOST}/v1/oauth/${providerName}/authorize?restricted_token=${restrictedToken}`;

  try {
    const response = await fetch(LOGIN_URL, {
      method: 'GET',
      redirect: 'manual',
      headers: {
        'x-tidepool-trace-session': getSessionTrace(),
        'x-tidepool-session-token': getSessionToken(),
      },
    });

    if (response.type === 'opaqueredirect') {
      return { isValid: true };
    }

    return { isValid: false, status: response.status };
  } catch (error) {
    return { isValid: false, error: error.message };
  }
};

export default validateRestrictedToken;
