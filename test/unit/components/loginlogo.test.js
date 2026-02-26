/* global chai */
/* global describe */
/* global sinon */
/* global it */

import React from 'react';
import { render } from '@testing-library/react';
import LoginLogo from '../../../app/components/loginlogo/loginlogo';

describe('LoginLogo', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(typeof LoginLogo).toBe('function');
  });

  describe('render', function() {
    it('should render without problems', function () {
      const consoleErrorStub = sinon.stub(console, 'error');
      var props = {};
      var elem = React.createElement(LoginLogo, props);
      try {
        render(elem);
        expect(consoleErrorStub.callCount).toBe(0);
      } finally {
        consoleErrorStub.restore();
      }
    });
  });
});
