import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { renderHook } from '@testing-library/react-hooks/dom';

import useClinicMetricsPageName from '@app/pages/clinicworkspace/useClinicMetricsPageName';

describe('useClinicMetricsPageName', () => {
  const renderPageNameHook = (route) => renderHook(
    () => useClinicMetricsPageName(),
    { wrapper: ({ children }) => <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter> }
  ).result.current;

  it('returns Population Health arg', () => {
    expect(renderPageNameHook('/clinic-workspace')).toBe('Population Health');
  });

  it('returns Population Health arg when backing out from patient data view', () => {
    expect(renderPageNameHook('/clinic-workspace/patients')).toBe('Population Health');
  });

  it('returns TIDE Dashboard arg', () => {
    expect(renderPageNameHook('/clinic-workspace/tide-dashboard')).toBe('TIDE Dashboard');
  });
});
