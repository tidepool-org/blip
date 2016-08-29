/* eslint-env node, mocha */
/* eslint no-console: 0*/

import React from 'react';
import { shallow } from 'enzyme';

import Medtronic from '../../../../src/containers/settings/medtronic/Medtronic';

const multirateData = require('../../../../data/pumpSettings/medtronic/multirate.json');

describe('Medtronic', () => {
  it('should render without problems when bgUnits and pumpSettings provided', () => {
    console.error = sinon.stub();
    shallow(
      <Medtronic
        pumpSettings={multirateData}
        bgUnits="mg/dL"
      />
    );
    expect(console.error.callCount).to.equal(0);
  });
  it('should find a header', () => {
    const wrapper = shallow(
      <Medtronic
        pumpSettings={multirateData}
        bgUnits="mg/dL"
      />
    );
    expect(wrapper.find('Header')).to.have.length(1);
  });
  it('should have the header deviceType as Medtronic', () => {
    const wrapper = shallow(
      <Medtronic
        pumpSettings={multirateData}
        bgUnits="mg/dL"
      />
    );
    expect(wrapper.find('Header').props().deviceType).to.equal('Medtronic');
  });
  it('should have five tables', () => {
    const wrapper = shallow(
      <Medtronic
        pumpSettings={multirateData}
        bgUnits="mg/dL"
      />
    );
    expect(wrapper.find('Table')).to.have.length(5);
  });
  it('should have two collapsible containers', () => {
    const wrapper = shallow(
      <Medtronic
        pumpSettings={multirateData}
        bgUnits="mg/dL"
      />
    );
    expect(wrapper.find('CollapsibleContainer')).to.have.length(2);
  });
});
