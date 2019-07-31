/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
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
/* global chai */
/* global describe */
/* global context */
/* global sinon */
/* global it */
/* global beforeEach */
/* global afterEach */

import React from 'react';
import _ from 'lodash';
import { shallow, mount } from 'enzyme';

import BgSourceToggle from '../../../../app/components/chart/bgSourceToggle';

const expect = chai.expect;

describe('BgSourceToggle', () => {
  const props = {
    bgSource: 'cbg',
    bgSources: {
      cbg: true,
      smbg: true,
    },
    onClickBgSourceToggle: sinon.stub(),
  };

  let wrapper;
  beforeEach(() => {
    wrapper = shallow(<BgSourceToggle {...props} />);
  });

  afterEach(() => {
    props.onClickBgSourceToggle.reset();
  });

  it('should render without errors when provided all required props', () => {
    console.error = sinon.stub();

    expect(wrapper.find('.toggle-container')).to.have.length(1);
    expect(wrapper.find('.toggle-container').children()).to.have.length(1);
    expect(console.error.callCount).to.equal(0);
  });

  it('should render toggle if either cbg or smbg sources are available', () => {
    wrapper.setProps(_.assign({}, props, {
      bgSources: {
        cbg: false,
        smbg: true,
      },
    }));

    expect(wrapper.find('.toggle-container').children()).to.have.length(1);

    wrapper.setProps(_.assign({}, props, {
      bgSources: {
        cbg: true,
        smbg: false,
      },
    }));
    expect(wrapper.find('.toggle-container').children()).to.have.length(1);
  });

  it('should not render toggle if cbg and smbg sources unavailable', () => {
    wrapper.setProps(_.assign({}, props, {
      bgSources: {
        cbg: false,
        smbg: false,
      },
    }));

    expect(wrapper.find('.toggle-container').children()).to.have.length(0);
  });

  it('should disable the toggle if either cbg or smbg sources are available', () => {
    let toggle = () => wrapper.find('.toggle-container').children('TwoOptionToggle');
    expect(toggle().props().disabled).to.be.false;

    wrapper.setProps(_.assign({}, props, {
      bgSources: {
        cbg: true,
        smbg: false,
      },
    }));


    expect(toggle().props().disabled).to.be.true;

    wrapper.setProps(_.assign({}, props, {
      bgSources: {
        cbg: false,
        smbg: true,
      },
    }));

    expect(toggle().props().disabled).to.be.true;
  });

  it('should activate the appropriate source when bgSource prop changes', () => {
    let toggle = () => wrapper.find('.toggle-container').children('TwoOptionToggle');

    expect(toggle().props().left.label).to.equal('BGM');
    expect(toggle().props().left.state).to.be.false;

    expect(toggle().props().right.label).to.equal('CGM');
    expect(toggle().props().right.state).to.be.true;

    wrapper.setProps(_.assign({}, props, {
      bgSource: 'smbg',
    }));

    expect(toggle().props().left.label).to.equal('BGM');
    expect(toggle().props().left.state).to.be.true;

    expect(toggle().props().right.label).to.equal('CGM');
    expect(toggle().props().right.state).to.be.false;
  });

  it('should call the click handler with new bgSource prop when clicked', () => {
    wrapper = mount(<BgSourceToggle {...props} />);
    let toggle = () => wrapper.find('.toggle-container').children('TwoOptionToggle');

    sinon.assert.callCount(props.onClickBgSourceToggle, 0);

    expect(wrapper.props().bgSource).to.equal('cbg');

    toggle().find('Toggle').simulate('click');

    sinon.assert.callCount(props.onClickBgSourceToggle, 1);
    sinon.assert.calledWith(props.onClickBgSourceToggle, sinon.match({}), 'smbg');

    wrapper.setProps(_.assign({}, props, {
      bgSource: 'smbg',
    }));

    expect(wrapper.props().bgSource).to.equal('smbg');

    toggle().find('Toggle').simulate('click');

    sinon.assert.callCount(props.onClickBgSourceToggle, 2);
    sinon.assert.calledWith(props.onClickBgSourceToggle, sinon.match({}), 'cbg');
  });
});
