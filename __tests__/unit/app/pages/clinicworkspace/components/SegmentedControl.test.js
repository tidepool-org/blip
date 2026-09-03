import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SegmentedControl, Segment } from '@app/pages/clinicworkspace/components/SegmentedControl';

const segments = [{ label: 'First', id: 1 }, { label: 'Second', id: 2 }, { label: 'Third', id: 3 }];

describe('SegmentedControl', () => {
  const onSelect = jest.fn();

  const ui = ({ selectedId = 1 } = {}) => (
    <SegmentedControl>
      {segments.map(seg => (
        <Segment key={seg.id} selected={seg.id === selectedId} onClick={() => onSelect(seg.id)}>
          {seg.label}
        </Segment>
      ))}
    </SegmentedControl>
  );

  const renderComponent = (props = {}) => render(ui(props));

  beforeEach(() => {
    onSelect.mockClear();
  });

  it('Fires the onClick handler with correct args', async () => {
    renderComponent({ selectedId: 1 });

    expect(screen.getByRole('radio', { name: /First/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Second/ })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: /Third/ })).not.toBeChecked();

    await userEvent.click(screen.getByRole('radio', { name: /Third/ }));

    expect(onSelect).toHaveBeenCalledWith(3);
  });

  it('makes every segment keyboard focusable in the order rendered', async () => {
    renderComponent();

    await userEvent.tab();
    expect(screen.getByRole('radio', { name: /First/ })).toHaveFocus();

    await userEvent.tab();
    expect(screen.getByRole('radio', { name: /Second/ })).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith(2);
  });
});
