window.zESettings = {
  webWidget: {
    authenticate: {
      jwtFn: (/** @type{(token: string) => void} */ callback) => {
        /** @type {string} */
        const url = `${config.API_HOST}/auth/sso/zendesk`;
        const token = window.sessionStorage.getItem('authToken');
        fetch(url, {
          method: 'POST',
          headers: {
            'x-tidepool-session-token': token
          },
          cache: 'no-cache',
        }).then((response) => {
          if (response.ok) {
            const zendeskToken = response.headers.get('x-external-session-token');
            console.info('Retrieve a new sso token for Zendesk');
            return callback(zendeskToken);
          }
          console.warn('Zendesk callback SSO token: Missing token');
          // else?
        }).catch((reason) => {
          console.warn(`Error while requesting sso token: ${reason}`);
          callback('invalid.token');
        });
      }
    }
  }
};
