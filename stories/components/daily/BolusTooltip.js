import React from 'react';

import { storiesOf } from '@storybook/react';

import BolusTooltip from '../../../src/components/daily/bolustooltip/BolusTooltip';

// bolus' lifted from bolus utils tests
const normal = {
  normal: 5,
  normalTime: '2017-11-11T05:45:52.000Z',
};

const normalPrecise = {
  normal: 5.05,
  normalTime: '2017-11-11T05:45:52.000Z',
};

const cancelled = {
  normal: 2,
  expectedNormal: 5,
  normalTime: '2017-11-11T05:45:52.000Z',
};

const immediatelyCancelled = {
  normal: 0,
  expectedNormal: 5.3,
  normalTime: '2017-11-11T05:45:52.000Z',
  type: 'bolus',
  subType: 'normal',
};

const override = {
  type: 'wizard',
  bolus: {
    normal: 2,
    normalTime: '2017-11-11T05:45:52.000Z',
  },
  recommended: {
    carb: 0,
    correction: 0,
  },
};

const underride = {
  type: 'wizard',
  bolus: {
    normal: 1,
    normalTime: '2017-11-11T05:45:52.000Z',
  },
  recommended: {
    carb: 1,
    correction: 0.5,
  },
};

const combo = {
  normal: 1,
  extended: 2,
  duration: 36e5,
  normalTime: '2017-11-11T05:45:52.000Z',
};

const cancelledInNormalCombo = {
  normal: 0.2,
  expectedNormal: 1,
  extended: 0,
  expectedExtended: 2,
  duration: 0,
  expectedDuration: 36e5,
  normalTime: '2017-11-11T05:45:52.000Z',
};

const cancelledInExtendedCombo = {
  normal: 1,
  extended: 0.5,
  expectedExtended: 2,
  duration: 9e5,
  expectedDuration: 36e5,
  normalTime: '2017-11-11T05:45:52.000Z',
};

const comboOverride = {
  type: 'wizard',
  bolus: {
    normal: 1.5,
    extended: 2.5,
    duration: 36e5,
    normalTime: '2017-11-11T05:45:52.000Z',
  },
  recommended: {
    carb: 3,
  },
};

const comboUnderrideCancelled = {
  type: 'wizard',
  bolus: {
    normal: 1,
    extended: 1,
    expectedExtended: 3,
    duration: 1200000,
    expectedDuration: 3600000,
    normalTime: '2017-11-11T05:45:52.000Z',
  },
  recommended: {
    carb: 5,
  },
};

const comboUnderrideCancelledWithBG = {
  type: 'wizard',
  bgTarget: {
    target: 100,
  },
  bolus: {
    normal: 1,
    extended: 1,
    expectedExtended: 3,
    duration: 1200000,
    expectedDuration: 3600000,
    normalTime: '2017-11-11T05:45:52.000Z',
  },
  recommended: {
    net: 5,
    carb: 5,
    correction: 2,
  },
  carbInput: 75,
  bgInput: 280,
  insulinSensitivity: 70,
  insulinCarbRatio: 15,
};

const extended = {
  extended: 2,
  duration: 36e5,
  normalTime: '2017-11-11T05:45:52.000Z',
};

const cancelledExtended = {
  extended: 0.2,
  expectedExtended: 2,
  duration: 36e4,
  expectedDuration: 36e5,
  normalTime: '2017-11-11T05:45:52.000Z',
};

const immediatelyCancelledExtended = {
  extended: 0,
  expectedExtended: 2,
  duration: 0,
  expectedDuration: 36e5,
  normalTime: '2017-11-11T05:45:52.000Z',
};

const immediatelyCancelledExtendedWizard = {
  type: 'wizard',
  bgTarget: {
    target: 100,
  },
  bolus: {
    normal: 0,
    extended: 0,
    expectedNormal: 2,
    expectedExtended: 3,
    duration: 0,
    expectedDuration: 3600000,
    normalTime: '2017-11-11T05:45:52.000Z',
  },
  recommended: {
    net: 5,
    carb: 5,
    correction: 2,
  },
  carbInput: 75,
  bgInput: 280,
  insulinSensitivity: 70,
  insulinOnBoard: 10,
  insulinCarbRatio: 15,
  normalTime: '2017-11-11T05:45:52.000Z',
};

const extendedAnimas = {
  extended: 1.2,
  duration: 18000000,
  normalTime: '2017-11-11T05:45:52.000Z',
  annotations: [
    { code: 'animas/bolus/extended-equal-split' },
  ],
};

