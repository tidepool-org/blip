import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GriSparkline } from '../../app/components/clinic/GriSparkline';
import { GriCell } from '../../app/components/clinic/GriCell';

const mockHistory = [
  { value: 28, label: '2025-09-01 – 2025-09-14' },
  { value: 32, label: '2025-09-15 – 2025-09-28' },
  { value: 35, label: '2025-09-29 – 2025-10-12' },
  { value: 41, label: '2025-10-13 – 2025-10-26' },
  { value: 45, label: '2025-10-27 – 2025-11-09' },
  { value: 52, label: '2025-11-10 – 2025-11-23' },
];

describe('GriSparkline', () => {
  it('renders with valid history data', () => {
    const { container } = render(
      <GriSparkline currentGri={52} history={mockHistory} />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();

    const path = container.querySelector('path');
    expect(path).toBeInTheDocument();
    expect(path?.getAttribute('d')).toBeTruthy();

    const circle = container.querySelector('circle');
    expect(circle).toBeInTheDocument();
  });

  it('handles null currentGri gracefully', () => {
    const { container } = render(
      <GriSparkline currentGri={null} history={mockHistory} />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();

    // Should show "–" for no data
    const text = container.querySelector('text');
    expect(text?.textContent).toBe('–');
  });

  it('handles empty history gracefully', () => {
    const { container } = render(<GriSparkline currentGri={52} history={[]} />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();

    const text = container.querySelector('text');
    expect(text?.textContent).toBe('–');
  });

  it('handles single data point', () => {
    const singlePointHistory = [{ value: 42 }];

    const { container } = render(
      <GriSparkline currentGri={42} history={singlePointHistory} />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();

    const path = container.querySelector('path');
    expect(path).toBeInTheDocument();
  });

  it('handles all identical values', () => {
    const flatHistory = [
      { value: 40 },
      { value: 40 },
      { value: 40 },
      { value: 40 },
    ];

    const { container } = render(
      <GriSparkline currentGri={40} history={flatHistory} />
    );

    const path = container.querySelector('path');
    expect(path).toBeInTheDocument();

    // Should not crash or produce invalid path data
    const pathData = path?.getAttribute('d');
    expect(pathData).toBeTruthy();
    expect(pathData).not.toContain('NaN');
    expect(pathData).not.toContain('Infinity');
  });

  it('uses correct color for low risk', () => {
    const lowRiskHistory = [
      { value: 20 },
      { value: 22 },
      { value: 25 },
    ];

    const { container } = render(
      <GriSparkline currentGri={25} history={lowRiskHistory} />
    );

    const path = container.querySelector('path');
    expect(path?.getAttribute('stroke')).toBe('#10b981'); // green
  });

  it('uses correct color for moderate risk', () => {
    const moderateRiskHistory = [
      { value: 35 },
      { value: 40 },
      { value: 42 },
    ];

    const { container } = render(
      <GriSparkline currentGri={42} history={moderateRiskHistory} />
    );

    const path = container.querySelector('path');
    expect(path?.getAttribute('stroke')).toBe('#f59e0b'); // amber
  });

  it('uses correct color for high risk', () => {
    const { container } = render(
      <GriSparkline currentGri={52} history={mockHistory} />
    );

    const path = container.querySelector('path');
    expect(path?.getAttribute('stroke')).toBe('#ef4444'); // red
  });

  it('respects custom risk bands', () => {
    const customBands = {
      lowMax: 40,
      moderateMax: 60,
    };

    const { container } = render(
      <GriSparkline
        currentGri={45}
        history={mockHistory}
        riskBands={customBands}
      />
    );

    const path = container.querySelector('path');
    // With custom bands, 45 should be moderate (40-60)
    expect(path?.getAttribute('stroke')).toBe('#f59e0b'); // amber
  });

  it('shows tooltip on hover', () => {
    const { container } = render(
      <GriSparkline currentGri={52} history={mockHistory} />
    );

    // Find the sparkline container (first div)
    const sparkline = container.firstChild;
    expect(sparkline).toBeInTheDocument();

    // Hover over sparkline
    fireEvent.mouseEnter(sparkline);

    // Tooltip should appear - it's a div inside the sparkline
    const tooltipText = container.textContent;
    expect(tooltipText).toContain('Most recent: 52');
    expect(tooltipText).toContain('Trend:');
  });

  it('hides tooltip on mouse leave', () => {
    const { container } = render(
      <GriSparkline currentGri={52} history={mockHistory} />
    );

    const sparkline = container.firstChild;

    fireEvent.mouseEnter(sparkline);
    // Check that tooltip text is present
    expect(container.textContent).toContain('Most recent: 52');

    fireEvent.mouseLeave(sparkline);
    // After mouse leave, tooltip text should be gone
    expect(container.textContent).not.toContain('GRI trend');
  });

  it('shows correct trend label for increasing values', () => {
    const increasingHistory = [
      { value: 20 },
      { value: 25 },
      { value: 30 },
      { value: 35 },
      { value: 40 },
    ];

    const { container } = render(
      <GriSparkline currentGri={40} history={increasingHistory} />
    );

    const sparkline = container.firstChild;
    fireEvent.mouseEnter(sparkline);

    expect(container.textContent).toContain('increasing');
  });

  it('shows correct trend label for decreasing values', () => {
    const decreasingHistory = [
      { value: 50 },
      { value: 45 },
      { value: 40 },
      { value: 35 },
      { value: 30 },
    ];

    const { container } = render(
      <GriSparkline currentGri={30} history={decreasingHistory} />
    );

    const sparkline = container.firstChild;
    fireEvent.mouseEnter(sparkline);

    expect(container.textContent).toContain('decreasing');
  });

  it('shows correct trend label for stable values', () => {
    const stableHistory = [
      { value: 40 },
      { value: 41 },
      { value: 40 },
      { value: 41 },
      { value: 40 },
    ];

    const { container } = render(
      <GriSparkline currentGri={40} history={stableHistory} />
    );

    const sparkline = container.firstChild;
    fireEvent.mouseEnter(sparkline);

    expect(container.textContent).toContain('stable');
  });

  it('shows limited history warning for small datasets', () => {
    const smallHistory = [{ value: 40 }, { value: 42 }];

    const { container } = render(
      <GriSparkline currentGri={42} history={smallHistory} />
    );

    const sparkline = container.firstChild;
    fireEvent.mouseEnter(sparkline);

    expect(container.textContent).toContain('Limited history available');
  });
});

describe('GriCell', () => {
  it('renders with value and sparkline', () => {
    const { container } = render(
      <GriCell currentGri={52} history={mockHistory} />
    );

    expect(screen.getByText('52')).toBeInTheDocument();

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('handles null currentGri', () => {
    render(<GriCell currentGri={null} history={mockHistory} />);

    expect(screen.getByText('–')).toBeInTheDocument();
  });

  it('handles empty history', () => {
    render(<GriCell currentGri={52} history={[]} />);

    expect(screen.getByText('–')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();

    const { container } = render(
      <GriCell currentGri={52} history={mockHistory} onClick={handleClick} />
    );

    const cell = container.firstChild;
    expect(cell).toBeInTheDocument();

    fireEvent.click(cell);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is keyboard accessible when onClick is provided', () => {
    const handleClick = jest.fn();

    const { container } = render(
      <GriCell currentGri={52} history={mockHistory} onClick={handleClick} />
    );

    const cell = container.firstChild;

    // Should have proper ARIA attributes
    expect(cell?.getAttribute('role')).toBe('button');
    expect(cell?.getAttribute('tabIndex')).toBe('0');

    // Enter key
    fireEvent.keyDown(cell, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Space key
    fireEvent.keyDown(cell, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('is not keyboard interactive when onClick is not provided', () => {
    const { container } = render(
      <GriCell currentGri={52} history={mockHistory} />
    );

    const cell = container.firstChild;

    expect(cell?.getAttribute('role')).toBeNull();
    expect(cell?.getAttribute('tabIndex')).toBeNull();
  });

  it('passes custom risk bands to sparkline', () => {
    const customBands = {
      lowMax: 40,
      moderateMax: 60,
    };

    const { container } = render(
      <GriCell
        currentGri={45}
        history={mockHistory}
        riskBands={customBands}
      />
    );

    const path = container.querySelector('path');
    expect(path?.getAttribute('stroke')).toBe('#f59e0b'); // moderate with custom bands
  });

  it('passes custom dimensions to sparkline', () => {
    const { container } = render(
      <GriCell
        currentGri={52}
        history={mockHistory}
        sparklineWidth={120}
        sparklineHeight={24}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('120');
    expect(svg?.getAttribute('height')).toBe('24');
  });
});
