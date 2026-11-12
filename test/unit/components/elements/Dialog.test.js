import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import { DialogTitle } from '../../../../app/components/elements/Dialog';

// Only DialogTitle carries real behavior worth isolating — conditional rendering
// (closeIcon / onBack) and event wiring. Dialog, DialogContent, and DialogActions
// are thin styled wrappers with no logic; they are covered by the consumer suites
// that render real dialogs.
describe('elements/Dialog — DialogTitle', () => {
  it('renders the title and a close button that calls onClose', () => {
    const onClose = jest.fn();
    render(<DialogTitle onClose={onClose}>My title</DialogTitle>);

    expect(screen.getByText('My title')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('close dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('hides the close button when closeIcon is false', () => {
    render(<DialogTitle closeIcon={false}>My title</DialogTitle>);

    expect(screen.queryByLabelText('close dialog')).not.toBeInTheDocument();
  });

  it('renders a Back button that calls onBack', () => {
    const onBack = jest.fn();
    render(<DialogTitle onBack={onBack}>My title</DialogTitle>);

    fireEvent.click(screen.getByLabelText('dialog back button'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
