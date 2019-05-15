import React from 'react';

import { storiesOf } from '@storybook/react';

import SMBGTooltip from '../../../src/components/daily/smbgtooltip/SMBGTooltip';

const bgPrefs = {
  bgClasses: {
    'very-high': { boundary: 600 },
    high: { boundary: 300 },
    target: { boundary: 180 },
    low: { boundary: 70 },
    'very-low': { boundary: 54 },
  },
  bgUnits: 'mg/dL',
};

const target = {
  type: 'smbg',
  units: 'mg/dL',
  value: 100,
};

const low = {
  type: 'smbg',
  units: 'mg/dL',
  value: 65,
};

const high = {
  type: 'smbg',
  units: 'mg/dL',
  value: 200,
};

const manual = {
  type: 'smbg',
  units: 'mg/dL',
  value: 100,
  subType: 'manual',
};

const linked = {
  type: 'smbg',
  units: 'mg/dL',
  value: 100,
  subType: 'linked',
};

const medT600accepted = {
  type: 'smbg',
  units: 'mg/dL',
  value: 100,
  annotations: [
    { code: 'medtronic600/smbg/user-accepted-remote-bg' },
  ],
};

const medT600rejected = {
  type: 'smbg',
  units: 'mg/dL',
  value: 100,
  annotations: [
    { code: 'medtronic600/smbg/user-rejected-remote-bg' },
  ],
};

const medT600timeout = {
  type: 'smbg',
  units: 'mg/dL',
  value: 100,
  annotations: [
    { code: 'medtronic600/smbg/remote-bg-acceptance-screen-timeout' },
  ],
};

const medT600acceptedManual = {
  type: 'smbg',
  units: 'mg/dL',
  value: 100,
  subType: 'manual',
  annotations: [
    { code: 'medtronic600/smbg/user-accepted-remote-bg' },
  ],
};

const medT600rejectedLinked = {
  type: 'smbg',
  units: 'mg/dL',
  value: 100,
  subType: 'linked',
  annotations: [
    { code: 'medtronic600/smbg/user-rejected-remote-bg' },
  ],
};

const medT600timeoutManual = {
  type: 'smbg',
  units: 'mg/dL',
  value: 100,
  subType: 'manual',
  annotations: [
    { code: 'medtronic600/smbg/remote-bg-acceptance-screen-timeout' },
  ],
};

const medT600calibManual = {
  type: 'smbg',
  units: 'mg/dL',
  value: 100,
  subType: 'manual',
  annotations: [
    { code: 'medtronic600/smbg/bg-sent-for-calib' },
  ],
};

const medT600noncalibManual = {
  type: 'smbg',
  units: 'mg/dL',
  value: 100,
  subType: 'manual',
  annotations: [
    { code: 'medtronic600/smbg/user-rejected-sensor-calib' },
  ],
};

const medT600acceptedNoncalibManual = {
  type: 'smbg',
  units: 'mg/dL',
  value: 100,
  subType: 'manual',
  annotations: [
    { code: 'medtronic600/smbg/user-accepted-remote-bg' },
    { code: 'medtronic600/smbg/user-rejected-sensor-calib' },
  ],
};

const veryHigh = {
  type: 'smbg',
  units: 'mg/dL',
  value: 601,
  annotations: [
    {
      code: 'bg/out-of-range',
      value: 'high',
      threshold: 600,
    },
  ],
};

const veryLow = {
  type: 'smbg',
  units: 'mg/dL',
  value: 39,
  annotations: [
    {
      code: 'bg/out-of-range',
      value: 'low',
      threshold: 40,
    },
  ],
};

const props = {
  position: { top: 200, left: 200 },
  timePrefs: { timezoneAware: false },
  bgPrefs,
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

storiesOf('SMBGTooltip', module)
  .addDecorator(BackgroundDecorator)
  .add('target', () => (
    <div>
      {refDiv}
      <SMBGTooltip {...props} smbg={target} />
    </div>
  ))
  .add('low', () => (
    <div>
      {refDiv}
      <SMBGTooltip {...props} smbg={low} />
    </div>
  ))
  .add('high', () => (
    <div>
      {refDiv}
      <SMBGTooltip {...props} smbg={high} />
    </div>
  ))
  .add('veryHigh', () => (
    <div>
      {refDiv}
      <SMBGTooltip {...props} smbg={veryHigh} />
    </div>
  ))
  .add('veryLow', () => (
    <div>
      {refDiv}
      <SMBGTooltip {...props} smbg={veryLow} />
    </div>
  ))
  .add('manual', () => (
    <div>
      {refDiv}
      <SMBGTooltip {...props} smbg={manual} />
    </div>
  ))
  .add('linked', () => (
    <div>
      {refDiv}
      <SMBGTooltip {...props} smbg={linked} />
    </div>
  ))
  .add('medT600accepted', () => (
    <div>
      {refDiv}
      <SMBGTooltip {...props} smbg={medT600accepted} />
    </div>
  ))
  .add('medT600rejected', () => (
    <div>
      {refDiv}
      <SMBGTooltip {...props} smbg={medT600rejected} />
    </div>
  ))
  .add('medT600timedout', () => (
    <div>
      {refDiv}
      <SMBGTooltip {...props} smbg={medT600timeout} />
    </div>
  ))
  .add('medT600acceptedManual', () => (
    <div>
      {refDiv}
      <SMBGTooltip {...props} smbg={medT600acceptedManual} />
    </div>
  ))
  .add('medT600rejectedLinked', () => (
    <div>
      {refDiv}
      <SMBGTooltip {...props} smbg={medT600rejectedLinked} />
    </div>
  ))
  .add('medT600timeoutManual', () => (
    <div>
      {refDiv}
      <SMBGTooltip {...props} smbg={medT600timeoutManual} />
    </div>
  ))
  .add('medT600calibManual', () => (
    <div>
      {refDiv}
      <SMBGTooltip {...props} smbg={medT600calibManual} />
    </div>
  ))
  .add('medT600noncalibManual', () => (
    <div>
      {refDiv}
      <SMBGTooltip {...props} smbg={medT600noncalibManual} />
    </div>
  ))
  .add('medT600acceptedNoncalibManual', () => (
    <div>
      {refDiv}
      <SMBGTooltip {...props} smbg={medT600acceptedNoncalibManual} />
    </div>
  ));
