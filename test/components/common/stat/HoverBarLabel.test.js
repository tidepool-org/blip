import React from 'react';
import { mount } from 'enzyme';
import _ from 'lodash';

import HoverBarLabel from '../../../../src/components/common/stat/HoverBarLabel';

describe('HoverBarLabel', () => {
  let wrapper;

  const defaultProps = {
    barWidth: 30,
    isDisabled: () => false,
    domain: {
      x: [0, 1],
      y: [0, 1],
    },
    style: {},
    scale: {
      x: val => val,
      y: val => val,
    },
    text: () => 'text!',
    tooltipText: () => 'tooltip!',
  };

  const props = overrides => _.assign({}, defaultProps, overrides);

  beforeEach(() => {
    wrapper = mount(<HoverBarLabel {...defaultProps} />);
  });

  it('should render the text prop', () => {
    expect(wrapper.find('VictoryLabel')).to.have.length(1);
    expect(wrapper.find('VictoryLabel').text()).to.equal('text!');
  });

  it('should render the text element with the styles provided in the style prop', () => {
    wrapper.setProps(props({ style: { fill: 'mauve', fontSize: '40px' } }));
    expect(wrapper.find('VictoryLabel').props().style.fill).to.equal('mauve');
    expect(wrapper.find('VictoryLabel').props().style.fontSize).to.equal('40px');
  });

  it('should render the tooltip text', () => {
    expect(wrapper.find('VictoryTooltip')).to.have.length(1);
    expect(wrapper.find('VictoryTooltip').props().text()).to.equal('tooltip!');
  });

  it('should render the text element with the styles provided in the style prop', () => {
    wrapper.setProps(props({ style: { fill: 'mauve', fontSize: '40px' } }));
    expect(wrapper.find('VictoryTooltip').props().style.fill).to.equal('mauve');
  });

  it('should enforce the tooltip fontsize to the minimum of half the bar width or 12', () => {
    wrapper.setProps(props({ barWidth: 30 }));
    expect(wrapper.find('VictoryTooltip').props().style.fontSize).to.equal(12);

    wrapper.setProps(props({ barWidth: 20 }));
    expect(wrapper.find('VictoryTooltip').props().style.fontSize).to.equal(10);
  });
});
