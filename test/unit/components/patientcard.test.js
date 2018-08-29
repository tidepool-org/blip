/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global beforeEach */

var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');
var expect = chai.expect;
import {shallow} from 'enzyme';
import i18next from '../../../app/core/language';

const t = i18next.t.bind(i18next);

var PatientCard = require('../../../app/components/patientcard');

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
      console.error = sinon.stub();
      var props = {
        trackMetric: function() {},
        href: 'foo',
        patient: {}
      };
      var patientCardElem = React.createElement(PatientCard, props);
      var elem = TestUtils.renderIntoDocument(patientCardElem);

      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });

    it('should render upload button if user has upload permissions', function() {
      let props = {
        patient: patientUpload,
        t,
      };
      let wrapper = shallow(<PatientCard.WrappedComponent {...props} />);
      expect(wrapper.contains('Upload')).to.equal(true);
    });

    it('should not render upload button if user does not have upload permissions', function() {
      let props = {
        patient: patientNoUpload,
        t,
      };
      let wrapper = shallow(<PatientCard.WrappedComponent {...props} />);
      expect(wrapper.contains('Upload')).to.equal(false);
    });
  });

  describe('remove yourself from a care team for another patient (not logged-in user)', function() {
    var renderedDOMElem;

    beforeEach(function() {
      var props = {
        trackMetric: function() {},
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
