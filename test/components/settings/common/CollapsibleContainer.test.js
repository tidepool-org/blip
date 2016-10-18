/* eslint-env node, mocha */
/* eslint no-console: 0*/

import React from 'react';
import { mount } from 'enzyme';

import CollapsibleContainer from '../../../../src/components/settings/common/CollapsibleContainer';
import SingleLineCollapsibleContainerLabel
  from '../../../../src/components/settings/common/SingleLineCollapsibleContainerLabel';
import TwoLineCollapsibleContainerLabel
  from '../../../../src/components/settings/common/TwoLineCollapsibleContainerLabel';

describe('CollapsibleContainer', () => {
  const label = {
    main: 'Foo',
    secondary: '(inactive)',
    units: 'lbs',
  };

  const labelClass = 'whatever';

  it('should render passed-in children', () => {
    const wrapper = mount(
      <CollapsibleContainer
        label={label}
        labelClass={labelClass}
        openByDefault
      >
        <div className="unique" />
      </CollapsibleContainer>
    );
    expect(wrapper.contains(<div className="unique" />)).to.equal(true);
  });

  it('should render TwoLineCollapsibleContainerLabel if given `twoLineLabel`', () => {
    const wrapper = mount(
      <CollapsibleContainer
        label={label}
        labelClass={labelClass}
        openByDefault={false}
        twoLineLabel
      >
        <div className="unique" />
      </CollapsibleContainer>
    );
    expect(wrapper.find(SingleLineCollapsibleContainerLabel)).to.have.length(0);
    expect(wrapper.find(TwoLineCollapsibleContainerLabel)).to.have.length(1);
  });

  it('should render the SingleLineCollapsibleContainerLabel if not given `twoLineLabel`', () => {
    const wrapper = mount(
      <CollapsibleContainer
        label={label}
        labelClass={labelClass}
        openByDefault={false}
        twoLineLabel={false}
      >
        <div className="unique" />
      </CollapsibleContainer>
    );
    expect(wrapper.find(SingleLineCollapsibleContainerLabel)).to.have.length(1);
    expect(wrapper.find(TwoLineCollapsibleContainerLabel)).to.have.length(0);
  });

  it('should render the Single... if given `twoLineLabel` but label.secondary empty', () => {
    const wrapper = mount(
      <CollapsibleContainer
        label={{ main: 'Foo', secondary: '', units: 'lbs' }}
        labelClass={labelClass}
        openByDefault={false}
        twoLineLabel
      >
        <div className="unique" />
      </CollapsibleContainer>
    );
    expect(wrapper.find(SingleLineCollapsibleContainerLabel)).to.have.length(1);
    expect(wrapper.find(TwoLineCollapsibleContainerLabel)).to.have.length(0);
  });

  it('should toggle isOpened state on click', () => {
    const wrapper = mount(
      <CollapsibleContainer
        label={label}
        labelClass={labelClass}
        openByDefault={false}
      >
        <div className="unique" />
      </CollapsibleContainer>
    );
    wrapper.find('.label').simulate('click');
    expect(wrapper.state().isOpened).to.equal(true);
    wrapper.find('.label').simulate('click');
    expect(wrapper.state().isOpened).to.equal(false);
  });

  it('should be open by default if given `openByDefault`', () => {
    const wrapper = mount(
      <CollapsibleContainer
        label={label}
        labelClass={labelClass}
        openByDefault
      >
        <div className="unique" />
      </CollapsibleContainer>
    );
    expect(wrapper.state().isOpened).to.equal(true);
  });

  it('should not be open if given `openByDefault=false`', () => {
    const wrapper = mount(
      <CollapsibleContainer
        label={label}
        labelClass={labelClass}
        openByDefault={false}
      >
        <div className="unique" />
      </CollapsibleContainer>
    );
    expect(wrapper.state().isOpened).to.equal(false);
  });
});
