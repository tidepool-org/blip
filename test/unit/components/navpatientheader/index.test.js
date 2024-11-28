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

describe.only('NavPatientHeader', () => {
  const mockHistory = { push: sinon.stub() }
  const mockTrackMetric = sinon.stub();

  NavPatientHeader.__Rewire__('useHistory', sinon.stub().returns(mockHistory));

  afterEach(() => {
    mockTrackMetric.reset();
    mockHistory.push.reset();
  });

  describe(('visibility of patient info and actions'), () => {
    context('personal user with non-root permissions', () => {
      const props = { // personal user with non-root permissions;
        user: { roles: [] },
        trackMetric: mockTrackMetric,
        patient: { ...defaultPatientProps, permissions: { root: false } },
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

        expect(wrapper.find('button#patientDataHeader_viewDataButton').exists()).to.be.true;
        expect(wrapper.find('button#patientDataHeader_profileButton').exists()).to.be.true;

        expect(wrapper.find('button#patientDataHeader_shareButton').exists()).to.be.false;
        expect(wrapper.find('button#patientDataHeader_uploadButton').exists()).to.be.false;
      })
    });

    context('personal user with root permissions', () => {
      const props = { // personal user with root permissions;
        user: { roles: [] },
        trackMetric: mockTrackMetric,
        patient: { ...defaultPatientProps, permissions: { root: true } },
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

        expect(wrapper.find('button#patientDataHeader_viewDataButton').exists()).to.be.true;
        expect(wrapper.find('button#patientDataHeader_profileButton').exists()).to.be.true;
        expect(wrapper.find('button#patientDataHeader_shareButton').exists()).to.be.true;
        expect(wrapper.find('button#patientDataHeader_uploadButton').exists()).to.be.true;
      })
    });

    context('clinician user with non-root permissions', () => {
      const props = { // personal user with root permissions;
        user: { roles: ['clinician'] },
        trackMetric: mockTrackMetric,
        patient: { ...defaultPatientProps, permissions: { root: false } },
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

        expect(wrapper.find('button#patientDataHeader_viewDataButton').exists()).to.be.true;
        expect(wrapper.find('button#patientDataHeader_profileButton').exists()).to.be.true;
        expect(wrapper.find('button#patientDataHeader_shareButton').exists()).to.be.false;
        expect(wrapper.find('button#patientDataHeader_uploadButton').exists()).to.be.false;
      })
    });

    context('clinician user with root permissions', () => {
      const props = { // personal user with root permissions;
        user: { roles: ['clinician'] },
        trackMetric: mockTrackMetric,
        patient: { ...defaultPatientProps, permissions: { root: true } },
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

        expect(wrapper.find('button#patientDataHeader_viewDataButton').exists()).to.be.true;
        expect(wrapper.find('button#patientDataHeader_profileButton').exists()).to.be.true;
        expect(wrapper.find('button#patientDataHeader_shareButton').exists()).to.be.false;
        expect(wrapper.find('button#patientDataHeader_uploadButton').exists()).to.be.true;
      })
    });
  });

  describe(('button functions'), () => {
    let wrapper;

    beforeEach(() => {
      // Personal user with root permissions has all of the button functionality available;
      const props = { 
        user: { roles: [] },
        trackMetric: mockTrackMetric,
        patient: { ...defaultPatientProps, permissions: { root: true } },
      };

      wrapper = mount(
        <BrowserRouter>
          <NavPatientHeader {...props} />
        </BrowserRouter>
      );
    })

    it('View button links to correct page', () => {
      const button = wrapper.find('button#patientDataHeader_viewDataButton').hostNodes();
      button.simulate('click');
  
      expect(mockHistory.push.calledOnceWithExactly('/patients/1234/data')).to.be.true;
    })
  
    it('Profile button links to correct page', () => {
      const button = wrapper.find('button#patientDataHeader_profileButton').hostNodes();
      button.simulate('click');
  
      expect(mockHistory.push.calledOnceWithExactly('/patients/1234/profile')).to.be.true;
    })
  
    it('Share button links to correct page', () => {
      const button = wrapper.find('button#patientDataHeader_shareButton').hostNodes();
      button.simulate('click');
  
      expect(mockHistory.push.calledOnceWithExactly('/patients/1234/share')).to.be.true;
    })
  
    it('Upload Button opens the upload dialog', () => {
      expect(wrapper.find('.UploadLaunchOverlay').exists()).to.be.false;
  
      const button = wrapper.find('button#patientDataHeader_uploadButton').hostNodes();
      button.simulate('click');
  
      expect(wrapper.find('.UploadLaunchOverlay').exists()).to.be.true;
    });
  });
});
