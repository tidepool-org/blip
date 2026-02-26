/* global chai */
/* global describe */
/* global sinon */
/* global it */

import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import i18next from '../../../app/core/language';

const t = i18next.t.bind(i18next);
const expect = chai.expect;

const NavbarPatientCard = require('../../../app/components/navbarpatientcard');

const rootUser = {
  patient: {
    permissions: {
      root: {},
    },
  },
  permsOfLoggedInUser: {
    note: {},
    upload: {},
    view: {},
  },
};

const careTeamMemberUpload = {
  patient: {
    permissions: {},
  },
  permsOfLoggedInUser: {
    note: {},
    upload: {},
    view: {},
  },
};

const careTeamMemberNoUpload = {
  patient: {
    permissions: {},
  },
  permsOfLoggedInUser: {
    note: {},
    view: {},
  },
};

describe('NavbarPatientCard', function () {
  describe('render', function() {
    it('should not console.error when trackMetric set', function() {
      const consoleErrorStub = sinon.stub(console, 'error');
      try {
        const props = {
          href: 'foo',
          patient: {},
          trackMetric: function() {}
        };
        const { container } = render(
          <BrowserRouter>
            <NavbarPatientCard {...props} />
          </BrowserRouter>
        );

        expect(container.querySelector('.patientcard')).to.exist;
        expect(consoleErrorStub.callCount).to.equal(0);
      } finally {
        consoleErrorStub.restore();
      }
    });

    it('should render upload button if user is root', function() {
      const props = {
        href: '/foo',
        permsOfLoggedInUser: rootUser.permsOfLoggedInUser,
        patient: rootUser.patient,
        trackMetric: () => {},
        t,
      };
      const { container } = render(<BrowserRouter><NavbarPatientCard.WrappedComponent {...props} /></BrowserRouter>);
      expect(container.textContent.includes('Upload')).to.equal(true);
    });

    it('should render upload button if user is care team member with upload permissions', function() {
      const props = {
        href: '/foo',
        permsOfLoggedInUser: careTeamMemberUpload.permsOfLoggedInUser,
        patient: careTeamMemberUpload.patient,
        trackMetric: () => {},
        t,
      };
      const { container } = render(<BrowserRouter><NavbarPatientCard.WrappedComponent {...props} /></BrowserRouter>);
      expect(container.textContent.includes('Upload')).to.equal(true);
    });

    it('should not render upload button if user is care team member without upload permissions', function() {
      const props = {
        href: '/foo',
        permsOfLoggedInUser: careTeamMemberNoUpload.permsOfLoggedInUser,
        patient: careTeamMemberNoUpload.patient,
        trackMetric: () => {},
        t,
      };
      const { container } = render(<BrowserRouter><NavbarPatientCard.WrappedComponent {...props} /></BrowserRouter>);
      expect(container.textContent.includes('Upload')).to.equal(false);
    });

    it('should render the patient birthday when available', function() {
      const props = {
        href: '/foo',
        permsOfLoggedInUser: careTeamMemberNoUpload.permsOfLoggedInUser,
        patient: {
          ...careTeamMemberNoUpload.patient,
          profile: {
            patient: {
              birthday: '2010-01-01',
            },
          },
        },
        trackMetric: () => {},
        t,
      };
      const { container } = render(<BrowserRouter><NavbarPatientCard.WrappedComponent {...props} /></BrowserRouter>);
      expect(container.querySelectorAll('.patientcard-dateOfBirth').length).to.equal(1);
      expect(container.textContent.includes('January 1, 2010')).to.equal(true);
    });

    it('should not render the patient birthday when malformed', function() {
      const props = {
        href: '/foo',
        permsOfLoggedInUser: careTeamMemberNoUpload.permsOfLoggedInUser,
        patient: {
          ...careTeamMemberNoUpload.patient,
          profile: {
            patient: {
              birthday: 'badBirthday',
            },
          },
        },
        trackMetric: () => {},
        t,
      };
      const { container } = render(<BrowserRouter><NavbarPatientCard.WrappedComponent {...props} /></BrowserRouter>);
      expect(container.querySelectorAll('.patientcard-dateOfBirth').length).to.equal(0);
    });

    it('should not render the patient birthday when not provided', function() {
      const props = {
        href: '/foo',
        permsOfLoggedInUser: careTeamMemberNoUpload.permsOfLoggedInUser,
        patient: {
          ...careTeamMemberNoUpload.patient,
          profile: {
            patient: {
              birthday: undefined,
            },
          },
        },
        trackMetric: () => {},
        t,
      };
      const { container } = render(<BrowserRouter><NavbarPatientCard.WrappedComponent {...props} /></BrowserRouter>);
      expect(container.querySelectorAll('.patientcard-dateOfBirth').length).to.equal(0);
    });
  });
});
