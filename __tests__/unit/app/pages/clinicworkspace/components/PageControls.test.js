import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PageControls from '@app/pages/clinicworkspace/components/PageControls';

describe('PageControls', () => {
  const onOffsetChange = jest.fn();

  // 115 patients at 10 per page -> 12 pages, with a partial last page
  const ui = ({ total = 115, limit = 10, offset = 0 } = {}) => (
    <PageControls
      total={total}
      limit={limit}
      offset={offset}
      onOffsetChange={onOffsetChange}
    />
  );

  const renderComponent = (props = {}) => render(ui(props));

  beforeEach(() => {
    onOffsetChange.mockClear();
  });

  it('on the first page, renders the leading page range and pages forward', async () => {
    const { rerender } = renderComponent({ offset: 0 });

    // Page 1 is the current page
    expect(screen.getByRole('button', { name: '1' })).toHaveAttribute('aria-current', 'true');

    // Pages 1-7 and the last page render; the collapsed range does not
    ['1', '2', '3', '4', '5', '6', '7', '12'].forEach(page => {
      expect(screen.getByRole('button', { name: page })).toBeInTheDocument();
    });
    ['8', '9', '10', '11'].forEach(page => {
      expect(screen.queryByRole('button', { name: page })).not.toBeInTheDocument();
    });

    // Cannot page backwards from the first page
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled();

    // Paging forward reports the offset of page 2
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(onOffsetChange).toHaveBeenCalledWith(10);

    // Clicking a page number reports that page's offset
    await userEvent.click(screen.getByRole('button', { name: '3' }));
    expect(onOffsetChange).toHaveBeenCalledWith(20);

    // Once the parent applies the new offset, the clicked page becomes current
    rerender(ui({ offset: 20 }));
    expect(screen.getByRole('button', { name: '3' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('button', { name: '1' })).not.toHaveAttribute('aria-current');
  });

  it('on a middle page, renders the current page with its siblings and pages in both directions', async () => {
    // Offset 50 at 10 per page -> page 6
    renderComponent({ offset: 50 });

    expect(screen.getByRole('button', { name: '6' })).toHaveAttribute('aria-current', 'true');

    // The first page, two siblings on each side, and the last page render; both collapsed ranges do not
    ['1', '4', '5', '6', '7', '8', '12'].forEach(page => {
      expect(screen.getByRole('button', { name: page })).toBeInTheDocument();
    });
    ['2', '3', '9', '10', '11'].forEach(page => {
      expect(screen.queryByRole('button', { name: page })).not.toBeInTheDocument();
    });

    // Both directions are available from a middle page
    expect(screen.getByRole('button', { name: /previous/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled();

    // Paging backward reports the offset of page 5
    await userEvent.click(screen.getByRole('button', { name: /previous/i }));
    expect(onOffsetChange).toHaveBeenCalledWith(40);

    // Paging forward reports the offset of page 7
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(onOffsetChange).toHaveBeenCalledWith(60);

    // Jumping to the last page reports its offset
    await userEvent.click(screen.getByRole('button', { name: '12' }));
    expect(onOffsetChange).toHaveBeenCalledWith(110);
  });

  it('on the last page, renders the trailing page range and pages backward', async () => {
    // Offset 110 at 10 per page -> page 12, the last page
    renderComponent({ offset: 110 });

    expect(screen.getByRole('button', { name: '12' })).toHaveAttribute('aria-current', 'true');

    // The first page and the trailing range render; the collapsed range does not
    ['1', '6', '7', '8', '9', '10', '11', '12'].forEach(page => {
      expect(screen.getByRole('button', { name: page })).toBeInTheDocument();
    });
    ['2', '3', '4', '5'].forEach(page => {
      expect(screen.queryByRole('button', { name: page })).not.toBeInTheDocument();
    });

    // Cannot page forward from the last page
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /previous/i })).toBeEnabled();

    // Paging backward reports the offset of page 11
    await userEvent.click(screen.getByRole('button', { name: /previous/i }));
    expect(onOffsetChange).toHaveBeenCalledWith(100);

    // Jumping back to the first page reports an offset of 0
    await userEvent.click(screen.getByRole('button', { name: '1' }));
    expect(onOffsetChange).toHaveBeenCalledWith(0);
  });

  it('disables pagination entirely when the results fit on a single page', () => {
    renderComponent({ total: 8, limit: 10, offset: 0 });

    expect(screen.getByRole('button', { name: '1' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });
});
