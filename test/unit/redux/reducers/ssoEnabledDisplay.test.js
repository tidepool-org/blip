/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global expect */

var expect = chai.expect;

import { ssoEnabledDisplay } from '../../../../app/redux/reducers/misc';

describe('ssoEnabledDisplay reducer', () => {
  const initialState = {
    ssoEnabledDisplay: false,
  };

  it('should return the initial state if the action type is not SET_SSO_ENABLED_DISPLAY', () => {
    const reducer = sinon.spy(ssoEnabledDisplay);

    reducer(initialState, {
      type: 'other',
    });

    expect(
      reducer.calledWith(initialState, {
        type: 'other',
      })
    ).to.be.true;
    expect(reducer.returnValues[0]).to.equal(initialState);
  });

  it('should return the value from the action payload if the action type is SET_SSO_ENABLED_DISPLAY', () => {
    const reducer = sinon.spy(ssoEnabledDisplay);

    const setSsoEnableDisplayAction = {
      type: 'SET_SSO_ENABLED_DISPLAY',
      payload: {
        value: true,
      },
    };

    reducer(initialState, setSsoEnableDisplayAction);

    expect(reducer.calledWith(initialState, setSsoEnableDisplayAction)).to
      .be.true;
    expect(reducer.returnValues[0]).to.be.true;
  });
});
