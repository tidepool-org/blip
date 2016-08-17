/* eslint-env node, mocha */
/* eslint no-console: 0*/

import React from 'react';
import { shallow } from 'enzyme';

import Header from '../../../../src/containers/settings/header/Header';

import styles from '../../../../src/containers/settings/header/Header.css';

describe('Header', () => {
  it('has click event on device type', () => {
    const wrapper = shallow(
      <Header
        deviceType="Testing"
        deviceMeta={{ name: 'SN123', uploaded: 'Jul 12th 2016' }}
      />
    );
    expect(wrapper.state().serialNumberClass).to.equal(styles.headerOuterHidden);
    wrapper.find('li').at(0).simulate('click');
    expect(wrapper.state().serialNumberClass).to.equal(styles.headerOuter);
    wrapper.find('li').at(0).simulate('click');
    expect(wrapper.state().serialNumberClass).to.equal(styles.headerOuterHidden);
  });
});
