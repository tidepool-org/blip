import _ from 'lodash';
import prescriptionSchema from '../../../../app/pages/prescription/prescriptionSchema';

/* global chai */
/* global describe */
/* global it */

const expect = chai.expect;

describe('prescriptionSchema', function() {
  it('should export a schema object with appropriate nodes', function() {
    const schema = prescriptionSchema();

    expect(schema).to.be.an('object');

    expect(schema._nodes).to.be.an('array').and.have.members([
      'id',
      'state',
      // 'type',
      'firstName',
      'lastName',
      'birthday',
      'email',
      'emailConfirm',
      'phoneNumber',
      'mrn',
      'sex',
      'initialSettings',
      'training',
      'therapySettingsReviewed',
    ]);

    expect(schema.fields.phoneNumber._nodes).to.be.an('array').and.have.members([
      'countryCode',
      'number',
    ]);

    expect(schema.fields.initialSettings._nodes).to.be.an('array').and.have.members([
      'bloodGlucoseUnits',
      'pumpId',
      'cgmId',
      // 'insulinModel',
      'suspendThreshold',
      'basalRateMaximum',
      'bolusAmountMaximum',
      'bloodGlucoseTargetSchedule',
      'basalRateSchedule',
      'carbohydrateRatioSchedule',
      'insulinSensitivitySchedule',
    ]);

    expect(schema.fields.initialSettings.fields.suspendThreshold._nodes).to.be.an('array').and.have.members([
      'value',
      'units',
    ]);

    expect(schema.fields.initialSettings.fields.basalRateMaximum._nodes).to.be.an('array').and.have.members([
      'value',
      'units',
    ]);

    expect(schema.fields.initialSettings.fields.bolusAmountMaximum._nodes).to.be.an('array').and.have.members([
      'value',
      'units',
    ]);


    expect(schema.fields.initialSettings.fields.bloodGlucoseTargetSchedule.type).to.equal('array');
    expect(schema.fields.initialSettings.fields.bloodGlucoseTargetSchedule._subType._nodes).to.be.an('array').and.have.members([
      'high',
      'low',
      'start',
    ]);

    expect(schema.fields.initialSettings.fields.basalRateSchedule.type).to.equal('array');
    expect(schema.fields.initialSettings.fields.basalRateSchedule._subType._nodes).to.be.an('array').and.have.members([
      'rate',
      'start',
    ]);

    expect(schema.fields.initialSettings.fields.carbohydrateRatioSchedule.type).to.equal('array');
    expect(schema.fields.initialSettings.fields.carbohydrateRatioSchedule._subType._nodes).to.be.an('array').and.have.members([
      'amount',
      'start',
    ]);

    expect(schema.fields.initialSettings.fields.insulinSensitivitySchedule.type).to.equal('array');
    expect(schema.fields.initialSettings.fields.insulinSensitivitySchedule._subType._nodes).to.be.an('array').and.have.members([
      'amount',
      'start',
    ]);
  });
});
