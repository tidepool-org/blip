import React from 'react';
import { mount } from 'enzyme';

import HoverBar from '../../../../src/components/common/stat/HoverBar';
import colors from '../../../../src/styles/colors.css';

describe('HoverBar', () => {
  let wrapper;

  const width = 300;

  const defaultProps = {
    barSpacing: 4,
    barWidth: 4,
    chartLabelWidth: 80,
    cornerRadius: { top: 2 },
    domain: {
      x: [0, 1],
      y: [0, 1],
    },
    index: 0,
    scale: {
      x: val => val,
      y: () => width,
    },
    width,
    y: 80,
  };

  beforeEach(() => {
    wrapper = mount(<HoverBar {...defaultProps} />);
  });

  it('should render without errors when required props provided', () => {
    expect(wrapper.find('HoverBar')).to.have.length(1);
  });

  it('should render a full-width transparent hover target area', () => {
    expect(wrapper.find('.HoverBarTarget')).to.have.length(1);
    expect(wrapper.find('.HoverBarTarget').childAt(0).is('Rect')).to.be.true;
    expect(wrapper.find('.HoverBarTarget').childAt(0).props().style.stroke).to.equal('transparent');
    expect(wrapper.find('.HoverBarTarget').childAt(0).props().style.fill).to.equal('transparent');
    expect(wrapper.find('.HoverBarTarget').childAt(0).props().width).to.equal(width);
  });

  it('should render a properly colored bar backround the full width of the rendering area', () => {
    expect(wrapper.find('.barBg')).to.have.length(1);
    expect(wrapper.find('.barBg').childAt(0).is('Rect')).to.be.true;
    expect(wrapper.find('.barBg').childAt(0).props().style.stroke).to.equal('transparent');
    expect(wrapper.find('.barBg').childAt(0).props().style.fill).to.equal(colors.axis);
    expect(wrapper.find('.barBg').childAt(0).props().width).to.equal(220); // width - chartLabelWidth
  });

  it('should render a bar with a width corresponding to the y prop value, corrected for the rendering area width', () => {
    // actual chart rendering width is corrected due to the chart labels taking some space
    const widthCorrection = (width - defaultProps.chartLabelWidth) / width;
    expect(widthCorrection).to.equal(0.7333333333333333); // (220 / 300), as per default props

    expect(wrapper.find('Bar')).to.have.length(1);
    expect(wrapper.find('Bar').props().width).to.equal(220);
    expect(wrapper.find('Bar').props().y).to.equal(58.666666666666664); // (defaultProps.y * widthCorrection)
  });
});
