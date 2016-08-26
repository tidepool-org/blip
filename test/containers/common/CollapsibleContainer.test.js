/* eslint-env node, mocha */
/* eslint no-console: 0*/

import React from 'react';
import { shallow } from 'enzyme';

import CollapsibleContainer from '../../../src/containers/common/CollapsibleContainer';

describe('CollapsibleContainer', () => {
  it('renders children when passed in', () => {
    const wrapper = shallow(
      <CollapsibleContainer label="test me" openByDefault>
        <div className="unique" />
      </CollapsibleContainer>
    );
    expect(wrapper.contains(<div className="unique" />)).to.equal(true);
  });
  it('has click event on label', () => {
    const wrapper = shallow(
      <CollapsibleContainer label="test me" openByDefault={false}>
        <div className="unique" />
      </CollapsibleContainer>
    );
    wrapper.find('.label').simulate('click');
    expect(wrapper.state().isOpened).to.equal(true);
    wrapper.find('.label').simulate('click');
    expect(wrapper.state().isOpened).to.equal(false);
  });
  it('can set to be open by default', () => {
    const wrapper = shallow(
      <CollapsibleContainer label="test me" openByDefault>
        <div className="unique" />
      </CollapsibleContainer>
    );
    expect(wrapper.state().isOpened).to.equal(true);
  });
  it('can set to be closed by default', () => {
    const wrapper = shallow(
      <CollapsibleContainer label="test me" openByDefault={false}>
        <div className="unique" />
      </CollapsibleContainer>
    );
    expect(wrapper.state().isOpened).to.equal(false);
  });
});