const extendedAnimasUnderride = {
  type: 'wizard',
  bolus: {
    extended: 1.2,
    duration: 18000000,
    normalTime: '2017-11-11T05:45:52.000Z',
    annotations: [
      { code: 'animas/bolus/extended-equal-split' },
    ],
  },
  recommended: {
    correction: 3.5,
  },
};

const extendedUnderride = {
  type: 'wizard',
  bolus: {
    extended: 3,
    duration: 36e5,
    normalTime: '2017-11-11T05:45:52.000Z',
  },
  recommended: {
    correction: 3.5,
  },
};

const withNetRec = {
  type: 'wizard',
  bolus: {
    normal: 1,
    normalTime: '2017-11-11T05:45:52.000Z',
  },
  recommended: {
    net: 2,
  },
};

const withCarbInput = {
  type: 'wizard',
  bolus: {
    normal: 5,
    normalTime: '2017-11-11T05:45:52.000Z',
  },
  recommended: {
    carb: 5,
    correction: 0,
    net: 5,
  },
  carbInput: 75,
  insulinCarbRatio: 15,
};

const withBGInput = {
  type: 'wizard',
  bgTarget: {
    target: 100,
  },
  bolus: {
    normal: 5,
    normalTime: '2017-11-11T05:45:52.000Z',
  },
  recommended: {
    carb: 5,
    correction: 0,
    net: 5,
  },
  bgInput: 280,
  insulinSensitivity: 70,
};

const withBGInputAndIOB = {
  type: 'wizard',
  bgTarget: {
    target: 100,
  },
  bolus: {
    normal: 5,
    normalTime: '2017-11-11T05:45:52.000Z',
  },
  recommended: {
    carb: 5,
    correction: 0,
    net: 5,
  },
  bgInput: 280,
  insulinSensitivity: 70,
  insulinOnBoard: 0.5,
};

const withBGAndCarbInput = {
  type: 'wizard',
  bgTarget: {
    target: 100,
  },
  bolus: {
    normal: 5,
    normalTime: '2017-11-11T05:45:52.000Z',
  },
  recommended: {
    carb: 5,
    correction: 0,
    net: 5,
  },
  carbInput: 75,
  insulinCarbRatio: 15,
  bgInput: 180,
};

const withMedtronicTarget = {
  type: 'wizard',
  bgInput: 180,
  bgTarget: {
    low: 60,
    high: 180,
  },
  bolus: {
    normal: 5,
    normalTime: '2017-11-11T05:45:52.000Z',
  },
  recommended: {
    carb: 5,
    correction: 0,
    net: 5,
  },
  carbInput: 75,
  insulinCarbRatio: 15,
};

const withAnimasTarget = {
  type: 'wizard',
  bgInput: 180,
  bgTarget: {
    target: 100,
    range: 40,
  },
  bolus: {
    normal: 5,
    normalTime: '2017-11-11T05:45:52.000Z',
  },
  recommended: {
    carb: 5,
    correction: 0,
    net: 5,
  },
  carbInput: 75,
  insulinCarbRatio: 15,
};

const withInsuletTarget = {
  type: 'wizard',
  bgInput: 180,
  bgTarget: {
    target: 100,
    high: 180,
  },
  bolus: {
    normal: 5,
    normalTime: '2017-11-11T05:45:52.000Z',
  },
  recommended: {
    carb: 5,
    correction: 0,
    net: 5,
  },
  carbInput: 75,
  insulinCarbRatio: 15,
};

const withTandemTarget = {
  type: 'wizard',
  bgInput: 180,
  bgTarget: {
    target: 100,
  },
  bolus: {
    normal: 5,
    normalTime: '2017-11-11T05:45:52.000Z',
  },
  recommended: {
    carb: 5,
    correction: 0,
    net: 5,
  },
  carbInput: 75,
  insulinCarbRatio: 15,
};

const props = {
  position: { top: 200, left: 200 },
  timePrefs: { timezoneAware: false },
};

const BackgroundDecorator = story => (
  <div style={{ backgroundColor: 'FloralWhite', width: '100%', height: '96vh' }}>{story()}</div>
);

const refDiv = (
  <div
    style={{
      position: 'absolute',
      width: '10px',
      height: '10px',
      top: '199px',
      left: '199px',
      backgroundColor: 'FireBrick',
      opacity: 0.5,
      zIndex: '1',
    }}
  />
);

