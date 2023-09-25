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

  it('should export the `dateFormat`', function() {
    expect(clinicUtils.dateFormat).to.equal('YYYY-MM-DD');
  });

  it('should export the `dateRegex`', function() {
    expect(clinicUtils.dateRegex).to.eql(/^(.*)[-|/](.*)[-|/](.*)$/);
  });

  it('should export the `maxClinicPatientTags`', function() {
    expect(clinicUtils.maxClinicPatientTags).to.equal(20);
  });

  it('should return all clinicTypes options', () => {
    expect(clinicUtils.clinicTypes).to.eql([
      { value: 'provider_practice', label: 'Provider Practice' },
      { value: 'healthcare_system', label: 'Healthcare System' },
      { value: 'veterinary_clinic', label: 'Veterinary Clinic' },
      { value: 'researcher', label: 'Research Organization' },
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

  it('should return all preferredBgUnits options', () => {
    expect(clinicUtils.preferredBgUnits).to.eql([
      { value: 'mg/dL', label: 'mg/dL' },
      { value: 'mmol/L', label: 'mmol/L' },
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
        preferredBgUnits: '',
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
        preferredBgUnits: 'mmol/L',
      };

      expect(clinicUtils.clinicValuesFromClinic(clinic)).to.eql(clinic);
    });
  });

  describe('clinicSchema', () => {
    it('should return a yup schema for clinic fields', () => {
      expect(clinicUtils.clinicSchema).to.be.an('object');

      expect(clinicUtils.clinicSchema._nodes).to.be.an('array').and.have.members([
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
        'preferredBgUnits',
      ]);

      expect(clinicUtils.clinicSchema.fields.phoneNumbers.innerType._nodes).to.be.an('array').and.have.members([
        'type',
        'number',
      ]);
    });
  });

  describe('patientSchema', () => {
    it('should return a yup schema for clinic fields', () => {
      expect(clinicUtils.patientSchema()).to.be.an('object');

      expect(clinicUtils.patientSchema()._nodes).to.be.an('array').and.have.members([
        'fullName',
        'birthDate',
        'email',
        'mrn',
        'tags',
        'connectDexcom',
        'dataSources',
      ]);
    });

    it('should set mrn required when mrnSettings specify required', () => {
      let defaultSchema = clinicUtils.patientSchema().describe();
      let requiredSchema = clinicUtils.patientSchema({ mrnSettings: { required: true } }).describe();

      expect(defaultSchema.fields.mrn.tests).to.be.an('array').and.have.length(0);
      expect(requiredSchema.fields.mrn.tests).to.be.an('array').and.have.length(1);
      expect(requiredSchema.fields.mrn.tests[0].name).to.equal('required');
    });
  });
});
