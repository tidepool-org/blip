/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global expect */

var expect = chai.expect;

import { pendoData } from '../../../../app/redux/reducers/misc';
import * as actions from '../../../../app/redux/actions/index';

describe('pendoData reducer', () => {
  const initialState = {
    pendoData: {
      account: {},
      visitor: {},
    },
  };

  it('should return the initial state if the action type is not SET_PENDO_DATA', () => {
    const reducer = sinon.spy(pendoData);

    reducer(initialState, {
      account: { id: 'foo' },
      visitor: { id: 'bar' },
    });

    expect(
      reducer.calledWith(initialState, {
        account: { id: 'foo' },
        visitor: { id: 'bar' },
      })
    ).to.be.true;
    expect(reducer.returnValues[0]).to.equal(initialState);
  });

  it('should return the value from the action payload if the action type is SET_PENDO_DATA', () => {
    const reducer = sinon.spy(pendoData);

    const setPendoDataAction = {
      type: 'SET_PENDO_DATA',
      payload: {
        data: {
          account: { id: 'foo' },
          visitor: { id: 'bar' },
        },
      },
    };

    reducer(initialState, setPendoDataAction);

    expect(reducer.calledWith(initialState, setPendoDataAction)).to
      .be.true;
    expect(reducer.returnValues[0].account).to.eql({ id: 'foo' });
    expect(reducer.returnValues[0].visitor).to.eql({ id: 'bar' });
  });

  describe('logoutRequest', () => {
    it('should set state to initial empty state', () => {
      const data = {
        account: { id: 'foo' },
        visitor: { id: 'bar' },
      };

      let initialStateForTest = data;
      let action = actions.sync.logoutRequest();
      let state = pendoData(initialStateForTest, action);

      expect(state).to.eql({
        account: {},
        visitor: {},
      });
    });
  });
});
