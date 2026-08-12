import { expect } from 'chai';
import sinon from 'sinon';
import { push } from 'connected-react-router';
import { appBanners, pathRegexes } from '../../../../../app/providers/AppBanner/appBanners';

/* global describe */
/* global it */

describe('pathRegexes', () => {
  it('should have the correct regex for each path', () => {
    expect(pathRegexes.clinicWorkspace).to.eql(/^\/clinic-workspace/);
    expect(pathRegexes.clinicWorkspacePatientList).to.eql(/^\/clinic-workspace(\/patients)?\/?$/);
    expect(pathRegexes.patientData).to.eql(/^\/patients\/\S+\/data/);
  });

  it('clinicWorkspacePatientList should match the patient list tab only', () => {
    expect(pathRegexes.clinicWorkspacePatientList.test('/clinic-workspace')).to.be.true;
    expect(pathRegexes.clinicWorkspacePatientList.test('/clinic-workspace/patients')).to.be.true;
    expect(pathRegexes.clinicWorkspacePatientList.test('/clinic-workspace/invites')).to.be.false;
    expect(pathRegexes.clinicWorkspacePatientList.test('/clinic-workspace/prescriptions')).to.be.false;
    expect(pathRegexes.clinicWorkspacePatientList.test('/patients/abc/data')).to.be.false;
  });
});

