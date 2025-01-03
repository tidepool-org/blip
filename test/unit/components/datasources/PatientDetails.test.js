import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import PatientDetails from '../../../../app/components/datasources/PatientDetails';

/* global chai */
/* global describe */
/* global it */
/* global beforeEach */

const expect = chai.expect;

describe('PatientDetails', () => {
  const mount = createMount();

  let wrapper;
  const defaultProps = {
    patient: {
      id: 'patient123',
      fullName: 'Patient 123',
      birthDate: '2004-02-03',
      mrn: '12345',
    },
  };

  const noPatientMRNProps = {
    patient: {
      id: 'patient123',
      fullName: 'Patient 123',
      birthDate: '2004-02-03',
    },
  };

  beforeEach(() => {
    wrapper = mount(<PatientDetails {...defaultProps} />);
  });

  it('should render the provided patient details', () => {
    const fullName = wrapper.find('#patient-details-fullName').hostNodes();
    expect(fullName).to.have.lengthOf(1);
    expect(fullName.text()).to.equal('Patient 123');

    const birthDate = wrapper.find('#patient-details-birthDate').hostNodes();
    expect(birthDate).to.have.lengthOf(1);
    expect(birthDate.text()).to.equal('DOB: 2004-02-03');

    const mrn = wrapper.find('#patient-details-mrn').hostNodes();
    expect(mrn).to.have.lengthOf(1);
    expect(mrn.text()).to.equal('MRN: 12345');
  });

  it('should render the provided patient details with mrn missing', () => {
    wrapper = mount(<PatientDetails {...noPatientMRNProps} />);

    const fullName = wrapper.find('#patient-details-fullName').hostNodes();
    expect(fullName).to.have.lengthOf(1);
    expect(fullName.text()).to.equal('Patient 123');

    const birthDate = wrapper.find('#patient-details-birthDate').hostNodes();
    expect(birthDate).to.have.lengthOf(1);
    expect(birthDate.text()).to.equal('DOB: 2004-02-03');

    const mrn = wrapper.find('#patient-details-mrn').hostNodes();
    expect(mrn).to.have.lengthOf(1);
    expect(mrn.text()).to.equal('MRN: -');
  });
});
