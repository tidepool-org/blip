import React from 'react';
import { shallow } from 'enzyme';

import { formatClassesAsSelector } from '../../../helpers/cssmodules';
import Stat from '../../../../src/components/common/stat/Stat';
import styles from '../../../../src/components/common/stat/Stat.css';
import { statFormats, statTypes } from '../../../../src/utils/stat';

describe('Stat', () => {
  let wrapper;

  const data = {
    data: [
      {
        value: 60,
      },
    ],
    dataPaths: {
      summary: 'data.0',
    },
  };

  const defaultProps = {
    title: 'My Stat',
    data,
    dataFormat: statFormats.percentage,
    type: statTypes.simple,
  };

  beforeEach(() => {
    wrapper = shallow(<Stat {...defaultProps} />);
  });

  it('should render', () => {
    expect(wrapper.find(formatClassesAsSelector(styles.StatWrapper))).to.have.length(1);
  });
});
