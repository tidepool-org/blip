import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import i18next from '../../../app/core/language';
import PatientCard from '../../../app/components/patientcard';

const t = i18next.t.bind(i18next);

let patientUpload = {
  permissions: {
    view: {},
    upload: {},
  },
};

let patientNoUpload = {
  permissions: {
    view: {},
  },
};

describe('PatientCard', function () {
  describe('render', function() {
    it('should not console.error when required props set', function() {
      sinon.spy(console, 'error');
      var props = {
        trackMetric: sinon.stub(),
        href: 'foo',
        patient: {},
        t,
      };
      const wrapper = shallow(<PatientCard {...props} />);
      expect(wrapper.exists('.patientcard-icon')).to.be.true;
      expect(console.error.callCount).to.equal(0);
      console.error.restore();
    });

    it('should render upload button if user has upload permissions', function() {
      let props = {
        patient: patientUpload,
        t,
      };
      let wrapper = shallow(<PatientCard {...props} />);
      expect(wrapper.contains('Upload')).to.equal(true);
    });

    it('should not render upload button if user does not have upload permissions', function() {
      let props = {
        patient: patientNoUpload,
        t,
      };
      let wrapper = shallow(<PatientCard {...props} />);
      expect(wrapper.contains('Upload')).to.equal(false);
    });
  });

  describe('remove yourself from a care team for another patient (not logged-in user)', function() {
    var renderedDOMElem;

    beforeEach(function() {
      var props = {
        trackMetric: sinon.stub(),
        patient: {
          profile: {
            fullName: 'Jane Doe'
          },
          permissions: {
            note: {},
            view: {}
          }
        }
      };
      var patientCardElem = React.createElement(PatientCard, props);
      var elem = TestUtils.renderIntoDocument(patientCardElem);
      renderedDOMElem = ReactDOM.findDOMNode(elem);
    });

    it('should render a patientcard-leave with delete icon and title text', function() {
      var patientCardLeave = renderedDOMElem.querySelectorAll('.patientcard-leave');
      var leaveLink = renderedDOMElem.querySelector('a.patientcard-actions-remove');
      var deleteIcon = renderedDOMElem.querySelectorAll('.icon-delete');
      expect(patientCardLeave.length).to.equal(1);
      expect(deleteIcon.length).to.equal(1);
      expect(leaveLink.title).to.equal('Remove yourself from Jane Doe\'s care team.');
    });

    it('should render a confirmation overlay when you click to remove yourself from a care team', function() {
      var leaveLink = renderedDOMElem.querySelector('a.patientcard-actions-remove');
      TestUtils.Simulate.click(leaveLink);
      var overlay = renderedDOMElem.querySelectorAll('.ModalOverlay-content');
      expect(overlay.length).to.equal(1);
    });
  });
});
