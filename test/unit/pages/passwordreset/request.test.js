/* global chai */
/* global describe */
/* global sinon */
/* global it */

window.config = {};

import React from 'react';
import TestUtils from 'react-addons-test-utils';


import { RequestPasswordReset } from '../../../../app/pages/passwordreset/request';

var expect = chai.expect;

describe('RequestPasswordReset', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(RequestPasswordReset).to.be.a('function');
  });

  describe('render', function() {
    it('should console.error when required props are missing', function () {
      console.error = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<RequestPasswordReset />);
      expect(console.error.callCount).to.equal(5);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `api` was not specified in `RequestPasswordReset`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `onSubmit` was not specified in `RequestPasswordReset`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `trackMetric` was not specified in `RequestPasswordReset`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `acknowledgeNotification` was not specified in `RequestPasswordReset`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `working` was not specified in `RequestPasswordReset`.')).to.equal(true);
    });

    it('should render without problems when required props are set', function () {
      console.error = sinon.stub();
      var props = {
        api: {},
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub(),
        acknowledgeNotification: sinon.stub(),
        working: false
      };
      var elem = React.createElement(RequestPasswordReset, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.error.callCount).to.equal(0);
    });
  });

  describe('formInputs', function() {
    it('should return array with one entry for email', function() {
      console.error = sinon.stub();
      var props = {
        api: {},
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub(),
        acknowledgeNotification: sinon.stub(),
        working: false
      };
      var elem = React.createElement(RequestPasswordReset, props);
      var render = TestUtils.renderIntoDocument(elem);
      var formInputs = render.formInputs();
      expect(formInputs.length).to.equal(1);
      expect(formInputs[0].name).to.equal('email');
      expect(formInputs[0].label).to.equal('Email');
      expect(formInputs[0].type).to.equal('email');
    });
  });

  describe('getInitialState', function() {
    it('should be in this expected format', function() {
      console.error = sinon.stub();
      var props = {
        api: {},
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub(),
        acknowledgeNotification: sinon.stub(),
        working: false
      };
      var elem = React.createElement(RequestPasswordReset, props);
      var render = TestUtils.renderIntoDocument(elem);
      var initialState = render.getInitialState();
      expect(initialState.success).to.equal(false);
      expect(Object.keys(initialState.formValues).length).to.equal(0);
      expect(Object.keys(initialState.validationErrors).length).to.equal(0);
      expect(initialState.notification).to.equal(null);
    });
  });
});