
import React from 'react';
import TestUtils from 'react-dom/test-utils';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import chai from 'chai';
import _ from 'lodash';

import SimpleForm from '../../../app/components/simpleform';

describe('SimpleForm', () => {
  const { expect } = chai;

  describe('render', () => {
    before(() => {
      sinon.spy(console, 'error');
    });

    after(() => {
      console.error.restore();
    });

    it('should not console.error on render', () => {
      var props = {
        inputs: [],
      };
      var navbarElem = React.createElement(SimpleForm, props);
      var elem = TestUtils.renderIntoDocument(navbarElem);

      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });

    it('should not render a submit button when renderSubmit prop is false', () => {
      const props = { inputs: [], renderSubmit: false };
      const wrapper = shallow(<SimpleForm {...props} />);

      expect (wrapper.find('button.simple-form-submit').length).to.equal(0);
    });

    it('should render a submit button by default if renderSubmit prop is unset', () => {
      const props = { inputs: [] };
      const wrapper = shallow(<SimpleForm {...props} />);

      expect (wrapper.find('button.simple-form-submit').length).to.equal(1);
    });

    it('should render a submit button if renderSubmit prop is true', () => {
      const props = { inputs: [], renderSubmit: true };
      const wrapper = shallow(<SimpleForm {...props} />);

      expect (wrapper.find('button.simple-form-submit').length).to.equal(1);
    });
  });
});
