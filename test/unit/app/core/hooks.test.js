/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global beforeEach */

import { useState } from 'react'
import { usePrevious } from '../../../../app/core/hooks';
import { renderHook, act } from '@testing-library/react-hooks'

const expect = chai.expect;

describe('hooks', function() {
  it('should store the previous state', () => {
    function fooHook() {
      const [foo, setFoo] = useState('foo');
      return { foo, setFoo };
    }

    const { result: fooResult } = renderHook(() => fooHook());
    expect(fooResult.current.foo).to.equal('foo');

    const { result: usePreviousResult, rerender } = renderHook(() => usePrevious(fooResult.current.foo));
    expect(usePreviousResult.current).to.be.undefined;

    act(() => fooResult.current.setFoo('bar'));
    rerender();

    expect(usePreviousResult.current).to.equal('foo');
    expect(fooResult.current.foo).to.equal('bar');
  });
});
