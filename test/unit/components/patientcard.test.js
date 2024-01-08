/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global beforeEach */

var React = require('react');
var expect = chai.expect;
import { mount } from 'enzyme';
import { BrowserRouter } from 'react-router-dom';
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
      var elem = mount(<BrowserRouter><PatientCard {...props} /></BrowserRouter>)

      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });

    it('should render upload button if user has upload permissions', function() {
      let props = {
        patient: patientUpload,
        t,
      };
      let wrapper = mount(<BrowserRouter><PatientCard {...props} /></BrowserRouter>);
      expect(wrapper.childAt(0).childAt(0).text()).contains('Upload');
    });

    it('should not render upload button if user does not have upload permissions', function() {
      let props = {
        patient: patientNoUpload,
        t,
      };
      let wrapper = mount(<BrowserRouter><PatientCard {...props} /></BrowserRouter>);
      expect(wrapper.childAt(0).childAt(0).text()).not.contains('Upload');
    });
  });

  describe('remove yourself from a care team for another patient (not logged-in user)', function() {
    var wrapper;

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

      wrapper = mount(<BrowserRouter><PatientCard {...props} /></BrowserRouter>);
    });

    it('should render a patientcard-leave with delete icon and title text', function() {
      var patientCardLeave = wrapper.find('.patientcard-leave');
      var leaveLink = wrapper.find('a.patientcard-actions-remove');
      var deleteIcon = wrapper.find('.icon-delete');
      expect(patientCardLeave).to.have.lengthOf(1);
      expect(deleteIcon).to.have.lengthOf(1);
      expect(leaveLink.props().title).to.equal('Remove yourself from Jane Doe\'s care team.');
    });

    it('should render a confirmation overlay when you click to remove yourself from a care team', function() {
      var leaveLink = wrapper.find('a.patientcard-actions-remove');
      leaveLink.simulate('click');
      var overlay = wrapper.find('.ModalOverlay-content');
      expect(overlay).to.have.lengthOf(1);
    });
  });
});
