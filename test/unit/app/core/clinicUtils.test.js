import * as clinicUtils from '../../../../app/core/clinicUtils';

/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global beforeEach */

const expect = chai.expect;

describe('clinicUtils', function() {
  it('should return all roles options', () => {
    expect(clinicUtils.roles).to.eql([
      { value: 'clinic_manager', label: 'Clinic Manager' },
      { value: 'diabetes_educator', label: 'Diabetes Educator' },
      { value: 'endocrinologist', label: 'Endocrinologist' },
      { value: 'front_desk', label: 'Front Desk' },
      { value: 'information_technology', label: 'IT/Technology' },
      { value: 'medical_assistant', label: 'Medical Assistant' },
      { value: 'nurse', label: 'Nurse/Nurse Practitioner' },
      { value: 'primary_care_physician', label: 'Primary Care Physician' },
      { value: 'physician_assistant', label: 'Physician Assistant' },
      { value: 'pharmacist', label: 'Pharmacist' },
      { value: 'health_student', label: 'Health Professions Student' },
      { value: 'other', label: 'Other' },
    ]);
  });

  it('should return all clinicTypes options', () => {
    expect(clinicUtils.clinicTypes).to.eql([
      { value: 'provider_practice', label: 'Provider Practice' },
      { value: 'healthcare_system', label: 'Healthcare System' },
      { value: 'veterinary_clinic', label: 'Veterinary Clinic' },
      { value: 'other', label: 'Other' },
    ]);
  });

  it('should return all clinicSizes options', () => {
    expect(clinicUtils.clinicSizes).to.eql([
      { value: '0-249', label: '0-249' },
      { value: '250-499', label: '250-499' },
      { value: '500-999', label: '500-999' },
      { value: '1000+', label: '1000+' },
    ]);
  });

  describe('clinicValuesFromClinic', () => {
    it('should return default values for any missing clinic fields', () => {
      const emptyClinic = {};
      expect(clinicUtils.clinicValuesFromClinic(emptyClinic)).to.eql({
        name: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US',
        phoneNumbers: [
          {
            type: 'Office',
            number: '',
          },
        ],
        clinicType: '',
        clinicSize: '',
        website: '',
      });
    });

    it('should return existing fields values from the provided clinic', () => {
      const clinic = {
        name: 'Clinic 1',
        address: '253 MyStreet',
        city: 'MyTown',
        state: 'NB',
        postalCode: '12345',
        country: 'US',
        phoneNumbers: [
          {
            type: 'Office',
            number: '123-456-7890',
          },
        ],
        clinicType: 'provider_practice',
        clinicSize: '0-249',
        website: 'http://mysite.com',
      };

      expect(clinicUtils.clinicValuesFromClinic(clinic)).to.eql(clinic);
    });
  });

  describe('validationSchema', () => {
    it('should return a yup schema for clinic fields', () => {
      expect(clinicUtils.validationSchema).to.be.an('object');

      expect(clinicUtils.validationSchema._nodes).to.be.an('array').and.have.members([
        'name',
        'address',
        'city',
        'state',
        'postalCode',
        'country',
        'phoneNumbers',
        'clinicType',
        'clinicSize',
        'website',
      ]);

      expect(clinicUtils.validationSchema.fields.phoneNumbers.innerType._nodes).to.be.an('array').and.have.members([
        'type',
        'number',
      ]);
    });
  });
});
