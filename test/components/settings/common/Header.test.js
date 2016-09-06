/* eslint-env node, mocha */
/* eslint no-console: 0*/

import React from 'react';
import { shallow } from 'enzyme';

import Header from '../../../../src/components/settings/common/Header';

describe('Header', () => {
  it('has click event on device type', () => {
    const wrapper = shallow(
      <Header
        deviceType="Testing"
        deviceMeta={{ name: 'SN123', uploaded: 'Jul 12th 2016' }}
      />
    );
    expect(wrapper.state().serialNumberExpanded).to.be.false;
    wrapper.find('li').at(0).simulate('click');
    expect(wrapper.state().serialNumberExpanded).to.be.true;
    wrapper.find('li').at(0).simulate('click');
    expect(wrapper.state().serialNumberExpanded).to.be.false;
  });
});
