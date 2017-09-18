/* global chai */
/* global describe */
/* global sinon */
/* global it */

import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { shallow } from 'enzyme';

import SimpleForm from '../../../app/components/simpleform';

const expect = chai.expect;

describe('SimpleForm',  () => {
  describe('render', () => {
    it('should not console.error on render', () => {
      console.error = sinon.stub();
      var props = {};
      var navbarElem = React.createElement(SimpleForm, props);
      var elem = TestUtils.renderIntoDocument(navbarElem);

      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });

    it('should not render a submit button when renderSubmit prop is false', () => {
      const props = { renderSubmit: false };
      const wrapper = shallow(<SimpleForm {...props} />);

      expect (wrapper.find('button.simple-form-submit').length).to.equal(0);
    });

    it('should render a submit button by default if renderSubmit prop is unset', () => {
      const props = {};
      const wrapper = shallow(<SimpleForm {...props} />);

      expect (wrapper.find('button.simple-form-submit').length).to.equal(1);
    });

    it('should render a submit button if renderSubmit prop is true', () => {
      const props = { renderSubmit: true };
      const wrapper = shallow(<SimpleForm {...props} />);

      expect (wrapper.find('button.simple-form-submit').length).to.equal(1);
    });
  });
});
