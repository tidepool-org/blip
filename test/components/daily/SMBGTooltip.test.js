/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

/* eslint-disable max-len */

import React from 'react';

import { mount } from 'enzyme';

import { formatClassesAsSelector } from '../../helpers/cssmodules';
import colors from '../../../src/styles/colors.css';

import SMBGTooltip from '../../../src/components/daily/smbgtooltip/SMBGTooltip';
import styles from '../../../src/components/daily/smbgtooltip/SMBGTooltip.css';

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

const props = {
  position: { top: 200, left: 200 },
  timePrefs: { timezoneAware: false },
  bgPrefs,
};

const bgValueSelector = `${formatClassesAsSelector(styles.confirmBg)} ${formatClassesAsSelector(styles.value)}`;
const sourceValueSelector = `${formatClassesAsSelector(styles.source)} ${formatClassesAsSelector(styles.value)}`;
const glucoseValueSelector = `${formatClassesAsSelector(styles.bg)} ${formatClassesAsSelector(styles.value)}`;

describe('SMBGTooltip', () => {
  it('should render without issue when all properties provided', () => {
    const wrapper = mount(<SMBGTooltip {...props} smbg={target} />);
    expect(wrapper.find(formatClassesAsSelector(styles.bg))).to.have.length(1);
  });

  it('should render "target" color for target bg', () => {
    const wrapper = mount(<SMBGTooltip {...props} smbg={target} />);
    expect(wrapper.find('Tooltip').instance().props.tailColor).to.equal(colors.target);
    expect(wrapper.find('Tooltip').instance().props.borderColor).to.equal(colors.target);
  });

  it('should render "high" color for high bg', () => {
    const wrapper = mount(<SMBGTooltip {...props} smbg={high} />);
    expect(wrapper.find('Tooltip').instance().props.tailColor).to.equal(colors.high);
    expect(wrapper.find('Tooltip').instance().props.borderColor).to.equal(colors.high);
  });

  it('should render "veryHigh" color for very high bg', () => {
    const wrapper = mount(<SMBGTooltip {...props} smbg={veryHigh} />);
    expect(wrapper.find('Tooltip').instance().props.tailColor).to.equal(colors.veryHigh);
    expect(wrapper.find('Tooltip').instance().props.borderColor).to.equal(colors.veryHigh);
  });

  it('should render "low" color for low bg', () => {
    const wrapper = mount(<SMBGTooltip {...props} smbg={low} />);
    expect(wrapper.find('Tooltip').instance().props.tailColor).to.equal(colors.low);
    expect(wrapper.find('Tooltip').instance().props.borderColor).to.equal(colors.low);
  });

  it('should render "veryLow" color for very low bg', () => {
    const wrapper = mount(<SMBGTooltip {...props} smbg={veryLow} />);
    expect(wrapper.find('Tooltip').instance().props.tailColor).to.equal(colors.veryLow);
    expect(wrapper.find('Tooltip').instance().props.borderColor).to.equal(colors.veryLow);
  });

  it('should render "manual" for a manual smbg', () => {
    const wrapper = mount(<SMBGTooltip {...props} smbg={manual} />);
    expect(wrapper.find(formatClassesAsSelector(styles.source))).to.have.length(1);
    expect(wrapper.find(sourceValueSelector).text()).to.equal('Manual');
  });

  it('should render "linked" for a linked smbg', () => {
    const wrapper = mount(<SMBGTooltip {...props} smbg={linked} />);
    expect(wrapper.find(formatClassesAsSelector(styles.source))).to.have.length(1);
    expect(wrapper.find(sourceValueSelector).text()).to.equal('Linked');
  });

  it('should render "Yes" for a confirmed medtronic 600 series smbg', () => {
    const wrapper = mount(<SMBGTooltip {...props} smbg={medT600accepted} />);
    expect(wrapper.find(formatClassesAsSelector(styles.confirmBg))).to.have.length(1);
    expect(wrapper.find(bgValueSelector).text()).to.equal('Yes');
  });

  it('should render "No" for a rejected medtronic 600 series smbg', () => {
    const wrapper = mount(<SMBGTooltip {...props} smbg={medT600rejected} />);
    expect(wrapper.find(formatClassesAsSelector(styles.confirmBg))).to.have.length(1);
    expect(wrapper.find(bgValueSelector).text()).to.equal('No');
  });

  it('should render "Timed Out" for a timed out medtronic 600 series smbg', () => {
    const wrapper = mount(<SMBGTooltip {...props} smbg={medT600timeout} />);
    expect(wrapper.find(formatClassesAsSelector(styles.confirmBg))).to.have.length(1);
    expect(wrapper.find(bgValueSelector).text()).to.equal('Timed Out');
  });

  it('should render "Yes" and "Manual" for a confirmed manual medtronic 600 series smbg', () => {
    const wrapper = mount(<SMBGTooltip {...props} smbg={medT600acceptedManual} />);
    expect(wrapper.find(formatClassesAsSelector(styles.confirmBg))).to.have.length(1);
    expect(wrapper.find(bgValueSelector).text()).to.equal('Yes');
    expect(wrapper.find(formatClassesAsSelector(styles.source))).to.have.length(1);
    expect(wrapper.find(sourceValueSelector).text()).to.equal('Manual');
  });

  it('should render "No" and "Linked" for a rejected linked medtronic 600 series smbg', () => {
    const wrapper = mount(<SMBGTooltip {...props} smbg={medT600rejectedLinked} />);
    expect(wrapper.find(formatClassesAsSelector(styles.confirmBg))).to.have.length(1);
    expect(wrapper.find(bgValueSelector).text()).to.equal('No');
    expect(wrapper.find(formatClassesAsSelector(styles.source))).to.have.length(1);
    expect(wrapper.find(sourceValueSelector).text()).to.equal('Linked');
  });

  it('should render "Timed Out" and "Manual" for a timed out manual medtronic 600 series smbg', () => {
    const wrapper = mount(<SMBGTooltip {...props} smbg={medT600timeoutManual} />);
    expect(wrapper.find(formatClassesAsSelector(styles.confirmBg))).to.have.length(1);
    expect(wrapper.find(bgValueSelector).text()).to.equal('Timed Out');
    expect(wrapper.find(formatClassesAsSelector(styles.source))).to.have.length(1);
    expect(wrapper.find(sourceValueSelector).text()).to.equal('Manual');
  });

  it('should render "Manual" for a manual medtronic 600 series smbg', () => {
    const wrapper = mount(<SMBGTooltip {...props} smbg={medT600calibManual} />);
    expect(wrapper.find(formatClassesAsSelector(styles.calibration))).to.have.length(0);
    expect(wrapper.find(formatClassesAsSelector(styles.source))).to.have.length(1);
    expect(wrapper.find(sourceValueSelector).text()).to.equal('Manual');
  });

  it('should render "Manual" for a non-calibration manual medtronic 600 series smbg', () => {
    const wrapper = mount(<SMBGTooltip {...props} smbg={medT600noncalibManual} />);
    expect(wrapper.find(formatClassesAsSelector(styles.calibration))).to.have.length(0);
    expect(wrapper.find(formatClassesAsSelector(styles.source))).to.have.length(1);
    expect(wrapper.find(sourceValueSelector).text()).to.equal('Manual');
  });

  it('should render "Yes" and "Manual" for an accepted non-calibration manual medtronic 600 series smbg', () => {
    const wrapper = mount(<SMBGTooltip {...props} smbg={medT600acceptedNoncalibManual} />);
    expect(wrapper.find(formatClassesAsSelector(styles.confirmBg))).to.have.length(1);
    expect(wrapper.find(bgValueSelector).text()).to.equal('Yes');
    expect(wrapper.find(formatClassesAsSelector(styles.calibration))).to.have.length(0);
    expect(wrapper.find(formatClassesAsSelector(styles.source))).to.have.length(1);
    expect(wrapper.find(sourceValueSelector).text()).to.equal('Manual');
  });

  it('should render "High" and an annotation for a "very-high" smbg', () => {
    const wrapper = mount(<SMBGTooltip {...props} smbg={veryHigh} />);
    expect(wrapper.find(formatClassesAsSelector(styles.annotation))).to.have.length(1);
    expect(wrapper.find(glucoseValueSelector).text()).to.equal('High');
  });

  it('should render "Low" and an annotation for a "very-low" smbg', () => {
    const wrapper = mount(<SMBGTooltip {...props} smbg={veryLow} />);
    expect(wrapper.find(formatClassesAsSelector(styles.annotation))).to.have.length(1);
    expect(wrapper.find(glucoseValueSelector).text()).to.equal('Low');
  });
});
