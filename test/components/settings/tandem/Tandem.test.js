/* eslint-env node, mocha */
/* eslint no-console: 0*/

import React from 'react';
import { shallow } from 'enzyme';

import Tandem from '../../../../src/components/settings/tandem/Tandem';

const multirateData = require('../../../../data/pumpSettings/tandem/multirate.json');
const flatrateData = require('../../../../data/pumpSettings/tandem/flatrate.json');

describe('Tandem', () => {
  it('should render without problems when bgUnits and pumpSettings provided', () => {
    console.error = sinon.stub();
    shallow(
      <Tandem
        pumpSettings={multirateData}
        bgUnits="mg/dL"
      />
    );
    expect(console.error.callCount).to.equal(0);
  });
  it('should find a header', () => {
    const wrapper = shallow(
      <Tandem
        pumpSettings={multirateData}
        bgUnits="mg/dL"
      />
    );
    expect(wrapper.find('Header')).to.have.length(1);
  });
  it('should find have the header deviceType as Tandem', () => {
    const wrapper = shallow(
      <Tandem
        pumpSettings={multirateData}
        bgUnits="mg/dL"
      />
    );
    expect(wrapper.find('Header').props().deviceType).to.equal('Tandem');
  });
  it('should have two tables ', () => {
    const wrapper = shallow(
      <Tandem
        pumpSettings={flatrateData}
        bgUnits="mg/dL"
      />
    );
    expect(wrapper.find('Table')).to.have.length(2);
  });
  it('should have two collapsible containers', () => {
    const wrapper = shallow(
      <Tandem
        pumpSettings={flatrateData}
        bgUnits="mg/dL"
      />
    );
    expect(wrapper.find('CollapsibleContainer')).to.have.length(2);
  });
});
