/* global chai */
/* global describe */
/* global sinon */
/* global it */

window.config = {};

import React from 'react';
import TestUtils from 'react-addons-test-utils';

var expect = chai.expect;

import { Patients } from '../../../app/pages/patients';

describe('Patients', () => {
  it('should be exposed as a module and be of type function', () => {
    expect(Patients).to.be.a('function');
  });

  describe('render', () => {
    it('should console.error when required props are missing', () => {
      console.error = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<Patients />);
      expect(console.error.callCount).to.equal(2);
    });

    it('should render without problems when trackMetric is set', () => {
      console.error = sinon.stub();
      var props = {
        trackMetric: sinon.stub(),
        clearPatientInView: sinon.stub()
      };
      var elem = React.createElement(Patients, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.error.callCount).to.equal(0);
    });
  });
});