import _ from 'lodash';
import prescriptionSchema from '../../../../app/pages/prescription/prescriptionSchema';

/* global chai */
/* global describe */
/* global it */

const expect = chai.expect;

describe('prescriptionSchema', function() {
  it('should export a schema object with appropriate nodes', function() {
    expect(prescriptionSchema).to.be.an('object');

    expect(prescriptionSchema._nodes).to.be.an('array').and.includes.members([
      'id',
      'state',
      'type',
      'firstName',
      'lastName',
      'birthday',
      'email',
      'emailConfirm',
      'phoneNumber',
      'mrn',
      'sex',
      'initialSettings',
    ]);

    expect(prescriptionSchema.fields.phoneNumber._nodes).to.be.an('array').and.includes.members([
      'countryCode',
      'number',
    ]);

    expect(prescriptionSchema.fields.initialSettings._nodes).to.be.an('array').and.includes.members([
      'pumpType',
      'cgmType',
    ]);
  });
});
