/* eslint-env node, mocha */
/* eslint no-console: 0*/

import React from 'react';
import { shallow } from 'enzyme';

import CollapsibleContainer from '../../../src/containers/common/CollapsibleContainer';

describe('CollapsibleContainer', () => {
  it('renders children when passed in', () => {
    const wrapper = shallow(
      <CollapsibleContainer label="test me">
        <div className="unique" />
      </CollapsibleContainer>
    );
    expect(wrapper.contains(<div className="unique" />)).to.equal(true);
  });
  it('has click event on label', () => {
    const wrapper = shallow(
      <CollapsibleContainer label="test me">
        <div className="unique" />
      </CollapsibleContainer>
    );
    wrapper.find('.label').simulate('click');
    expect(wrapper.state().isOpened).to.equal(true);
    wrapper.find('.label').simulate('click');
    expect(wrapper.state().isOpened).to.equal(false);
  });
});
