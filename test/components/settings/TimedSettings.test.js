/* eslint-env node, mocha */
/* eslint no-console: 0*/

import React from 'react';
import { shallow } from 'enzyme';

import TimedSettings from '../../../src/components/settings/TimedSettings';

describe('TimedSettings', () => {
  it('should render a table', () => {
    const wrapper = shallow(<TimedSettings />);
    expect(wrapper.find('table').length).to.equal(1);
  });
});
