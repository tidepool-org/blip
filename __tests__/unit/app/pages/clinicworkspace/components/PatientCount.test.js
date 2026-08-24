import React from 'react';
import { render, screen } from '@testing-library/react';
import '@app/core/language';

import PatientCount from '@app/pages/clinicworkspace/components/PatientCount';

describe('PatientCount', () => {
  it('renders correct range of patients on a middle page', () => {
    render(<PatientCount total={307} offset={252} limit={12} />);

    expect(screen.getByText('Showing patients 253 - 264 of 307')).toBeInTheDocument();
  });

  it('renders correct range of patients on a last page', () => {
    render(<PatientCount total={107} offset={96} limit={12} />);

    expect(screen.getByText('Showing patients 97 - 107 of 107')).toBeInTheDocument();
  });
});