describe('appBanners', () => {
  it('should have the correct id, variant, priority, context, and paths for each banner', () => {
    // Create a lookup map by `id` for easier access
    const bannerMap = appBanners.reduce((acc, banner) => {
      acc[banner.id] = banner;
      return acc;
    }, {});

    // Ensure we have all the banners we're expecting
    // Adjust these to match all banner IDs in appBanners
    const expectedIds = [
      'dataSourceJustConnected',
      'dataSourceReconnect',
      'uploader',
      'shareData',
      'donateYourData',
      'shareProceeds',
      'updateType',
      'patientLimit',
      'dataSourceReconnectInvite',
      'addEmail',
      'sendVerification',
      'enable2fa',
    ];

    // Check that each expected ID is present
    expectedIds.forEach((id) => {
      expect(bannerMap[id]).to.exist;
    });

    // dataSourceJustConnected
    expect(bannerMap.dataSourceJustConnected).to.include({
      variant: 'info',
      priority: 0,
    });
    expect(bannerMap.dataSourceJustConnected.context).to.eql(['patient']);
    expect(bannerMap.dataSourceJustConnected.paths).to.eql([pathRegexes.patientData]);

    // dataSourceReconnect
    expect(bannerMap.dataSourceReconnect).to.include({
      variant: 'warning',
      priority: 1,
    });
    expect(bannerMap.dataSourceReconnect.context).to.eql(['patient']);
    expect(bannerMap.dataSourceReconnect.paths).to.eql([pathRegexes.patientData]);

    // uploader
    expect(bannerMap.uploader).to.include({
      variant: 'info',
      priority: 2,
    });
    expect(bannerMap.uploader.context).to.eql(['patient']);
    expect(bannerMap.uploader.paths).to.eql([pathRegexes.patientData]);

    // shareData
    expect(bannerMap.shareData).to.include({
      variant: 'info',
      priority: 3,
    });
    expect(bannerMap.shareData.context).to.eql(['patient']);
    expect(bannerMap.shareData.paths).to.eql([pathRegexes.patientData]);

    // donateYourData
    expect(bannerMap.donateYourData).to.include({
      variant: 'info',
      priority: 4,
    });
    expect(bannerMap.donateYourData.context).to.eql(['patient']);
    expect(bannerMap.donateYourData.paths).to.eql([pathRegexes.patientData]);

    // shareProceeds
    expect(bannerMap.shareProceeds).to.include({
      variant: 'info',
      priority: 5,
    });
    expect(bannerMap.shareProceeds.context).to.eql(['patient']);
    expect(bannerMap.shareProceeds.paths).to.eql([pathRegexes.patientData]);

    // updateType
    expect(bannerMap.updateType).to.include({
      variant: 'info',
      priority: 6,
    });
    expect(bannerMap.updateType.context).to.eql(['patient']);
    expect(bannerMap.updateType.paths).to.eql([pathRegexes.patientData]);

    // patientLimit
    expect(bannerMap.patientLimit).to.include({
      variant: 'warning',
      priority: 7,
    });
    expect(bannerMap.patientLimit.context).to.eql(['clinic']);
    expect(bannerMap.patientLimit.paths).to.eql([pathRegexes.clinicWorkspace]);

    // dataSourceReconnectInvite
    expect(bannerMap.dataSourceReconnectInvite).to.include({
      variant: 'warning',
      priority: 8,
    });
    expect(bannerMap.dataSourceReconnectInvite.context).to.eql(['clinic']);
    expect(bannerMap.dataSourceReconnectInvite.paths).to.eql([pathRegexes.patientData]);

    // addEmail
    expect(bannerMap.addEmail).to.include({
      variant: 'info',
      priority: 9,
    });
    expect(bannerMap.addEmail.context).to.eql(['clinic']);
    expect(bannerMap.addEmail.paths).to.eql([pathRegexes.patientData]);

    // sendVerification
    expect(bannerMap.sendVerification).to.include({
      variant: 'info',
      priority: 10,
    });
    expect(bannerMap.sendVerification.context).to.eql(['clinic']);
    expect(bannerMap.sendVerification.paths).to.eql([pathRegexes.patientData]);

    // enable2fa
    expect(bannerMap.enable2fa).to.include({
      variant: 'info',
      priority: 11,
    });
    expect(bannerMap.enable2fa.context).to.eql(['clinic']);
    expect(bannerMap.enable2fa.paths).to.eql([pathRegexes.clinicWorkspacePatientList]);
  });

  describe('getProps', () => {
    const dispatchStub = sinon.stub();
    const providerStub = {};
    const clinicIdStub = 'fakeClinicId';
    const patientStub = { id: 'fakePatientId', email: 'fake@patient.com', fullName: 'Fake Patient' };
    const formikContextStub = { handleSubmit: sinon.stub(), values: {} };
    const loggedInUserId = 'user123';

    function getPropsForBanner(bannerId) {
      const banner = appBanners.find(b => b.id === bannerId);
      if (!banner || typeof banner.getProps !== 'function') {
        return null;
      }

      // Call getProps with minimal arguments required by each banner
      switch (bannerId) {
        case 'dataSourceJustConnected':
          return banner.getProps(providerStub);
        case 'dataSourceReconnect':
          return banner.getProps(dispatchStub, providerStub);
        case 'uploader':
          return banner.getProps();
        case 'shareData':
          return banner.getProps(dispatchStub, loggedInUserId);
        case 'donateYourData':
          return banner.getProps(dispatchStub);
        case 'shareProceeds':
          return banner.getProps(dispatchStub, loggedInUserId);
        case 'updateType':
          return banner.getProps(dispatchStub, loggedInUserId);
        case 'patientLimit':
          return banner.getProps({ name: 'Test Clinic' });
        case 'dataSourceReconnectInvite':
          return banner.getProps(dispatchStub, clinicIdStub, patientStub, providerStub);
        case 'addEmail':
          return banner.getProps(formikContextStub, patientStub);
        case 'sendVerification':
          return banner.getProps(dispatchStub, patientStub);
        case 'enable2fa':
          return banner.getProps(dispatchStub);
        default:
          return null;
      }
    }

    it('dataSourceJustConnected should return object with the expected keys', () => {
      const props = getPropsForBanner('dataSourceJustConnected');
      expect(props).to.have.all.keys(['ignoreBannerInteractionsBeforeTime', 'interactionId', 'label', 'title', 'show', 'dismiss']);
    });

    it('dataSourceReconnect should return object with the expected keys', () => {
      const props = getPropsForBanner('dataSourceReconnect');
      expect(props).to.have.all.keys(['ignoreBannerInteractionsBeforeTime', 'interactionId', 'label', 'message', 'show', 'action', 'dismiss']);
    });

    it('uploader should return object with the expected keys', () => {
      const props = getPropsForBanner('uploader');
      expect(props).to.have.all.keys(['interactionId', 'label', 'message', 'show', 'action', 'messageLink', 'dismiss']);
    });

    it('shareData should return object with the expected keys', () => {
      const props = getPropsForBanner('shareData');
      expect(props).to.have.all.keys(['interactionId', 'label', 'message', 'show', 'action', 'messageLink', 'dismiss']);
    });

    it('donateYourData should return object with the expected keys', () => {
      const props = getPropsForBanner('donateYourData');
      expect(props).to.have.all.keys(['interactionId', 'label', 'message', 'show', 'action', 'messageLink', 'dismiss']);
    });

    it('shareProceeds should return object with the expected keys', () => {
      const props = getPropsForBanner('shareProceeds');
      expect(props).to.have.all.keys(['interactionId', 'label', 'message', 'show', 'action', 'messageLink', 'dismiss']);
    });

    it('updateType should return object with the expected keys', () => {
      const props = getPropsForBanner('updateType');
      expect(props).to.have.all.keys(['interactionId', 'label', 'message', 'show', 'action', 'messageLink', 'dismiss']);
    });

    it('patientLimit should return object with the expected keys', () => {
      const props = getPropsForBanner('patientLimit');
      expect(props).to.have.all.keys(['interactionId', 'label', 'message', 'show', 'action', 'dismiss']);
    });

    it('dataSourceReconnectInvite should return object with the expected keys', () => {
      const props = getPropsForBanner('dataSourceReconnectInvite');
      expect(props).to.have.all.keys(['interactionId', 'label', 'message', 'show', 'action', 'dismiss']);
    });

    it('addEmail should return object with the expected keys', () => {
      const props = getPropsForBanner('addEmail');
      expect(props).to.have.all.keys(['interactionId', 'label', 'message', 'show', 'action', 'dismiss']);
    });

    it('sendVerification should return object with the expected keys', () => {
      const props = getPropsForBanner('sendVerification');
      expect(props).to.have.all.keys(['interactionId', 'label', 'message', 'show', 'action', 'dismiss']);
    });

    it('enable2fa should return object with the expected keys', () => {
      const props = getPropsForBanner('enable2fa');
      expect(props).to.have.all.keys(['interactionId', 'label', 'message', 'show', 'action', 'dismiss']);
    });

    it('enable2fa action handler dispatches a push to /profile with openMfaSetup location state', () => {
      const dispatch = sinon.stub();
      const banner = appBanners.find(b => b.id === 'enable2fa');
      const props = banner.getProps(dispatch);
      props.action.handler();
      expect(dispatch.calledOnce).to.be.true;
      expect(dispatch.firstCall.args[0]).to.deep.equal(
        push({ pathname: '/profile', state: { openMfaSetup: true } })
      );
    });
  });
});
