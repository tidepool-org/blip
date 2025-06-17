/* global chai */
/* global describe */
/* global sinon */
/* global afterEach */
/* global context */
/* global it */
/* global before */
/* global beforeEach */
/* global after */

import React from 'react';
import { mount } from 'enzyme';
import { BrowserRouter } from 'react-router-dom';
import _ from 'lodash';

import NavPatientHeader from '../../../../app/components/navpatientheader';

const expect = chai.expect;

// Demographic info stored in 'patient' and 'clinicPatient' props can be different.
// Patient-inputted name and birthdate are saved in 'patient' and clinician-entered
// name, birthdate, and mrn are saved in 'clinicPatient'.
const patientProps = {
  userid: '1234',
  profile: {
    fullName: 'Vasyl Lomachenko',
    patient: { birthday: '2010-10-20', mrn: '567890' },
  },
};

const clinicPatientProps = {
  id: '1234',
  birthDate: '1965-01-01',
  fullName: 'Naoya Inoue',
  mrn: '999999',
};

describe('NavPatientHeader', () => {
  const api = sinon.stub();
  const trackMetric = sinon.stub();

  const handleBack = sinon.stub();
  const handleLaunchUploader = sinon.stub();
  const handleViewData = sinon.stub();
  const handleViewProfile = sinon.stub();
  const handleShare = sinon.stub();

  NavPatientHeader.__Rewire__('useNavigation', sinon.stub().returns({
    handleBack,
    handleLaunchUploader,
    handleViewData,
    handleViewProfile,
    handleShare,
  }));

  after(() => {
    NavPatientHeader.__ResetDependency__('useNavigation');
  });

  afterEach(() => {
    handleBack.reset();
    handleLaunchUploader.reset();
    handleViewData.reset();
    handleViewProfile.reset();
    handleShare.reset();
  });

  describe('visibility of patient info and actions', () => {
    context('personal user with non-root permissions', () => {
      const props = {
        user: { roles: [] },
        trackMetric,
        api,
        patient: { ...patientProps, permissions: { } },
        clinicPatient: undefined,
      };

      const wrapper = mount(
        <BrowserRouter>
          <NavPatientHeader {...props} />
        </BrowserRouter>
      );

      it('shows the correct info and actions', () => {
        // should show demographic info from the 'patient' object
        expect(wrapper.text()).to.include('Vasyl Lomachenko');
        expect(wrapper.text()).not.to.include('567890');
        expect(wrapper.text()).not.to.include('2010-10-20');

        // should NOT show demographic info from the 'clinicPatient' object
        expect(wrapper.text()).not.to.include('Naoya Inoue');
        expect(wrapper.text()).not.to.include('999999');
        expect(wrapper.text()).not.to.include('1965-01-01');

        expect(wrapper.find('button#navPatientHeader_backButton').exists()).to.be.false;
        expect(wrapper.find('button#navPatientHeader_viewDataButton').exists()).to.be.true;
        expect(wrapper.find('button#navPatientHeader_profileButton').exists()).to.be.true;

        expect(wrapper.find('button#navPatientHeader_shareButton').exists()).to.be.false;
        expect(wrapper.find('button#navPatientHeader_uploadButton').exists()).to.be.false;
      });
    });

    context('personal user with root permissions', () => {
      const props = {
        user: { roles: [] },
        trackMetric,
        api,
        patient: { ...patientProps, permissions: { root: {} } },
        clinicPatient: undefined,
      };

      const wrapper = mount(
        <BrowserRouter>
          <NavPatientHeader {...props} />
        </BrowserRouter>
      );

      it('shows the correct info and actions', () => {
        // should show demographic info from the 'patient' object
        expect(wrapper.text()).to.include('Vasyl Lomachenko');
        expect(wrapper.text()).not.to.include('Naoya Inoue');
        expect(wrapper.text()).not.to.include('567890');

        // should NOT show demographic info from the 'clinicPatient' object
        expect(wrapper.text()).not.to.include('2010-10-20');
        expect(wrapper.text()).not.to.include('999999');
        expect(wrapper.text()).not.to.include('1965-01-01');

        expect(wrapper.find('button#navPatientHeader_backButton').exists()).to.be.false;
        expect(wrapper.find('button#navPatientHeader_viewDataButton').exists()).to.be.true;
        expect(wrapper.find('button#navPatientHeader_profileButton').exists()).to.be.true;
        expect(wrapper.find('button#navPatientHeader_shareButton').exists()).to.be.true;
        expect(wrapper.find('button#navPatientHeader_uploadButton').exists()).to.be.true;
      });
    });

    context('clinician user without upload permissions', () => {
      const props = {
        user: { roles: ['clinician'] },
        trackMetric,
        api,
        patient: { ...patientProps, permissions: { } },
        clinicPatient: { ...clinicPatientProps },
        permsOfLoggedInUser: {},
      };

      const wrapper = mount(
        <BrowserRouter>
          <NavPatientHeader {...props} />
        </BrowserRouter>
      );

      it('shows the correct info and actions', () => {
        // should show demographic info from the 'clinicPatient' object
        expect(wrapper.text()).to.include('Naoya Inoue');
        expect(wrapper.text()).to.include('999999');
        expect(wrapper.text()).to.include('1965-01-01');

        // should NOT show demographic info from the 'patient' object
        expect(wrapper.text()).not.to.include('Vasyl Lomachenko');
        expect(wrapper.text()).not.to.include('567890');
        expect(wrapper.text()).not.to.include('2010-10-20');

        expect(wrapper.find('button#navPatientHeader_backButton').exists()).to.be.true;
        expect(wrapper.find('button#navPatientHeader_viewDataButton').exists()).to.be.true;
        expect(wrapper.find('button#navPatientHeader_profileButton').exists()).to.be.true;
        expect(wrapper.find('button#navPatientHeader_shareButton').exists()).to.be.false;
        expect(wrapper.find('button#navPatientHeader_uploadButton').exists()).to.be.false;
      });
    });

    context('clinician user with upload permissions', () => {
      const props = {
        user: { roles: ['clinician'] },
        trackMetric,
        api,
        patient: { ...patientProps, permissions: { root: {} } },
        clinicPatient: { ...clinicPatientProps },
        permsOfLoggedInUser: { upload: {} },
      };

      const wrapper = mount(
        <BrowserRouter>
          <NavPatientHeader {...props} />
        </BrowserRouter>
      );

      it('shows the correct info and actions', () => {
        // should show demographic info from the 'clinicPatient' object
        expect(wrapper.text()).to.include('Naoya Inoue');
        expect(wrapper.text()).to.include('999999');
        expect(wrapper.text()).to.include('1965-01-01');

        // should NOT show demographic info from the 'patient' object
        expect(wrapper.text()).not.to.include('Vasyl Lomachenko');
        expect(wrapper.text()).not.to.include('567890');
        expect(wrapper.text()).not.to.include('2010-10-20');

        expect(wrapper.find('button#navPatientHeader_backButton').exists()).to.be.true;
        expect(wrapper.find('button#navPatientHeader_viewDataButton').exists()).to.be.true;
        expect(wrapper.find('button#navPatientHeader_profileButton').exists()).to.be.true;
        expect(wrapper.find('button#navPatientHeader_shareButton').exists()).to.be.false;
        expect(wrapper.find('button#navPatientHeader_uploadButton').exists()).to.be.true;
      });
    });
  });

  describe('Smart-on-FHIR mode', () => {
    context('personal user with root permissions in Smart-on-FHIR mode', () => {
      const props = {
        user: { roles: [] },
        trackMetric,
        api,
        patient: { ...patientProps, permissions: { root: {} } },
        clinicPatient: undefined,
        isSmartOnFhirMode: true,
      };

      const wrapper = mount(
        <BrowserRouter>
          <NavPatientHeader {...props} />
        </BrowserRouter>
      );

      it('should hide upload button even with root permissions', () => {
        // should show demographic info from the 'patient' object
        expect(wrapper.text()).to.include('Vasyl Lomachenko');
        expect(wrapper.text()).not.to.include('Naoya Inoue');

        // should show standard buttons
        expect(wrapper.find('button#navPatientHeader_backButton').exists()).to.be.false;
        expect(wrapper.find('button#navPatientHeader_viewDataButton').exists()).to.be.true;
        expect(wrapper.find('button#navPatientHeader_profileButton').exists()).to.be.true;
        expect(wrapper.find('button#navPatientHeader_shareButton').exists()).to.be.true;

        // should NOT show upload button in Smart-on-FHIR mode
        expect(wrapper.find('button#navPatientHeader_uploadButton').exists()).to.be.false;
      });
    });

    context('clinician user with upload permissions in Smart-on-FHIR mode', () => {
      const props = {
        user: { roles: ['clinician'] },
        trackMetric,
        api,
        patient: { ...patientProps, permissions: { root: {} } },
        clinicPatient: { ...clinicPatientProps },
        permsOfLoggedInUser: { upload: {} },
        isSmartOnFhirMode: true,
      };

      const wrapper = mount(
        <BrowserRouter>
          <NavPatientHeader {...props} />
        </BrowserRouter>
      );

      it('should hide upload button even with upload permissions', () => {
        // should show demographic info from the 'clinicPatient' object
        expect(wrapper.text()).to.include('Naoya Inoue');
        expect(wrapper.text()).to.include('999999');
        expect(wrapper.text()).to.include('1965-01-01');

        // should show standard clinician buttons
        expect(wrapper.find('button#navPatientHeader_backButton').exists()).to.be.false;
        expect(wrapper.find('button#navPatientHeader_viewDataButton').exists()).to.be.true;
        expect(wrapper.find('button#navPatientHeader_profileButton').exists()).to.be.true;
        expect(wrapper.find('button#navPatientHeader_shareButton').exists()).to.be.false;

        // should NOT show upload button in Smart-on-FHIR mode
        expect(wrapper.find('button#navPatientHeader_uploadButton').exists()).to.be.false;
      });
    });

    context('button functionality remains intact in Smart-on-FHIR mode', () => {
      let wrapper;

      beforeEach(() => {
        const props = {
          user: { roles: [] },
          trackMetric,
          api,
          patient: { ...patientProps, permissions: { root: {} } },
          clinicPatient: { ...clinicPatientProps },
          isSmartOnFhirMode: true,
        };

        wrapper = mount(
          <BrowserRouter>
            <NavPatientHeader {...props} />
          </BrowserRouter>
        );
      });

      it('View button should still function correctly', () => {
        wrapper.find('button#navPatientHeader_viewDataButton').simulate('click');
        expect(handleViewData.calledOnce).to.be.true;
      });

      it('Profile button should still function correctly', () => {
        wrapper.find('button#navPatientHeader_profileButton').simulate('click');
        expect(handleViewProfile.calledOnce).to.be.true;
      });

      it('Share button should still function correctly', () => {
        wrapper.find('button#navPatientHeader_shareButton').simulate('click');
        expect(handleShare.calledOnce).to.be.true;
      });

      it('should not render upload overlay in Smart-on-FHIR mode', () => {
        // Upload button should not exist, so overlay should never appear
        expect(wrapper.find('.UploadLaunchOverlay').exists()).to.be.false;
        expect(wrapper.find('button#navPatientHeader_uploadButton').exists()).to.be.false;
      });
    });

    context('comparison with non-Smart-on-FHIR mode', () => {
      it('should show upload button when Smart-on-FHIR mode is disabled', () => {
        const propsWithoutSmartOnFhir = {
          user: { roles: [] },
          trackMetric,
          api,
          patient: { ...patientProps, permissions: { root: {} } },
          clinicPatient: undefined,
          isSmartOnFhirMode: false,
        };

        const wrapper = mount(
          <BrowserRouter>
            <NavPatientHeader {...propsWithoutSmartOnFhir} />
          </BrowserRouter>
        );

        // Upload button should be visible when Smart-on-FHIR mode is disabled
        expect(wrapper.find('button#navPatientHeader_uploadButton').exists()).to.be.true;
      });

      it('should hide upload button when Smart-on-FHIR mode is enabled', () => {
        const propsWithSmartOnFhir = {
          user: { roles: [] },
          trackMetric,
          api,
          patient: { ...patientProps, permissions: { root: {} } },
          clinicPatient: undefined,
          isSmartOnFhirMode: true,
        };

        const wrapper = mount(
          <BrowserRouter>
            <NavPatientHeader {...propsWithSmartOnFhir} />
          </BrowserRouter>
        );

        // Upload button should be hidden when Smart-on-FHIR mode is enabled
        expect(wrapper.find('button#navPatientHeader_uploadButton').exists()).to.be.false;
      });
    });
  });

  describe('button functions for personal users', () => {
    let wrapper;

    beforeEach(() => {
      const props = {
        user: { roles: [] },
        trackMetric,
        api,
        patient: { ...patientProps, permissions: { root: {} } },
        clinicPatient: { ...clinicPatientProps },
      };

      wrapper = mount(
        <BrowserRouter>
          <NavPatientHeader {...props} />
        </BrowserRouter>
      );
    });

    it('View button links to correct page', () => {
      wrapper.find('button#navPatientHeader_viewDataButton').simulate('click');
      expect(handleViewData.calledOnce).to.be.true;
    });

    it('Profile button links to correct page', () => {
      wrapper.find('button#navPatientHeader_profileButton').simulate('click');

      expect(handleViewProfile.calledOnce).to.be.true;
    });

    it('Share button links to correct page', () => {
      wrapper.find('button#navPatientHeader_shareButton').simulate('click');

      expect(handleShare.calledOnce).to.be.true;
    });

    it('Upload Button opens the upload dialog', () => {
      expect(wrapper.find('.UploadLaunchOverlay').exists()).to.be.false;
      wrapper.find('button#navPatientHeader_uploadButton').simulate('click');

      expect(handleLaunchUploader.calledOnce).to.be.true;
    });
  });

  describe('button functions for clinician users', () => {
    let wrapper;

    beforeEach(() => {
      const props = {
        user: { roles: ['clinician'] },
        trackMetric,
        api,
        patient: { ...patientProps, permissions: { } },
        clinicPatient: { ...clinicPatientProps },
        permsOfLoggedInUser: { upload: {} }
      };

      wrapper = mount(
        <BrowserRouter>
          <NavPatientHeader {...props} />
        </BrowserRouter>
      );
    });

    it('View button links to correct page', () => {
      wrapper.find('button#navPatientHeader_viewDataButton').simulate('click');

      expect(handleViewData.calledOnce).to.be.true;
    });

    it('Profile button links to correct page', () => {
      wrapper.find('button#navPatientHeader_profileButton').simulate('click');
      expect(handleViewProfile.calledOnce).to.be.true;
    });

    it('Upload Button opens the upload dialog', () => {
      expect(wrapper.find('.UploadLaunchOverlay').exists()).to.be.false;
      wrapper.find('button#navPatientHeader_uploadButton').simulate('click');

      expect(handleLaunchUploader.calledOnce).to.be.true;
      expect(wrapper.find('.UploadLaunchOverlay').exists()).to.be.true;
    });
  });

  describe('back button', () => {
    let wrapper;

    describe('viewing patient data or profile views as a clinician user', () => {
      const clinicianUserProps = {
        trackMetric,
        api,
        patient: { ...patientProps, permissions: { } },
        clinicPatient: { ...clinicPatientProps },
        user: { roles: ['clinic'] },
      };

      it('should render on data page', () => {
        wrapper = mount(<BrowserRouter><NavPatientHeader {...clinicianUserProps} currentPage="/patients/abc123/data" /></BrowserRouter>);
        wrapper.find('button#navPatientHeader_backButton').simulate('click');
        expect(handleBack.calledOnce).to.be.true;
      });

      it('should render on profile page', () => {
        wrapper = mount(<BrowserRouter><NavPatientHeader {...clinicianUserProps} currentPage="/patients/abc123/profile" /></BrowserRouter>);
        wrapper.find('button#navPatientHeader_backButton').simulate('click');
        expect(handleBack.calledOnce).to.be.true;
      });
    });

    describe('viewing patient data or profile views as a clinic clinician', () => {
      const clinicClinicianProps = {
        trackMetric,
        api,
        patient: { ...patientProps, permissions: { } },
        clinicPatient: { ...clinicPatientProps },
        clinicFlowActive: true,
        user: { isClinicMember: true },
        selectedClinicId: 'clinic123',
      };

      it ('should render on view page', () => {
        wrapper = mount(<BrowserRouter><NavPatientHeader {...clinicClinicianProps} currentPage="/patients/abc123/data" /></BrowserRouter>);
        wrapper.find('button#navPatientHeader_backButton').simulate('click');
        expect(handleBack.calledOnce).to.be.true;
      });

      it ('should render on profile page', () => {
        wrapper = mount(<BrowserRouter><NavPatientHeader {...clinicClinicianProps} currentPage="/patients/abc123/profile" /></BrowserRouter>);
        wrapper.find('button#navPatientHeader_backButton').simulate('click');
        expect(handleBack.calledOnce).to.be.true;
      });
    });

    describe('viewing the TIDE dashboard view as a clinic clinician', () => {
      it('should render a patient list link', () => {
        const clinicClinicianProps = {
          trackMetric,
          api,
          patient: { ...patientProps, permissions: { } },
          clinicPatient: { ...clinicPatientProps },
          clinicFlowActive: true,
          user: { isClinicMember: true },
          selectedClinicId: 'clinic123',
        };

        wrapper = mount(<BrowserRouter><NavPatientHeader {...clinicClinicianProps} currentPage="/dashboard/tide" /></BrowserRouter>);
        wrapper.find('button#navPatientHeader_backButton').simulate('click');
        expect(handleBack.calledOnce).to.be.true;
      });
    });
  });
});
