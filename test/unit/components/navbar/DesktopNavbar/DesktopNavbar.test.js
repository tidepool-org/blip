/* global after, before, chai, describe, it, sinon, beforeEach, context */

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import '../../../../../app/core/language';
import DesktopNavbar from '../../../../../app/components/navbar/DesktopNavbar/DesktopNavbar';

jest.mock('../../../../../app/components/navbar/DesktopNavbar/NavigationMenu', () => () => <div />);
jest.mock('../../../../../app/components/clinic/WorkspaceSwitcher', () => () => <div />);

const expect = chai.expect;

describe('DesktopNavbar', ()  => {
  let consoleErrorSpy;

  const props = {
    trackMetric: sinon.spy(),
    t: sinon.stub().callsFake((string) => string),
  };

  before(() => {
    consoleErrorSpy = sinon.spy(console, 'error');
  });

  after(() => {
    consoleErrorSpy.restore();
  });

  it('should be exposed as a module and be of type function', function() {
    expect(DesktopNavbar).to.be.a('function');
  });

  describe('render', () => {
    it('should render without problems when required props present', () => {
      expect(consoleErrorSpy.callCount).to.equal(0);
    });

    it('should render a patient list link when viewing the TIDE dashboard view as a clinic clinician', () => {
      const clinicClinicianProps = {
        ...props,
        clinicFlowActive: true,
        clinics: {
          clinic123: {
            clinicians: {
              user123: {
                id: 'user123',
              },
            },
          },
        },
        user: {
          isClinicMember: true,
          userid: 'user123',
          roles: ['clinic'],
        },
        selectedClinicId: 'clinic123',
      };

      const { container: clinicContainer } = render(
        <MemoryRouter>
          <DesktopNavbar {...clinicClinicianProps} currentPage="/dashboard/tide" />
        </MemoryRouter>
      );

      expect(clinicContainer.querySelector('a[href="/clinic-workspace/patients"]')).to.not.equal(null);
    });
  });

  describe('interactions', () => {
    it('should fire trackMetric when the logo is clicked', () => {
      const { container } = render(
        <MemoryRouter>
          <DesktopNavbar {...props} />
        </MemoryRouter>
      );

      const logo = container.querySelector('.Navbar-logo');
      expect(logo).to.not.be.null;
      expect(props.trackMetric.callCount).to.equal(0);
      fireEvent.click(logo);
      expect(props.trackMetric.callCount).to.equal(1);
      expect(props.trackMetric.firstCall.args[0]).to.equal('Clicked Navbar Logo');
    });
  });
});
