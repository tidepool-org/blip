/* global afterEach, before, chai, describe, it, sinon */

import React from 'react';
import { shallow } from 'enzyme';

import Version from '../../../app/components/version/';

const expect = chai.expect;

describe('Version', () => {
  const props = {
    version: '1.15.4',
  };

  const wrapper = shallow(<Version {...props} />);

  it('should render the semver with `v` prepended', () => {
    expect(wrapper.text()).to.equal(`v${props.version}`);
  });
});