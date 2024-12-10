/* global chai */
/* global describe */
/* global sinon */
/* global afterEach */
/* global context */
/* global it */
/* global beforeEach */

import React from 'react';
import { mount } from 'enzyme';
import { BrowserRouter } from 'react-router-dom';
import _ from 'lodash';

import NavPatientHeader from '../../../../app/components/navpatientheader';

const expect = chai.expect;

const defaultPatientProps = { 
  userid: 1234,
  profile: { 
    fullName: 'Vasyl Lomachenko',
    patient: { birthday: '2010-10-20', mrn: '567890' }
  }
};

describe('NavPatientHeader', () => {
  const mockHistory = { push: sinon.stub() }
  const mockTrackMetric = sinon.stub();

  NavPatientHeader.__Rewire__('useHistory', sinon.stub().returns(mockHistory));

  afterEach(() => {
    mockTrackMetric.reset();
    mockHistory.push.reset();
  });

  describe('visibility of patient info and actions', () => {
    context('personal user with non-root permissions', () => {
      const props = {
        user: { roles: [] },
        trackMetric: mockTrackMetric,
        patient: { ...defaultPatientProps, permissions: { } },
      };

      const wrapper = mount(
        <BrowserRouter>
          <NavPatientHeader {...props} />
        </BrowserRouter>
      );

      it('shows the correct info and actions', () => {
        expect(wrapper.text()).to.include('Vasyl Lomachenko');
        expect(wrapper.text()).not.to.include('567890');
        expect(wrapper.text()).not.to.include('2010-10-20');

        expect(wrapper.find('button#navPatientHeader_backButton').exists()).to.be.false;
        expect(wrapper.find('button#navPatientHeader_viewDataButton').exists()).to.be.true;
        expect(wrapper.find('button#navPatientHeader_profileButton').exists()).to.be.true;

        expect(wrapper.find('button#navPatientHeader_shareButton').exists()).to.be.false;
        expect(wrapper.find('button#navPatientHeader_uploadButton').exists()).to.be.false;
      })
    });

    context('personal user with root permissions', () => {
      const props = {
        user: { roles: [] },
        trackMetric: mockTrackMetric,
        patient: { ...defaultPatientProps, permissions: { root: {} } },
      };

      const wrapper = mount(
        <BrowserRouter>
          <NavPatientHeader {...props} />
        </BrowserRouter>
      );

      it('shows the correct info and actions', () => {
        expect(wrapper.text()).to.include('Vasyl Lomachenko');
        expect(wrapper.text()).not.to.include('567890');
        expect(wrapper.text()).not.to.include('2010-10-20');

        expect(wrapper.find('button#navPatientHeader_backButton').exists()).to.be.false;
        expect(wrapper.find('button#navPatientHeader_viewDataButton').exists()).to.be.true;
        expect(wrapper.find('button#navPatientHeader_profileButton').exists()).to.be.true;
        expect(wrapper.find('button#navPatientHeader_shareButton').exists()).to.be.true;
        expect(wrapper.find('button#navPatientHeader_uploadButton').exists()).to.be.true;
      })
    });

    context('clinician user without upload permissions', () => {
      const props = {
        user: { roles: ['clinician'] },
        trackMetric: mockTrackMetric,
        patient: { ...defaultPatientProps, permissions: { } },
        permsOfLoggedInUser: {}
      };

      const wrapper = mount(
        <BrowserRouter>
          <NavPatientHeader {...props} />
        </BrowserRouter>
      );

      it('shows the correct info and actions', () => {
        expect(wrapper.text()).to.include('Vasyl Lomachenko');
        expect(wrapper.text()).to.include('567890');
        expect(wrapper.text()).to.include('2010-10-20');

        expect(wrapper.find('button#navPatientHeader_backButton').exists()).to.be.true;
        expect(wrapper.find('button#navPatientHeader_viewDataButton').exists()).to.be.true;
        expect(wrapper.find('button#navPatientHeader_profileButton').exists()).to.be.true;
        expect(wrapper.find('button#navPatientHeader_shareButton').exists()).to.be.false;
        expect(wrapper.find('button#navPatientHeader_uploadButton').exists()).to.be.false;
      })
    });

    context('clinician user with upload permissions', () => {
      const props = {
        user: { roles: ['clinician'] },
        trackMetric: mockTrackMetric,
        patient: { ...defaultPatientProps, permissions: { root: {} } },
        permsOfLoggedInUser: { upload: {} }
      };

      const wrapper = mount(
        <BrowserRouter>
          <NavPatientHeader {...props} />
        </BrowserRouter>
      );

      it('shows the correct info and actions', () => {
        expect(wrapper.text()).to.include('Vasyl Lomachenko');
        expect(wrapper.text()).to.include('567890');
        expect(wrapper.text()).to.include('2010-10-20');

        expect(wrapper.find('button#navPatientHeader_backButton').exists()).to.be.true;
        expect(wrapper.find('button#navPatientHeader_viewDataButton').exists()).to.be.true;
        expect(wrapper.find('button#navPatientHeader_profileButton').exists()).to.be.true;
        expect(wrapper.find('button#navPatientHeader_shareButton').exists()).to.be.false;
        expect(wrapper.find('button#navPatientHeader_uploadButton').exists()).to.be.true;
      })
    });
  });

  describe('button functions for personal users', () => {
    let wrapper;

    beforeEach(() => {
      const props = { 
        user: { roles: [] },
        trackMetric: mockTrackMetric,
        patient: { ...defaultPatientProps, permissions: { root: {} } },
      };

      wrapper = mount(
        <BrowserRouter>
          <NavPatientHeader {...props} />
        </BrowserRouter>
      );
    })

    it('View button links to correct page', () => {
      wrapper.find('button#navPatientHeader_viewDataButton').simulate('click');

      expect(mockTrackMetric.calledOnceWithExactly('Clicked Navbar View Data'));
      expect(mockHistory.push.calledOnceWithExactly('/patients/1234/data')).to.be.true;
    })
  
    it('Profile button links to correct page', () => {
      wrapper.find('button#navPatientHeader_profileButton').simulate('click');

      expect(mockTrackMetric.calledOnceWithExactly('Clicked Navbar Name'));
      expect(mockHistory.push.calledOnceWithExactly('/patients/1234/profile')).to.be.true;
    })
  
    it('Share button links to correct page', () => {
      wrapper.find('button#navPatientHeader_shareButton').simulate('click');

      expect(mockTrackMetric.calledOnceWithExactly('Clicked Navbar Share Data'));
      expect(mockHistory.push.calledOnceWithExactly('/patients/1234/share')).to.be.true;
    })
  
    it('Upload Button opens the upload dialog', () => {
      expect(wrapper.find('.UploadLaunchOverlay').exists()).to.be.false;
      wrapper.find('button#navPatientHeader_uploadButton').simulate('click');  

      expect(mockTrackMetric.calledOnceWithExactly('Clicked Navbar Upload Data'));
      expect(wrapper.find('.UploadLaunchOverlay').exists()).to.be.true;
    });
  });

  describe('button functions for clinician users', () => {
    let wrapper;

    beforeEach(() => {
      const props = { 
        user: { roles: ['clinician'] },
        trackMetric: mockTrackMetric,
        patient: { ...defaultPatientProps, permissions: { root: {} } },
      };

      wrapper = mount(
        <BrowserRouter>
          <NavPatientHeader {...props} />
        </BrowserRouter>
      );
    })

    it('View button links to correct page', () => {
      wrapper.find('button#navPatientHeader_viewDataButton').simulate('click');
  
      expect(mockTrackMetric.calledOnceWithExactly('Clicked Navbar View Data'));
      expect(mockHistory.push.calledOnceWithExactly('/patients/1234/data')).to.be.true;
    })
  
    it('Profile button links to correct page', () => {
      wrapper.find('button#navPatientHeader_profileButton').simulate('click');
      expect(mockTrackMetric.calledOnceWithExactly('Clicked Navbar Name'));
      expect(mockHistory.push.calledOnceWithExactly('/patients/1234/profile')).to.be.true;
    })
  
    it('Upload Button opens the upload dialog', () => {
      expect(wrapper.find('.UploadLaunchOverlay').exists()).to.be.false;
      wrapper.find('button#navPatientHeader_uploadButton').simulate('click');
  
      expect(mockTrackMetric.calledOnceWithExactly('Clicked Navbar Upload Data'));
      expect(wrapper.find('.UploadLaunchOverlay').exists()).to.be.true;
    });
  });

  describe('back button', () => {
    let wrapper;

    describe('viewing patient data or profile views as a clinician user', () => {
      const clinicianUserProps = {
        trackMetric: mockTrackMetric,
        patient: { ...defaultPatientProps, permissions: { } },
        user: { roles: ['clinic'] },
      };

      it('should render on data page', () => {
        wrapper = mount(<BrowserRouter><NavPatientHeader {...clinicianUserProps} currentPage="/patients/abc123/data" /></BrowserRouter>);
        wrapper.find('button#navPatientHeader_backButton').simulate('click');
        expect(mockHistory.push.calledOnceWithExactly('/patients')).to.be.true;
      })

      it('should render on profile page', () => {
        wrapper = mount(<BrowserRouter><NavPatientHeader {...clinicianUserProps} currentPage="/patients/abc123/profile" /></BrowserRouter>);
        wrapper.find('button#navPatientHeader_backButton').simulate('click');
        expect(mockHistory.push.calledOnceWithExactly('/patients')).to.be.true;
      })
    })

    describe('viewing patient data or profile views as a clinic clinician', () => {
      const clinicClinicianProps = {
        trackMetric: mockTrackMetric,
        patient: { ...defaultPatientProps, permissions: { } },
        clinicFlowActive: true,
        user: { isClinicMember: true },
        selectedClinicId: 'clinic123',
      };

      it ('should render on view page', () => {
        wrapper = mount(<BrowserRouter><NavPatientHeader {...clinicClinicianProps} currentPage="/patients/abc123/data" /></BrowserRouter>);
        wrapper.find('button#navPatientHeader_backButton').simulate('click');
        expect(mockHistory.push.calledOnceWithExactly('/clinic-workspace/patients')).to.be.true;
      });

      it ('should render on profile page', () => {
        wrapper = mount(<BrowserRouter><NavPatientHeader {...clinicClinicianProps} currentPage="/patients/abc123/profile" /></BrowserRouter>);
        wrapper.find('button#navPatientHeader_backButton').simulate('click');
        expect(mockHistory.push.calledOnceWithExactly('/clinic-workspace/patients')).to.be.true;
      });

      it ('should link to standard patients page when null selectedClinicId', () => {
        wrapper = mount(<BrowserRouter><NavPatientHeader {...clinicClinicianProps} currentPage="/patients/abc123/profile" selectedClinicId={null} /></BrowserRouter>);
        // If selectedClinicId is null, we redirect to the standard patient list URL
        wrapper.find('button#navPatientHeader_backButton').simulate('click');
        expect(mockHistory.push.calledOnceWithExactly('/patients')).to.be.true; 
      });
    });

    describe('viewing the TIDE dashboard view as a clinic clinician', () => {
      it('should render a patient list link', () => {
        const clinicClinicianProps = {
          trackMetric: mockTrackMetric,
          patient: { ...defaultPatientProps, permissions: { } },
          clinicFlowActive: true,
          user: { isClinicMember: true },
          selectedClinicId: 'clinic123',
        };
  
        wrapper = mount(<BrowserRouter><NavPatientHeader {...clinicClinicianProps} currentPage="/dashboard/tide" /></BrowserRouter>);
        wrapper.find('button#navPatientHeader_backButton').simulate('click');
        expect(mockHistory.push.calledOnceWithExactly('/clinic-workspace/patients')).to.be.true; 
      });
    })
  });
});