storiesOf('BolusTooltip', module)
  .addDecorator(BackgroundDecorator)
  .add('normal', () => (
    <div>
      {refDiv}
      <BolusTooltip {...props} bolus={normal} />
    </div>
  ))
  .add('normalPrecise', () => (
    <div>
      {refDiv}
      <BolusTooltip {...props} bolus={normalPrecise} />
    </div>
  ))
  .add('cancelled', () => (
    <div>
      {refDiv}
      <BolusTooltip {...props} bolus={cancelled} />
    </div>
  ))
  .add('immediatelyCancelled', () => (
    <div>
      {refDiv}
      <BolusTooltip {...props} bolus={immediatelyCancelled} />
    </div>
  ))
  .add('override', () => (
    <div>
      {refDiv}
      <BolusTooltip {...props} bolus={override} />
    </div>
  ))
  .add('underride', () => (
    <div>
      {refDiv}
      <BolusTooltip {...props} bolus={underride} />
    </div>
  ))
  .add('combo', () => (
    <div>
      {refDiv}
      <BolusTooltip {...props} bolus={combo} />
    </div>
  ))
  .add('cancelledInNormalCombo', () => (
    <div>
      {refDiv}
      <BolusTooltip {...props} bolus={cancelledInNormalCombo} />
    </div>
  ))
  .add('cancelledInExtendedCombo', () => (
    <div>
      {refDiv}
      <BolusTooltip {...props} bolus={cancelledInExtendedCombo} />
    </div>
  ))
  .add('comboOverride', () => (
    <div>
      {refDiv}
      <BolusTooltip {...props} bolus={comboOverride} />
    </div>
  ))
  .add('comboUnderrideCancelled', () => (
    <div>
      {refDiv}
      <BolusTooltip {...props} bolus={comboUnderrideCancelled} />
    </div>
  ))
  .add('comboUnderrideCancelledWithBG', () => (
    <div>
      {refDiv}
      <BolusTooltip {...props} bolus={comboUnderrideCancelledWithBG} />
    </div>
  ))
  .add('extended', () => (
    <div>
      {refDiv}
      <BolusTooltip {...props} bolus={extended} />
    </div>
  ))
  .add('cancelledExtended', () => (
    <div>
      {refDiv}
      <BolusTooltip {...props} bolus={cancelledExtended} />
    </div>
  ))
  .add('immediatelyCancelledExtended', () => (
    <div>
      {refDiv}
      <BolusTooltip {...props} bolus={immediatelyCancelledExtended} />
    </div>
  ))
  .add('immediatelyCancelledExtendedWizard', () => (
    <div>
      {refDiv}
      <BolusTooltip {...props} bolus={immediatelyCancelledExtendedWizard} />
    </div>
  ))
  .add('extendedAnimas', () => (
    <div>
      {refDiv}
      <BolusTooltip {...props} bolus={extendedAnimas} />
    </div>
  ))
  .add('extendedAnimasUnderride', () => (
    <div>
      {refDiv}
      <BolusTooltip {...props} bolus={extendedAnimasUnderride} />
    </div>
  ))
  .add('extendedUnderride', () => (
    <div>
      {refDiv}
      <BolusTooltip {...props} bolus={extendedUnderride} />
    </div>
  ))
  .add('withNetRec', () => (
    <div>
      {refDiv}
      <BolusTooltip {...props} bolus={withNetRec} />
    </div>
  ))
  .add('withCarbInput', () => (
    <div>
      {refDiv}
      <BolusTooltip {...props} bolus={withCarbInput} />
    </div>
  ))
  .add('withBGInput', () => (
    <div>
      {refDiv}
      <BolusTooltip {...props} bolus={withBGInput} />
    </div>
  ))
  .add('withBGInputAndIOB', () => (
    <div>
      {refDiv}
      <BolusTooltip {...props} bolus={withBGInputAndIOB} />
    </div>
  ))
  .add('withBGAndCarbInput', () => (
    <div>
      {refDiv}
      <BolusTooltip {...props} bolus={withBGAndCarbInput} />
    </div>
  ))
  .add('withMedtronicTarget', () => (
    <div>
      {refDiv}
      <BolusTooltip {...props} bolus={withMedtronicTarget} />
    </div>
  ))
  .add('withAnimasTarget', () => (
    <div>
      {refDiv}
      <BolusTooltip {...props} bolus={withAnimasTarget} />
    </div>
  ))
  .add('withInsuletTarget', () => (
    <div>
      {refDiv}
      <BolusTooltip {...props} bolus={withInsuletTarget} />
    </div>
  ))
  .add('withTandemTarget', () => (
    <div>
      {refDiv}
      <BolusTooltip {...props} bolus={withTandemTarget} />
    </div>
  ));
