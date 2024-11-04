import _ from 'lodash';
import prescriptionSchema from '../../../../app/pages/prescription/prescriptionSchema';

/* global chai */
/* global describe */
/* global it */

const expect = chai.expect;

describe('prescriptionSchema', function() {
  it('should export a schema object with appropriate nodes', function() {
    const schema = prescriptionSchema({});

    expect(schema).to.be.an('object');

    expect(schema._nodes).to.be.an('array').and.have.members([
      'id',
      'accessCode',
      'state',
      'accountType',
      'firstName',
      'lastName',
      'caregiverFirstName',
      'caregiverLastName',
      'birthday',
      'email',
      'emailConfirm',
      'phoneNumber',
      'mrn',
      'sex',
      'calculator',
      'initialSettings',
      'therapySettings',
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
      'insulinModel',
      'glucoseSafetyLimit',
      'basalRateMaximum',
      'bolusAmountMaximum',
      'bloodGlucoseTargetSchedule',
      'bloodGlucoseTargetPhysicalActivity',
      'bloodGlucoseTargetPreprandial',
      'basalRateSchedule',
      'carbohydrateRatioSchedule',
      'insulinSensitivitySchedule',
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
    expect(schema.fields.initialSettings.fields.bloodGlucoseTargetSchedule.innerType._nodes).to.be.an('array').and.have.members([
      'high',
      'low',
      'start',
    ]);

    expect(schema.fields.initialSettings.fields.bloodGlucoseTargetPhysicalActivity.type).to.equal('object');
    expect(schema.fields.initialSettings.fields.bloodGlucoseTargetPhysicalActivity._nodes).to.be.an('array').and.have.members([
      'high',
      'low',
    ]);

    expect(schema.fields.initialSettings.fields.bloodGlucoseTargetPreprandial.type).to.equal('object');
    expect(schema.fields.initialSettings.fields.bloodGlucoseTargetPreprandial._nodes).to.be.an('array').and.have.members([
      'high',
      'low',
    ]);

    expect(schema.fields.initialSettings.fields.basalRateSchedule.type).to.equal('array');
    expect(schema.fields.initialSettings.fields.basalRateSchedule.innerType._nodes).to.be.an('array').and.have.members([
      'rate',
      'start',
    ]);

    expect(schema.fields.initialSettings.fields.carbohydrateRatioSchedule.type).to.equal('array');
    expect(schema.fields.initialSettings.fields.carbohydrateRatioSchedule.innerType._nodes).to.be.an('array').and.have.members([
      'amount',
      'start',
    ]);

    expect(schema.fields.initialSettings.fields.insulinSensitivitySchedule.type).to.equal('array');
    expect(schema.fields.initialSettings.fields.insulinSensitivitySchedule.innerType._nodes).to.be.an('array').and.have.members([
      'amount',
      'start',
    ]);

    expect(schema.fields.calculator._nodes).to.be.an('array').and.have.members([
      'method',
      'totalDailyDose',
      'totalDailyDoseScaleFactor',
      'weight',
      'weightUnits',
      'recommendedBasalRate',
      'recommendedInsulinSensitivity',
      'recommendedCarbohydrateRatio',
    ]);
  });
});
