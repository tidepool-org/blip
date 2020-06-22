import React, { useState } from 'react'
import { usePrevious, useFieldArray } from '../../../../app/core/hooks';
import { renderHook } from '@testing-library/react-hooks';
import { Formik } from 'formik';
import _ from 'lodash';

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
      function fooHook() {
        const [foo, setFoo] = useState(initialFoo);
        return { foo, setFoo };
      }

      const { result: fooResult } = renderHook(() => fooHook());
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
      expect(result.current[1]).to.be.an('object').and.to.to.include.all.keys([
        'value',
        'error',
        'touched',
        'initialValue',
        'initialTouched',
        'initialError',
      ]);

      // Helpers
      expect(result.current[2]).to.be.an('object').and.to.to.include.all.keys([
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
      function fooHook() {
        const [foo, setFoo] = useState('foo');
        return { foo, setFoo };
      }

      const { result: fooResult } = renderHook(() => fooHook());
      expect(fooResult.current.foo).to.equal('foo');

      const { result: usePreviousResult, rerender } = renderHook(() => usePrevious(fooResult.current.foo));
      expect(usePreviousResult.current).to.be.undefined;

      fooResult.current.setFoo('bar');
      rerender();

      expect(usePreviousResult.current).to.equal('foo');
      expect(fooResult.current.foo).to.equal('bar');
    });
  });
});
