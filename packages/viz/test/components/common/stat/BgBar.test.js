import React from 'react';
import { mount } from 'enzyme';
import _ from 'lodash';

import BgBar from '../../../../src/components/common/stat/BgBar';
import colors from '../../../../src/styles/colors.css';
import { MGDL_CLAMP_TOP } from '../../../../src/utils/constants';

describe('BgBar', () => {
  let wrapper;

  const avgGlucoseDatum = {
    y: 100,
  };

  const avgGlucoseDatumDisabled = {
    y: -1,
  };

  const stdDevDatum = {
    ...avgGlucoseDatum,
    deviation: {
      value: 20,
    },
  };

  const stdDevDatumDisabled = {
    ...avgGlucoseDatum,
    deviation: {
      value: -1,
    },
  };

  const defaultProps = {
    barWidth: 4,
    bgPrefs: {
      bgBounds: {
        veryHighThreshold: 300,
        targetUpperBound: 180,
        targetLowerBound: 70,
        veryLowThreshold: 54,
      },
      bgUnits: 'mg/dL',
    },
    chartLabelWidth: 80,
    datum: avgGlucoseDatum,
    domain: {
      x: [0, MGDL_CLAMP_TOP],
      y: [0, 1],
    },
    scale: {
      x: val => val,
      y: val => val,
    },
    width: 300,
  };

  const props = overrides => _.assign({}, defaultProps, overrides);

  beforeEach(() => {
    wrapper = mount(<BgBar {...defaultProps} />);
  });

  it('should render without errors when required props provided', () => {
    expect(wrapper.find('BgBar')).to.have.length(1);
  });

  context('showing Average Glucose', () => {
    beforeEach(() => {
      wrapper.setProps(props({ datum: avgGlucoseDatum }));
    });

    it('should render the `bgScale` element', () => {
      expect(wrapper.find('.bgScale')).to.have.length(1);
    });

    it('should render the `bgMean` element', () => {
      expect(wrapper.find('.bgMean')).to.have.length(1);
    });

    it('should not render the `bgMean` element when disabled', () => {
      wrapper.setProps(props({ datum: avgGlucoseDatumDisabled }));
      expect(wrapper.find('.bgMean')).to.have.length(0);
    });

    it('should not render the `bgDeviation` element', () => {
      expect(wrapper.find('.bgDeviation')).to.have.length(0);
    });
  });

  context('showing Standard Deviation', () => {
    beforeEach(() => {
      wrapper.setProps(props({ datum: stdDevDatum }));
    });

    it('should render the `bgScale` element', () => {
      expect(wrapper.find('.bgScale')).to.have.length(1);
    });

    it('should render the `bgDeviation` element', () => {
      expect(wrapper.find('.bgDeviation')).to.have.length(1);
    });

    it('should not render the `bgDeviation` element when disabled', () => {
      wrapper.setProps(props({ datum: stdDevDatumDisabled }));
      expect(wrapper.find('.bgDeviation')).to.have.length(0);
    });

    it('should not render the `bgMean` element', () => {
      expect(wrapper.find('.bgMean')).to.have.length(0);
    });
  });

  describe('bgScale', () => {
    let bgScale;

    beforeEach(() => {
      bgScale = () => wrapper.find('.bgScale');
    });

    it('should render a three-bar scale with arcs on each end', () => {
      expect(bgScale().children()).to.have.length(5);
      expect(bgScale().childAt(0).is('Arc')).to.be.true;
      expect(bgScale().childAt(1).is('Rect')).to.be.true;
      expect(bgScale().childAt(2).is('Rect')).to.be.true;
      expect(bgScale().childAt(3).is('Rect')).to.be.true;
      expect(bgScale().childAt(4).is('Arc')).to.be.true;
    });

    it('should render the three-bar scale with the proper colors', () => {
      expect(bgScale().childAt(0).props().style.fill).to.equal(colors.low);
      expect(bgScale().childAt(1).props().style.fill).to.equal(colors.low);
      expect(bgScale().childAt(2).props().style.fill).to.equal(colors.target);
      expect(bgScale().childAt(3).props().style.fill).to.equal(colors.high);
      expect(bgScale().childAt(4).props().style.fill).to.equal(colors.high);
    });

    it('should render the three-bar scale with the disabled color when disabled', () => {
      wrapper.setProps(props({ datum: avgGlucoseDatumDisabled }));

      expect(bgScale().childAt(0).props().style.fill).to.equal(colors.statDisabled);
      expect(bgScale().childAt(1).props().style.fill).to.equal(colors.statDisabled);
      expect(bgScale().childAt(2).props().style.fill).to.equal(colors.statDisabled);
      expect(bgScale().childAt(3).props().style.fill).to.equal(colors.statDisabled);
      expect(bgScale().childAt(4).props().style.fill).to.equal(colors.statDisabled);
    });

    it('should render proper widths for each section of the three-bar scale', () => {
      const {
        width,
        bgPrefs: { bgBounds },
        chartLabelWidth,
      } = wrapper.props();

      // actual chart rendering width is corrected due to the chart labels taking some space
      const barRadius = 2;
      const widthCorrection = (width - chartLabelWidth) / width;
      expect(widthCorrection).to.equal(0.7333333333333333); // (220 / 300), as per default props

      const expectedWidths = {
        low: (bgBounds.targetLowerBound) * widthCorrection,
        target: (bgBounds.targetUpperBound - bgBounds.targetLowerBound) * widthCorrection,
        high: (MGDL_CLAMP_TOP - bgBounds.targetUpperBound) * widthCorrection,
      };

      expect(bgScale().childAt(1).props().width).to.equal(expectedWidths.low - barRadius);
      expect(bgScale().childAt(2).props().width).to.equal(expectedWidths.target);
      expect(bgScale().childAt(3).props().width).to.equal(expectedWidths.high - barRadius);
    });
  });

  describe('bgMean', () => {
    let bgMean;

    beforeEach(() => {
      bgMean = () => wrapper.find('.bgMean');
    });

    it('should render a bgMean point', () => {
      expect(bgMean().children()).to.have.length(1);
      expect(bgMean().childAt(0).is('Point')).to.be.true;
    });

    it('should render the bg mean with the proper colors', () => {
      // target
      expect(bgMean().childAt(0).props().style.fill).to.equal(colors.target);

      // veryLow
      wrapper.setProps(props({ datum: {
        y: 53,
      } }));
      expect(bgMean().childAt(0).props().style.fill).to.equal(colors.low);

      // low
      wrapper.setProps(props({ datum: {
        y: 69,
      } }));
      expect(bgMean().childAt(0).props().style.fill).to.equal(colors.low);

      // high
      wrapper.setProps(props({ datum: {
        y: 181,
      } }));
      expect(bgMean().childAt(0).props().style.fill).to.equal(colors.high);

      // veryHigh
      wrapper.setProps(props({ datum: {
        y: 251,
      } }));
      expect(bgMean().childAt(0).props().style.fill).to.equal(colors.high);
    });
  });

  describe('bgDeviation', () => {
    let bgDeviation;

    beforeEach(() => {
      wrapper.setProps(props({ datum: stdDevDatum }));
      bgDeviation = () => wrapper.find('.bgDeviation');
    });

    it('should render 2 standard deviation markers', () => {
      expect(bgDeviation().children()).to.have.length(2);
      expect(bgDeviation().childAt(0).is('Rect')).to.be.true;
      expect(bgDeviation().childAt(1).is('Rect')).to.be.true;
    });

    it('should render the deviation markers with the proper colors', () => {
      // target - target
      expect(bgDeviation().childAt(0).props().style.fill).to.equal(colors.target);
      expect(bgDeviation().childAt(1).props().style.fill).to.equal(colors.target);

      // veryLow - low
      wrapper.setProps(props({ datum: {
        y: 50,
        deviation: { value: 18 },
      } }));
      expect(bgDeviation().childAt(0).props().style.fill).to.equal(colors.low);
      expect(bgDeviation().childAt(1).props().style.fill).to.equal(colors.low);

      // low - target
      wrapper.setProps(props({ datum: {
        y: 70,
        deviation: { value: 40 },
      } }));
      expect(bgDeviation().childAt(0).props().style.fill).to.equal(colors.low);
      expect(bgDeviation().childAt(1).props().style.fill).to.equal(colors.target);

      // target - high
      wrapper.setProps(props({ datum: {
        y: 160,
        deviation: { value: 40 },
      } }));
      expect(bgDeviation().childAt(0).props().style.fill).to.equal(colors.target);
      expect(bgDeviation().childAt(1).props().style.fill).to.equal(colors.high);

      // high - veryHigh
      wrapper.setProps(props({ datum: {
        y: 240,
        deviation: { value: 18 },
      } }));
      expect(bgDeviation().childAt(0).props().style.fill).to.equal(colors.high);
      expect(bgDeviation().childAt(1).props().style.fill).to.equal(colors.high);
    });

    it('should set the color to `low` when the deviation is > the mean, resulting in a negative low bar value', () => {
      // -1 low value
      wrapper.setProps(props({ datum: {
        y: 50,
        deviation: { value: 51 },
      } }));

      expect(bgDeviation().childAt(0).props().style.fill).to.equal(colors.low);
    });

    it('should constrain the bars to render within the scale when the deviation would cause them to render outside of it', () => {
      // -50 to 450 -- scale only shows 0 to 400
      wrapper.setProps(props({ datum: {
        y: 200,
        deviation: { value: 250 },
      } }));

      const scaleWidth = defaultProps.width - defaultProps.chartLabelWidth;

      expect(bgDeviation().childAt(0).props().x).to.equal(0);

      expect(scaleWidth).to.equal(220);
      expect(bgDeviation().childAt(1).props().x).to.equal(217); // scaleWidth - 3 for bar thickness
    });
  });
});
