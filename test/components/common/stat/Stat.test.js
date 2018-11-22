import React from 'react';
import { shallow } from 'enzyme';

import Stat from '../../../../src/components/common/stat/Stat';

describe('Stat', () => {
  let wrapper;

  const defaultProps = {
  };

  beforeEach(() => {
    wrapper = shallow(<Stat {...defaultProps} />);
  });

  it('should render', () => {
    expect(wrapper.find('Stat')).to.have.length(1);
  });
});
