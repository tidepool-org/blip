import React, { useState } from 'react'

import {
  default as hooksModule,
  usePrevious,
  useFieldArray,
  useInitialFocusedInput,
  useLaunchDarklyFlagOverrides,
} from '../../../../app/core/hooks';

import { renderHook } from '@testing-library/react-hooks/dom';
import { Formik } from 'formik';
import _ from 'lodash';
import { mount } from 'enzyme';

/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global beforeEach */
/* global afterEach */

const expect = chai.expect;

describe('hooks', function() {
  describe('useFieldArray', () => {
    let result;
    let rerender;

    const initialFoo = [
      { name: 'field1', value: '1' },
      { name: 'field2', value: '2' },
      { name: 'field3', value: '3' },
    ];

    let setFieldValue;

    beforeEach(() => {
      function FooHook() {
        const [foo, setFoo] = useState(initialFoo);
        return { foo, setFoo };
      }

      // eslint-disable-next-line new-cap
      const { result: fooResult } = renderHook(() => FooHook());
      expect(fooResult.current.foo).to.equal(initialFoo);

      setFieldValue = sinon.stub().callsFake((name, value) => {
        fooResult.current.setFoo(value);
        return fooResult.current[name];
      });

      const renderedHook = renderHook(() => useFieldArray({
        name: 'foo',
          type: 'checkbox',
          multiple: 'true',
          value: fooResult.current.foo,
        }, {
          setFieldValue,
        }), {
          wrapper: props => <Formik {...props}/>,
          initialProps: {
            initialValues: fooResult.current,
          },
        }
      );

      result = renderedHook.result;
      rerender = renderedHook.rerender;
    });

    afterEach(() => {
      setFieldValue.resetHistory();
    });

    it('should return a reference to the field, it\'s meta, and the array helpers', () => {
      expect(result.current).to.be.an('array').and.have.lengthOf(3);

      // Field
      expect(result.current[0]).to.be.an('object').and.to.include.all.keys([
        'name',
        'value',
        'onChange',
        'onBlur',
      ]);
      expect(result.current[0]).to.be.an('object').and.to.include({ name: 'foo' });

      // Meta
      expect(result.current[1]).to.be.an('object').and.to.include.all.keys([
        'value',
        'error',
        'touched',
        'initialValue',
        'initialTouched',
        'initialError',
      ]);

      // Helpers
      expect(result.current[2]).to.be.an('object').and.to.include.all.keys([
        'push',
        'swap',
        'move',
        'insert',
        'unshift',
        'remove',
        'pop',
        'replace',
      ]);

      _.each(result.current[2], (value) => {
        expect(value).to.be.a('function');
      });
    });

    it('should allow pushing a field', () => {
      result.current[2].push({ name: 'field4', value: '4' });
      rerender();
      expect(result.current[0].value).to.eql([
        ...initialFoo,
        { name: 'field4', value: '4' },
      ]);
    });

    it('should allow swapping a field', () => {
      result.current[2].swap(1, 0);
      rerender();
      expect(result.current[0].value).to.eql([
        initialFoo[1],
        initialFoo[0],
        initialFoo[2],
      ]);
    });

    it('should allow moving a field', () => {
      result.current[2].move(1, 2);
      rerender();
      expect(result.current[0].value).to.eql([
        initialFoo[0],
        initialFoo[2],
        initialFoo[1],
      ]);
    });

    it('should allow inserting a field', () => {
      result.current[2].insert(2, { name: 'field4', value: '4' });
      rerender();
      expect(result.current[0].value).to.eql([
        initialFoo[0],
        initialFoo[1],
        { name: 'field4', value: '4' },
        initialFoo[2],
      ]);
    });

    it('should allow unshifting a field', () => {
      result.current[2].unshift({ name: 'field4', value: '4' });
      rerender();
      expect(result.current[0].value).to.eql([
        { name: 'field4', value: '4' },
        initialFoo[0],
        initialFoo[1],
        initialFoo[2],
      ]);
    });

    it('should allow removing a field and return the removed item', () => {
      const removedItem = result.current[2].remove(1);
      rerender();
      expect(result.current[0].value).to.eql([
        initialFoo[0],
        initialFoo[2],
      ]);
      expect(removedItem).to.eql(initialFoo[1]);
    });

    it('should allow popping a field and return the popped item', () => {
      const poppedItem = result.current[2].pop();
      rerender();
      expect(result.current[0].value).to.eql([
        initialFoo[0],
        initialFoo[1],
      ]);
      expect(poppedItem).to.eql(initialFoo[2]);
    });

    it('should allow replacing a field', () => {
      result.current[2].replace(1, { name: 'field4', value: '4' });
      rerender();
      expect(result.current[0].value).to.eql([
        initialFoo[0],
        { name: 'field4', value: '4' },
        initialFoo[2],
      ]);
    });
  });

  describe('usePrevious', () => {
    it('should store the previous state', () => {
      function FooHook() {
        const [foo, setFoo] = useState('foo');
        return { foo, setFoo };
      }

      // eslint-disable-next-line new-cap
      const { result: fooResult } = renderHook(() => FooHook());
      expect(fooResult.current.foo).to.equal('foo');

      const { result: usePreviousResult, rerender } = renderHook(() => usePrevious(fooResult.current.foo));
      expect(usePreviousResult.current).to.be.undefined;

      fooResult.current.setFoo('bar');
      rerender();

      expect(usePreviousResult.current).to.equal('foo');
      expect(fooResult.current.foo).to.equal('bar');
    });
  });

  describe('useInitialFocusedInput', () => {
    let wrapper;

    afterEach(() => {
      // We make sure to unmount, since the element is being attached to the document body
      // to test focus and we don't want it to stick around and pollute other tests.
      wrapper && wrapper.unmount();
    });

    it('should focus an element when ref is assigned to element', () => {
      const { result: { current: ref }, rerender } = renderHook(() => useInitialFocusedInput());
      expect(ref.current).to.be.undefined;

      wrapper = mount(<button ref={ref}>Click Me</button>, { attachTo: document.body });
      const button = wrapper.find('button').getDOMNode();

      const focusedElement = () => document.activeElement;

      expect(focusedElement()).to.not.equal(button);
      rerender();

      expect(focusedElement()).to.equal(button);
    });
  });

  describe('useLaunchDarklyFlagOverrides', () => {
    let useLocalStorageStub;
    let useFlagsStub;

    beforeEach(() => {
      useLocalStorageStub = sinon.stub().returns([{}]);
      hooksModule.__Rewire__('useLocalStorage', useLocalStorageStub);

      // Mock the LaunchDarkly useFlags hook
      useFlagsStub = sinon.stub();
      hooksModule.__Rewire__('useFlags', useFlagsStub);
    });

    afterEach(() => {
      hooksModule.__ResetDependency__('useLocalStorage');
      hooksModule.__ResetDependency__('useFlags');
    });

    it('should return LaunchDarkly flags when no local storage overrides exist', () => {
      const launchDarklyFlags = {
        featureA: true,
        featureB: false,
        featureC: 'enabled',
      };

      useFlagsStub.returns(launchDarklyFlags);
      useLocalStorageStub.returns([{}]);

      const { result } = renderHook(() => useLaunchDarklyFlagOverrides());

      expect(result.current).to.deep.equal(launchDarklyFlags);
      expect(useLocalStorageStub.calledWith('launchDarklyOverrides', {})).to.be.true;
    });

    it('should merge LaunchDarkly flags with local storage overrides', () => {
      const launchDarklyFlags = {
        featureA: true,
        featureB: false,
        featureC: 'enabled',
      };

      const localOverrides = {
        featureB: true,
        featureD: 'override',
      };

      useFlagsStub.returns(launchDarklyFlags);
      useLocalStorageStub.returns([localOverrides]);

      const { result } = renderHook(() => useLaunchDarklyFlagOverrides());

      expect(result.current).to.deep.equal({
        featureA: true,
        featureB: true, // Overridden from false to true
        featureC: 'enabled',
        featureD: 'override', // New flag from local storage
      });
    });

    it('should prioritize local storage overrides over LaunchDarkly flags', () => {
      const launchDarklyFlags = {
        featureA: true,
        featureB: false,
      };

      const localOverrides = {
        featureA: false, // Override LaunchDarkly value
        featureB: true,  // Override LaunchDarkly value
      };

      useFlagsStub.returns(launchDarklyFlags);
      useLocalStorageStub.returns([localOverrides]);

      const { result } = renderHook(() => useLaunchDarklyFlagOverrides());

      expect(result.current).to.deep.equal({
        featureA: false,
        featureB: true,
      });
    });
  });
});
