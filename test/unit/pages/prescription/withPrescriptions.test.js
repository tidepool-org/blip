import React from 'react';
import _ from 'lodash';
import { shallow, mount } from 'enzyme';
import mutationTracker from 'object-invariant-test-helper';

import {
  withPrescriptions,
  mapStateToProps,
  getFetchers,
} from '../../../../app/pages/prescription/withPrescriptions';

/* global chai */
/* global describe */
/* global it */
/* global expect */
/* global sinon */
/* global beforeEach */

describe('withPrescriptions HOC', function() {
  describe('withPrescriptions', function() {
    let wrapper;
    let Element;

    const fetcher1 = sinon.stub();
    const fetcher2 = sinon.stub();

    let defaultProps = {
      fetchingPrescriptions: { completed: false },
      prescriptions: [{ id: 'one' }, { id: 'two' }],
      prescriptionId: 'one',
      fetchers: [fetcher1, fetcher2],
    };

    let props = overrides => _.assign({}, defaultProps, overrides);

    const Component = props => <div className="supplied-component" {...props} />

    beforeEach(() => {
      fetcher1.resetHistory();
      fetcher2.resetHistory();

      Element = withPrescriptions(Component);
      wrapper = shallow(<Element {...defaultProps} />);
    });

    it('should render the loader if prescriptions have not been fetched', () => {
      expect(wrapper.dive().find('.loader')).to.have.lengthOf(1);
      expect(wrapper.dive().text()).to.equal('Loading...');
    });

    it('should render the supplied component with relevant props if prescriptions have been fetched', () => {
      wrapper.setProps(props({
        fetchingPrescriptions: { completed: true },
      }));

      expect(wrapper.dive().find('.loader')).to.have.lengthOf(0);

      const component = wrapper.dive().find('.supplied-component');
      expect(component).to.have.lengthOf(1);
      expect(component.prop('prescriptionId')).to.equal('one');
      expect(component.prop('prescription')).to.eql({ id: 'one' });
      expect(component.prop('prescriptions')).to.equal(defaultProps.prescriptions);
    });

    it('should invoke all fetchers, but only on the first render', () => {
      wrapper = mount(<Element {...defaultProps} />)
      sinon.assert.callCount(fetcher1, 1);
      sinon.assert.callCount(fetcher2, 1);

      wrapper.setProps(props({
        prescriptionId: 'otherId',
      }));

      sinon.assert.callCount(fetcher1, 1);
      sinon.assert.callCount(fetcher2, 1);
    });
  });

  describe('mapStateToProps', () => {
    const state = {
      working: {
        creatingPrescription: { inProgress: true },
        creatingPrescriptionRevision: { inProgress: false },
        deletingPrescription: { inProgress: false, completed: true },
        fetchingPrescriptions: { inProgress: true, completed: true },
      },
      prescriptions: [{ id: 'one' }, { id: 'two' }],
    };

    const tracked = mutationTracker.trackObj(state);
    const result = mapStateToProps({ blip: state });

    it('should not mutate the state', () => {
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });

    it('should map `working.creatingPrescription` to `creatingPrescription`', () => {
      expect(result.creatingPrescription).to.deep.equal(state.working.creatingPrescription);
    });

    it('should map `working.creatingPrescriptionRevision` to `creatingPrescriptionRevision`', () => {
      expect(result.creatingPrescriptionRevision).to.deep.equal(state.working.creatingPrescriptionRevision);
    });

    it('should map `working.deletingPrescription` to `deletingPrescription`', () => {
      expect(result.deletingPrescription).to.deep.equal(state.working.deletingPrescription);
    });

    it('should map `working.fetchingPrescriptions` to `fetchingPrescriptions`', () => {
      expect(result.fetchingPrescriptions).to.deep.equal(state.working.fetchingPrescriptions);
    });

    it('should pass through `prescriptions`', () => {
      expect(result.prescriptions).to.deep.equal(state.prescriptions);
    });
  });

  describe('getFetchers', () => {
    const stateProps = {
      fetchingPrescriptions: {
        inProgress: false,
        completed: null,
      },
    };

    const dispatchProps = {
      fetchPrescriptions: sinon.stub().returns('fetchPrescriptions'),
    };

    const api = {};

    it('should only add the fetchPrescriptions fetcher if fetch is not already in progress or completed', () => {
      const defaultResult = getFetchers(dispatchProps, stateProps, api);
      expect(defaultResult.length).to.equal(1);
      expect(defaultResult[0]()).to.equal('fetchPrescriptions');

      const inProgressResult = getFetchers(dispatchProps, {
        fetchingPrescriptions: {
          inProgress: true,
          completed: null,
        },
      }, api);

      expect(inProgressResult.length).to.equal(0);

      const completedResult = getFetchers(dispatchProps, {
        fetchingPrescriptions: {
          inProgress: false,
          completed: true,
        },
      }, api);

      expect(completedResult.length).to.equal(0);
    });
  });
});
