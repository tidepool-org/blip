import React from 'react';
import { render, cleanup } from '@testing-library/react';
import PatientDetails from '../../../../app/components/datasources/PatientDetails';
/* global chai */
/* global describe */
/* global it */

const expect = chai.expect;

describe('PatientDetails', () => {
  afterEach(cleanup);
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

  it('should render the provided patient details', () => {
    const { container } = render(<PatientDetails {...defaultProps} />);

    const fullName = container.querySelectorAll('#patient-details-fullName');
    expect(fullName).to.have.lengthOf(1);
    expect(fullName[0].textContent).to.equal('Patient 123');

    const birthDate = container.querySelectorAll('#patient-details-birthDate');
    expect(birthDate).to.have.lengthOf(1);
    expect(birthDate[0].textContent).to.equal('DOB: 2004-02-03');

    const mrn = container.querySelectorAll('#patient-details-mrn');
    expect(mrn).to.have.lengthOf(1);
    expect(mrn[0].textContent).to.equal('MRN: 12345');
  });

  it('should render the provided patient details with mrn missing', () => {
    const { container } = render(<PatientDetails {...noPatientMRNProps} />);

    const fullName = container.querySelectorAll('#patient-details-fullName');
    expect(fullName).to.have.lengthOf(1);
    expect(fullName[0].textContent).to.equal('Patient 123');

    const birthDate = container.querySelectorAll('#patient-details-birthDate');
    expect(birthDate).to.have.lengthOf(1);
    expect(birthDate[0].textContent).to.equal('DOB: 2004-02-03');

    const mrn = container.querySelectorAll('#patient-details-mrn');
    expect(mrn).to.have.lengthOf(1);
    expect(mrn[0].textContent).to.equal('MRN: -');
  });
});
