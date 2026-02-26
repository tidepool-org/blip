/* global chai */
/* global describe */
/* global sinon */
/* global it */

import React from 'react';
import { render } from '@testing-library/react';

import SimpleForm from '../../../app/components/simpleform';

const expect = chai.expect;

describe('SimpleForm',  () => {
  describe('render', () => {
    it('should not console.error on render', () => {
      const consoleErrorStub = sinon.stub(console, 'error');
      var props = {};
      var navbarElem = React.createElement(SimpleForm, props);
      try {
        const { container } = render(navbarElem);

        expect(container.firstChild).to.be.ok;
        expect(consoleErrorStub.callCount).to.equal(0);
      } finally {
        consoleErrorStub.restore();
      }
    });

    it('should not render a submit button when renderSubmit prop is false', () => {
      const props = { renderSubmit: false };
      const { container } = render(<SimpleForm {...props} />);

      expect(container.querySelectorAll('button.simple-form-submit').length).to.equal(0);
    });

    it('should render a submit button by default if renderSubmit prop is unset', () => {
      const props = {};
      const { container } = render(<SimpleForm {...props} />);

      expect(container.querySelectorAll('button.simple-form-submit').length).to.equal(1);
    });

    it('should render a submit button if renderSubmit prop is true', () => {
      const props = { renderSubmit: true };
      const { container } = render(<SimpleForm {...props} />);

      expect(container.querySelectorAll('button.simple-form-submit').length).to.equal(1);
    });
  });
});
