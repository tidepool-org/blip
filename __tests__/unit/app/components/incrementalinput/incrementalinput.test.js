/* global jest */
/* global expect */
/* global describe */
/* global beforeEach */
/* global afterEach */
/* global it */

import React from 'react';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import _ from 'lodash';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import IncrementalInput from '@app/components/incrementalinput/incrementalinput';
import { MGDL_UNITS, MMOLL_UNITS } from '../../../../../app/core/constants';

describe('IncrementalInput', () => {
  const onChange = jest.fn();

  beforeEach(() => {
    onChange.mockClear();
  });

  describe('when mg/dL units', () => {
    const props = {
      name: 'low',
      unit: MGDL_UNITS,
      value: 80,
      minValue: 60,
      maxValue: 200,
      step: 5,
      onChange: onChange,
      error: false,
      additionalAllowedValues: [],
    };

    it('increments/decrements on button click', async () => {
      const { rerender } = render(<IncrementalInput {...props} />);
      expect(onChange).not.toHaveBeenCalled();

      // Clicking Increment should bump the value up to the next step
      await userEvent.click(screen.getByTestId('increment-arrow'));
      expect(onChange).toHaveBeenCalledWith('low', 85, MGDL_UNITS);

      onChange.mockClear();

      // Clicking Decrement should bump the value down to the next step
      await userEvent.click(screen.getByTestId('decrement-arrow'));
      expect(onChange).toHaveBeenCalledWith('low', 75, MGDL_UNITS);

      // -----

      // When at min
      rerender(<IncrementalInput {...props} value={60} />);
      onChange.mockClear();

      // Clicking Increment should bump the value up to the next step
      await userEvent.click(screen.getByTestId('increment-arrow'));
      expect(onChange).toHaveBeenCalledWith('low', 65, MGDL_UNITS);

      onChange.mockClear();

      // Clicking Decrement should not fire the callback since we are at min
      await userEvent.click(screen.getByTestId('decrement-arrow'));
      expect(onChange).not.toHaveBeenCalled();

      // -----

      // When at max
      rerender(<IncrementalInput {...props} value={200} />);
      onChange.mockClear();

      // Clicking Increment should not fire the callback since we are at min
      await userEvent.click(screen.getByTestId('increment-arrow'));
      expect(onChange).not.toHaveBeenCalled();

      onChange.mockClear();

      // Clicking Decrement should not fire the callback since we are at min
      await userEvent.click(screen.getByTestId('decrement-arrow'));
      expect(onChange).toHaveBeenCalledWith('low', 195, MGDL_UNITS);

      // -----

      // When there is an additionalAllowedValue
      rerender(<IncrementalInput {...props} value={65} additionalAllowedValues={[63]} />);
      onChange.mockClear();

      // Clicking Increment should not fire the callback since we are at min
      await userEvent.click(screen.getByTestId('increment-arrow'));
      expect(onChange).toHaveBeenCalledWith('low', 70, MGDL_UNITS);

      onChange.mockClear();

      // Clicking Decrement should not fire the callback since we are at min
      await userEvent.click(screen.getByTestId('decrement-arrow'));
      expect(onChange).toHaveBeenCalledWith('low', 63, MGDL_UNITS);
    });
  });

  describe('when mmol/L units', () => {
    const props = {
      name: 'high',
      unit: MMOLL_UNITS,
      value: 11.1,
      minValue: 3.0,
      maxValue: 14.5,
      step: 0.1,
      onChange: onChange,
      error: false,
      additionalAllowedValues: [],
    };

    it('increments/decrements on button click', async () => {
      const { rerender } = render(<IncrementalInput {...props} />);
      expect(onChange).not.toHaveBeenCalled();

      // Clicking Increment should bump the value up to the next step
      await userEvent.click(screen.getByTestId('increment-arrow'));
      expect(onChange).toHaveBeenCalledWith('high', 11.2, MMOLL_UNITS);

      onChange.mockClear();

      // Clicking Decrement should bump the value down to the next step
      await userEvent.click(screen.getByTestId('decrement-arrow'));
      expect(onChange).toHaveBeenCalledWith('high', 11.0, MMOLL_UNITS);

      // -----

      // When at min
      rerender(<IncrementalInput {...props} value={3.0} />);
      onChange.mockClear();

      // Clicking Increment should bump the value up to the next step
      await userEvent.click(screen.getByTestId('increment-arrow'));
      expect(onChange).toHaveBeenCalledWith('high', 3.1, MMOLL_UNITS);

      onChange.mockClear();

      // Clicking Decrement should not fire the callback since we are at min
      await userEvent.click(screen.getByTestId('decrement-arrow'));
      expect(onChange).not.toHaveBeenCalled();

      // -----

      // When at max
      rerender(<IncrementalInput {...props} value={14.5} />);
      onChange.mockClear();

      // Clicking Increment should not fire the callback since we are at min
      await userEvent.click(screen.getByTestId('increment-arrow'));
      expect(onChange).not.toHaveBeenCalled();

      onChange.mockClear();

      // Clicking Decrement should not fire the callback since we are at min
      await userEvent.click(screen.getByTestId('decrement-arrow'));
      expect(onChange).toHaveBeenCalledWith('high', 14.4, MMOLL_UNITS);
    });
  });
});
