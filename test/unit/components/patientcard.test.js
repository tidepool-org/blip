/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global beforeEach */

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import i18next from '../../../app/core/language';

const t = i18next.t.bind(i18next);

const expect = chai.expect;
const PatientCard = require('../../../app/components/patientcard');

let patientUpload = {
  permissions: {
    view: {},
    upload: {},
  },
}

let patientNoUpload = {
  permissions: {
    view: {},
  },
}

describe('PatientCard', function () {
  describe('render', function() {
    it('should not console.error when required props set', function() {
      const consoleErrorStub = sinon.stub(console, 'error');
      try {
        const props = {
          trackMetric: function() {},
          href: 'foo',
          patient: {}
        };
        const { container } = render(<BrowserRouter><PatientCard {...props} /></BrowserRouter>);

        expect(container.querySelector('.patientcard')).to.exist;
        expect(consoleErrorStub.callCount).to.equal(0);
      } finally {
        consoleErrorStub.restore();
      }
    });

    it('should render upload button if user has upload permissions', function() {
      const props = {
        patient: patientUpload,
        t,
        href: '/foo',
        trackMetric: () => {},
      };
      const { container } = render(<BrowserRouter><PatientCard {...props} /></BrowserRouter>);
      expect(container.textContent).contains('Upload');
    });

    it('should not render upload button if user does not have upload permissions', function() {
      const props = {
        patient: patientNoUpload,
        t,
        href: '/foo',
        trackMetric: () => {},
      };
      const { container } = render(<BrowserRouter><PatientCard {...props} /></BrowserRouter>);
      expect(container.textContent).not.contains('Upload');
    });
  });

  describe('remove yourself from a care team for another patient (not logged-in user)', function() {
    let rendered;

    beforeEach(function() {
      const props = {
        href: '/foo',
        trackMetric: function() {},
        onRemovePatient: (userid, cb) => cb && cb(),
        onClick: () => {},
        patient: {
          userid: 'patient-1',
          profile: {
            fullName: 'Jane Doe'
          },
          permissions: {
            note: {},
            view: {}
          }
        }
      };

      rendered = render(<BrowserRouter><PatientCard {...props} /></BrowserRouter>);
    });

    it('should render a patientcard-leave with delete icon and title text', function() {
      const patientCardLeave = rendered.container.querySelectorAll('.patientcard-leave');
      const leaveLink = rendered.container.querySelector('a.patientcard-actions-remove');
      const deleteIcon = rendered.container.querySelectorAll('.icon-delete');
      expect(patientCardLeave.length).to.equal(1);
      expect(deleteIcon.length).to.equal(1);
      expect(leaveLink).to.not.be.null;
      expect(leaveLink.getAttribute('title')).to.equal('Remove yourself from Jane Doe\'s care team.');
    });

    it('should render a confirmation overlay when you click to remove yourself from a care team', function() {
      const leaveLink = rendered.container.querySelector('a.patientcard-actions-remove');
      expect(leaveLink).to.not.be.null;
      fireEvent.click(leaveLink);
      const overlay = rendered.container.querySelectorAll('.ModalOverlay-content');
      expect(overlay.length).to.equal(1);
    });
  });
});
