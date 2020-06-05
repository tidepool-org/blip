/* global chai */
/* global describe */
/* global it */

import _ from 'lodash';
import * as prescriptionFormConstants from '../../../../app/pages/prescription/prescriptionFormConstants';

const expect = chai.expect;

describe('prescriptionFormConstants', function() {
  it('should export an object', function() {
    expect(prescriptionFormConstants).to.be.an('object');
  });

  it('should define the `dateFormat`', function() {
    expect(prescriptionFormConstants.dateFormat).to.equal('YYYY-MM-DD');
  });

  it('should define the `phoneRegex`', function() {
    expect(prescriptionFormConstants.phoneRegex).to.eql(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/);
  });

  it('should define the list of revision states', function() {
    expect(prescriptionFormConstants.revisionStates).to.be.an('array').and.to.eql([
      'draft',
      'pending',
      'submitted',
    ]);
  });

  it('should define the list pump device options', function() {
    expect(prescriptionFormConstants.pumpDeviceOptions).to.be.an('array');
    expect(_.map(prescriptionFormConstants.pumpDeviceOptions, 'value')).to.eql([
      'omnipodId',
    ]);

    _.each(prescriptionFormConstants.pumpDeviceOptions, device => {
      expect(device.value).to.be.a('string');
      expect(device.label).to.be.a('string');
      expect(device.extraInfo).to.be.an('object');
    })
  });

  it('should define the list cgm device options', function() {
    expect(prescriptionFormConstants.cgmDeviceOptions).to.be.an('array');
    expect(_.map(prescriptionFormConstants.cgmDeviceOptions, 'value')).to.eql([
      'dexcomId',
    ]);

    _.each(prescriptionFormConstants.cgmDeviceOptions, device => {
      expect(device.value).to.be.a('string');
      expect(device.label).to.be.a('string');
      expect(device.extraInfo).to.be.an('object');
    })
  });

  it('should define the list the prescription account type options', function() {
    expect(prescriptionFormConstants.typeOptions).to.be.an('array');
    expect(_.map(prescriptionFormConstants.typeOptions, 'value')).to.eql([
      'patient',
      'caregiver',
    ]);

    _.each(prescriptionFormConstants.typeOptions, device => {
      expect(device.value).to.be.a('string');
      expect(device.label).to.be.a('string');
    })
  });

  it('should define the list the prescription patient sex options', function() {
    expect(prescriptionFormConstants.sexOptions).to.be.an('array');
    expect(_.map(prescriptionFormConstants.sexOptions, 'value')).to.eql([
      'female',
      'male',
      'undisclosed',
    ]);

    _.each(prescriptionFormConstants.sexOptions, device => {
      expect(device.value).to.be.a('string');
      expect(device.label).to.be.a('string');
    })
  });

  it('should define the list of valid country codes', function() {
    expect(prescriptionFormConstants.validCountryCodes).to.be.an('array').and.to.eql([1]);
  });
});
