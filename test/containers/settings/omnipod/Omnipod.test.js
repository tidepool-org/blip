/* eslint-env node, mocha */
/* eslint no-console: 0*/

import React from 'react';
import { shallow } from 'enzyme';

import Omnipod from '../../../../src/containers/settings/omnipod/Omnipod';

const multirateData = require('../../../../data/pumpSettings/omnipod/multirate.json');

describe('Omnipod', () => {
  it('should render without problems when bgUnits and pumpSettings provided', () => {
    console.error = sinon.stub();
    shallow(
      <Omnipod
        pumpSettings={multirateData}
        bgUnits="mg/dL"
      />
    );
    expect(console.error.callCount).to.equal(0);
  });
  it('should find a header', () => {
    const wrapper = shallow(
      <Omnipod
        pumpSettings={multirateData}
        bgUnits="mg/dL"
      />
    );
    expect(wrapper.find('Header')).to.have.length(1);
  });
  it('should find have the header deviceType as Omnipod', () => {
    const wrapper = shallow(
      <Omnipod
        pumpSettings={multirateData}
        bgUnits="mg/dL"
      />
    );
    expect(wrapper.find('Header').props().deviceType).to.equal('Omnipod');
  });
  it('should have five tables', () => {
    const wrapper = shallow(
      <Omnipod
        pumpSettings={multirateData}
        bgUnits="mg/dL"
      />
    );
    expect(wrapper.find('Table')).to.have.length(5);
  });
  it('should have two collapsible containers', () => {
    const wrapper = shallow(
      <Omnipod
        pumpSettings={multirateData}
        bgUnits="mg/dL"
      />
    );
    expect(wrapper.find('CollapsibleContainer')).to.have.length(2);
  });
});
