/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */
/* global chai */
/* global describe */
/* global context */
/* global sinon */
/* global it */
/* global beforeEach */
/* global afterEach */

import React from 'react';
import { mount } from 'enzyme';
import _ from 'lodash';

import DataSources from '../../../app/components/datasources';

const expect = chai.expect;

describe('DataSources', () => {
  
  const props = {
    dataSources: [],
    fetchDataSources: sinon.stub(),
    connectDataSource: sinon.stub(),
    disconnectDataSource: sinon.stub(),
    authorizedDataSource: {},
    trackMetric: sinon.stub(),
  };

  let wrapper;
  beforeEach(() => {
    wrapper = mount(
      <DataSources
        {...props}
      />
    );
  });

  afterEach(() => {
    props.fetchDataSources.reset();
    props.connectDataSource.reset();
    props.disconnectDataSource.reset();
    props.trackMetric.reset();
  });

  it('should be a function', () => {
    expect(DataSources).to.be.a('function');
  });

  it('should render without errors when provided all required props', () => {
    console.error = sinon.stub();
    expect(wrapper.find('.DataSources')).to.have.length(1);
    expect(console.error.callCount).to.equal(0);
  });
});
