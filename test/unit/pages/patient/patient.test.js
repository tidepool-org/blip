/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global before */
/* global after */

import React from 'react';
import { render } from '@testing-library/react';

var expect = chai.expect;

import Patient from '../../../../app/pages/patient/patient';

jest.mock('../../../../app/pages/patient/patientinfo', () => () => (
  <div className='fake-patient-info-view'></div>
));

const PatientClass = Patient.WrappedComponent || Patient;

const buildProps = (overrides = {}) => ({
  acknowledgeNotification: sinon.stub(),
  fetchers: [],
  fetchingPatient: false,
  fetchingUser: false,
  trackMetric: sinon.stub(),
  dataSources: [],
  fetchDataSources: sinon.stub(),
  connectDataSource: sinon.stub(),
  disconnectDataSource: sinon.stub(),
  t: str => str,
  ...overrides,
});

describe('Patient', function () {
  let consoleErrorStub;

  afterEach(function() {
    if (consoleErrorStub && consoleErrorStub.restore) {
      consoleErrorStub.restore();
    }
  });

  describe('render', function() {
    it('should render without problems when required props are present', function() {
      consoleErrorStub = sinon.stub(console, 'error');
      var props = buildProps();
      var result = render(React.createElement(PatientClass, props));

      // Assert concrete DOM output rather than the vacuous RenderResult truthy check
      expect(result.container.querySelector('.fake-patient-info-view')).to.not.be.null;
      expect(consoleErrorStub.callCount).to.equal(0);
    });
  });

  describe('getInitialState', function() {
    it('should return an object', function() {
      var instance = new PatientClass(buildProps());
      var initialState = instance.getInitialState();

      expect(Object.keys(initialState).length).to.equal(2);
      expect(initialState.showModalOverlay).to.equal(false);
      expect(initialState.dialog).to.equal('');
    });
  });
});
