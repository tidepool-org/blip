import React from 'react';
import { render, screen } from '@testing-library/react';
import { NoClinicAccessError } from '@app/pages/smartonfhir/NoClinicAccessError';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key
    })
}));

jest.mock('@material-ui/icons/WarningRounded', () => {
    return function MockWarningRoundedIcon() {
        return <div data-testid="warning-icon" />;
    };
});

jest.mock('@app/components/elements/Icon', () => {
    return function MockIcon({ children }) {
        return <div data-testid="icon">{children}</div>;
    };
});

describe('NoClinicAccessError', () => {
    it('should render without errors', () => {
        render(<NoClinicAccessError />);
        expect(screen.getByText('Clinic Access Required')).toBeInTheDocument();
    });

    it('should render the warning box with icon', () => {
        render(<NoClinicAccessError />);

        const warningIcon = screen.getByTestId('icon');
        expect(warningIcon).toBeInTheDocument();

        expect(screen.getByText('Your Tidepool account does not have access to the clinic this PWD account is associated with.')).toBeInTheDocument();
    });

    it('should render the main title', () => {
        render(<NoClinicAccessError />);
        expect(screen.getByText('Clinic Access Required')).toBeInTheDocument();
    });

    it('should render the help text section with contact information', () => {
        render(<NoClinicAccessError />);

        expect(screen.getByText(/Please contact/)).toBeInTheDocument();

        const emailLink = screen.getByRole('link', { name: 'support@tidepool.org' });
        expect(emailLink).toBeInTheDocument();
        expect(emailLink).toHaveAttribute('href', 'mailto:support@tidepool.org');
    });

    it('should render the full help message', () => {
        render(<NoClinicAccessError />);

        expect(screen.getByText(/Our team will check on your account status and permissions to help you get appropriate access\./)).toBeInTheDocument();
    });
});
