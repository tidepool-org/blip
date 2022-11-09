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

  let dataSources = [
    {
      providerType: 'oauth',
      providerName: 'dexcom',
      state: 'connected',
      lastImportTime: '2017-09-08T02:30:32+00:00',
      latestDataTime: '2017-09-08T02:30:32+00:00',
      error: 'an error occured'
    }
  ];

  let props = {
    dataSources: dataSources,
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

  describe('render', () => {
    it('without problems', () => {
      expect(wrapper.find(DataSources)).to.have.length(1);
    });

    it('info for each datasource', () => {
      expect(props.dataSources).to.have.length(1);
      expect(wrapper.find('.DataSource-info')).to.have.length(1);
    });

    it('logo that matches provider', () => {
      expect(wrapper.find('.DataSource-logo-dexcom')).to.have.length(1);
    });

    it('button to disconnect as we are connected', () => {
      expect(props.dataSources[0].state).to.equal('connected');
      expect(wrapper.find('.DataSource-action-button-disconnect-dexcom')).to.have.length(1);
    });

    it('indicator to show we are connected', () => {
      expect(wrapper.find('.DataSource-status-indicator-connected')).to.have.length(1);
    });

    it('a status message', () => {
      expect(wrapper.find('.DataSource-status-message')).to.have.length(1);
    });
  });

  describe('handleDisconnectDataSource when DataSource-action-button-disconnect clicked', () => {
    it('metrics called', () => {
      wrapper.find('.DataSource-action-button-disconnect-dexcom').simulate('click');
      expect(props.trackMetric.calledWith('Web - data source disconnect clicked')).to.be.true;
      expect(props.trackMetric.callCount).to.equal(1);
    });

    it('disconnectDataSource called', () => {
      wrapper.find('.DataSource-action-button-disconnect-dexcom').simulate('click');
      expect(props.disconnectDataSource.callCount).to.equal(1);
    });
  });

  describe('handleConnectDataSource when DataSource-action-button-connect clicked', () => {
    beforeEach(() => {
      dataSources[0].state = 'disconnected';
      props.dataSources = dataSources;
      wrapper = mount(
        <DataSources
          {...props}
        />
      );
    });

    it('metrics called with settings as default location', () => {
      wrapper.find('.DataSource-action-button-connect-dexcom').simulate('click');
      sinon.assert.calledWithMatch(props.trackMetric, 'Web - data source connect clicked', sinon.match({ location: 'settings' }));
      expect(props.trackMetric.callCount).to.equal(1);
    });

    it('metrics called with location specified in query param', () => {
      wrapper.setProps({
        queryParams: {
          dexcomConnect: 'banner',
        },
      });

      wrapper.find('.DataSource-action-button-connect-dexcom').simulate('click');
      sinon.assert.calledWithMatch(props.trackMetric, 'Web - data source connect clicked', sinon.match({ location: 'banner' }));
      expect(props.trackMetric.callCount).to.equal(1);
    });

    it('connectDataSource called', () => {
      wrapper.find('.DataSource-action-button-connect-dexcom').simulate('click');
      expect(props.connectDataSource.callCount).to.equal(1);
    });
  });

  describe('error message', () => {
    it('when unauthorized', () => {
      expect(
        wrapper.instance().getWrappedInstance().calculateErrorMessage({ code: 'unauthenticated' })
      ).to.equal('Login expired - try signing out & in again');
    });

    it('when anything else', () => {
      expect(
        wrapper.instance().getWrappedInstance().calculateErrorMessage('stuff')
      ).to.equal('An unknown error occurred');
    });
  });

  describe('state message', () => {
    it('when connected', () => {
      expect(
        wrapper.instance().getWrappedInstance().calculateMessage(dataSources[0], 'connected')
      ).to.contain('Last data ');
    });

    it('when disconnected', () => {
      expect(
        wrapper.instance().getWrappedInstance().calculateMessage(dataSources[0], 'disconnected')
      ).to.equal('No data available - click Connect to enable');
    });

    it('when anything else', () => {
      expect(
        wrapper.instance().getWrappedInstance().calculateMessage(dataSources[0], 'hmmm')
      ).to.equal('An unknown error occurred');
    });
  });

  describe('calculating state', () => {
    it('when connected', () => {
      expect(
        wrapper.instance().getWrappedInstance().calculateState({state: 'connected'})
      ).to.equal('connected');
    });

    it('when error', () => {
      expect(
        wrapper.instance().getWrappedInstance().calculateState({state: 'error'})
      ).to.equal('error');
    });

    it('when disconnected', () => {
      expect(
        wrapper.instance().getWrappedInstance().calculateState({state: 'disconnected'})
      ).to.equal('disconnected');
    });

    it('when other', () => {
      expect(
        wrapper.instance().getWrappedInstance().calculateState({state: 'other'})
      ).to.equal('error');
    });

    it('when not set', () => {
      expect(
        wrapper.instance().getWrappedInstance().calculateState()
      ).to.equal('disconnected');
    });
  });

  describe('calculate popup id', () => {
    it('appends given id to org.tidepool.web.', () => {
      expect(
        wrapper.instance().getWrappedInstance().calculatePopupId({id: 'mine'})
      ).to.equal('org.tidepool.web.mine');
    });
  });

  describe('componentDidMount', () => {
    it('appends given id to org.tidepool.web.', () => {
      expect(
        wrapper.instance().getWrappedInstance().calculatePopupId({id: 'mine'})
      ).to.equal('org.tidepool.web.mine');
    });
  });
});
