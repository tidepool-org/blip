import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { LoggedOut } from '../../../app/pages/loggedout/loggedout';

jest.mock('../../../app/keycloak', () => ({
  keycloak: { login: jest.fn() },
}));

import { keycloak } from '../../../app/keycloak';

/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global beforeEach */
/* global context */

describe('LoggedOut', () => {
  let defaultProps = {
    t: sinon.stub().callsFake((string) => string),
  };

  beforeEach(() => {
    keycloak.login.mockReset();
  });

  it('should render signed out message', () => {
    render(<LoggedOut {...defaultProps} />);

    expect(screen.getByText(
      'You have been signed out of your session.'
    )).toBeTruthy();
  });

  it('should call keycloak.login when button clicked', () => {
    render(<LoggedOut {...defaultProps} />);

    expect(keycloak.login).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Return to Login' }));
    expect(keycloak.login).toHaveBeenCalledWith({ redirectUri: window.location.origin });
  });
});
