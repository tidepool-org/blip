import React from 'react';
import _ from 'lodash';
import { shallow, mount } from 'enzyme';
import mutationTracker from 'object-invariant-test-helper';

import {
  withDevices,
  mapStateToProps,
  getFetchers,
} from '../../../../app/pages/prescription/withDevices';

/* global chai */
/* global describe */
/* global it */
/* global expect */
/* global sinon */
/* global beforeEach */

describe('withDevices HOC', function() {
  describe('withDevices', function() {
    let wrapper;
    let Element;

    const fetcher = sinon.stub();

    let defaultProps = {
      fetchingDevices: { completed: false },
      devices: [{ id: 'one' }, { id: 'two' }],
      fetchers: [fetcher],
    };

    let props = overrides => _.assign({}, defaultProps, overrides);

    const Component = props => <div className="supplied-component" {...props} />

    beforeEach(() => {
      fetcher.resetHistory();

      Element = withDevices(Component);
      wrapper = shallow(<Element {...defaultProps} />);
    });

    it('should render the loader if devices have not been fetched', () => {
      expect(wrapper.dive().find('.loader')).to.have.lengthOf(1);
      expect(wrapper.dive().text()).to.equal('Loading...');
    });

    it('should render the supplied component with relevant props if devices have been fetched', () => {
      wrapper.setProps(props({
        fetchingDevices: { completed: true },
      }));

      expect(wrapper.dive().find('.loader')).to.have.lengthOf(0);

      const component = wrapper.dive().find('.supplied-component');
      expect(component).to.have.lengthOf(1);
      expect(component.prop('devices')).to.equal(defaultProps.devices);
    });

    it('should invoke all fetchers, but only on the first render', () => {
      wrapper = mount(<Element {...defaultProps} />)
      sinon.assert.callCount(fetcher, 1);

      wrapper.setProps(props({
        deviceId: 'otherId',
      }));

      sinon.assert.callCount(fetcher, 1);
    });
  });

  describe('mapStateToProps', () => {
    const state = {
      working: {
        fetchingDevices: { inProgress: true, completed: true },
      },
      devices: [{ id: 'one' }, { id: 'two' }],
    };

    const tracked = mutationTracker.trackObj(state);
    const result = mapStateToProps({ blip: state });

    it('should not mutate the state', () => {
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });

    it('should map `working.fetchingDevices` to `fetchingDevices`', () => {
      expect(result.fetchingDevices).to.deep.equal(state.working.fetchingDevices);
    });

    it('should pass through `devices`', () => {
      expect(result.devices).to.deep.equal(state.devices);
    });
  });

  describe('getFetchers', () => {
    const stateProps = {
      fetchingDevices: {
        inProgress: false,
        completed: null,
      },
    };

    const dispatchProps = {
      fetchDevices: sinon.stub().returns('fetchDevices'),
    };

    const api = {};

    it('should only add the fetchDevices fetcher if fetch is not already in progress or completed', () => {
      const defaultResult = getFetchers(dispatchProps, stateProps, api);
      expect(defaultResult.length).to.equal(1);
      expect(defaultResult[0]()).to.equal('fetchDevices');

      const inProgressResult = getFetchers(dispatchProps, {
        fetchingDevices: {
          inProgress: true,
          completed: null,
        },
      }, api);

      expect(inProgressResult.length).to.equal(0);

      const completedResult = getFetchers(dispatchProps, {
        fetchingDevices: {
          inProgress: false,
          completed: true,
        },
      }, api);

      expect(completedResult.length).to.equal(0);
    });
  });
});
