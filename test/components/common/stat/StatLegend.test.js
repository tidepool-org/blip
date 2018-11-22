import React from 'react';
import { shallow } from 'enzyme';

import { formatClassesAsSelector } from '../../../helpers/cssmodules';
import StatLegend from '../../../../src/components/common/stat/StatLegend';
import styles from '../../../../src/components/common/stat/StatLegend.css';
import colors from '../../../../src/styles/colors.css';

describe('StatLegend', () => {
  let wrapper;

  const defaultProps = {
    items: [
      {
        id: 'basal',
        legendTitle: 'Basal',
      },
      {
        id: 'bolus',
        legendTitle: 'Bolus',
      },
    ],
  };

  beforeEach(() => {
    wrapper = shallow(<StatLegend {...defaultProps} />);
  });

  it('should render legend item titles', () => {
    const items = wrapper.find(formatClassesAsSelector(styles.StatLegendItem));
    expect(items).to.have.length(2);
    expect(items.at(0).text()).to.equal('Basal');
    expect(items.at(1).text()).to.equal('Bolus');
  });

  it('should render legend item borders in proper color based on id', () => {
    const items = wrapper.find(formatClassesAsSelector(styles.StatLegendItem));
    expect(items.at(0).props().style.borderBottomColor).to.equal(colors.basal);
    expect(items.at(1).props().style.borderBottomColor).to.equal(colors.bolus);
  });
});
