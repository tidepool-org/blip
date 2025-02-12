import { expect } from 'chai';
import sinon from 'sinon';
import { appBanners, pathRegexes } from '../../../../../app/providers/AppBanner/appBanners';

/* global describe */
/* global it */

describe('pathRegexes', () => {
  it('should have the correct regex for each path', () => {
    expect(pathRegexes.clinicWorkspace).to.eql(/^\/clinic-workspace/);
    expect(pathRegexes.patientData).to.eql(/^\/patients\/\S+\/data/);
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
        default:
          return null;
      }
    }

    it('dataSourceJustConnected should return object with the expected keys', () => {
      const props = getPropsForBanner('dataSourceJustConnected');
      expect(props).to.have.all.keys(['label', 'title', 'show', 'dismiss']);
    });

    it('dataSourceReconnect should return object with the expected keys', () => {
      const props = getPropsForBanner('dataSourceReconnect');
      expect(props).to.have.all.keys(['label', 'message', 'show', 'action', 'dismiss']);
    });

    it('uploader should return object with the expected keys', () => {
      const props = getPropsForBanner('uploader');
      expect(props).to.have.all.keys(['label', 'message', 'show', 'action', 'messageLink', 'dismiss']);
    });

    it('shareData should return object with the expected keys', () => {
      const props = getPropsForBanner('shareData');
      expect(props).to.have.all.keys(['label', 'message', 'show', 'action', 'messageLink', 'dismiss']);
    });

    it('donateYourData should return object with the expected keys', () => {
      const props = getPropsForBanner('donateYourData');
      expect(props).to.have.all.keys(['label', 'message', 'show', 'action', 'messageLink', 'dismiss']);
    });

    it('shareProceeds should return object with the expected keys', () => {
      const props = getPropsForBanner('shareProceeds');
      expect(props).to.have.all.keys(['label', 'message', 'show', 'action', 'messageLink', 'dismiss']);
    });

    it('updateType should return object with the expected keys', () => {
      const props = getPropsForBanner('updateType');
      expect(props).to.have.all.keys(['label', 'message', 'show', 'action', 'messageLink', 'dismiss']);
    });

    it('patientLimit should return object with the expected keys', () => {
      const props = getPropsForBanner('patientLimit');
      expect(props).to.have.all.keys(['label', 'message', 'show', 'action', 'dismiss']);
    });

    it('dataSourceReconnectInvite should return object with the expected keys', () => {
      const props = getPropsForBanner('dataSourceReconnectInvite');
      expect(props).to.have.all.keys(['label', 'message', 'show', 'action', 'dismiss']);
    });

    it('addEmail should return object with the expected keys', () => {
      const props = getPropsForBanner('addEmail');
      expect(props).to.have.all.keys(['label', 'message', 'show', 'action', 'dismiss']);
    });

    it('sendVerification should return object with the expected keys', () => {
      const props = getPropsForBanner('sendVerification');
      expect(props).to.have.all.keys(['label', 'message', 'show', 'action', 'dismiss']);
    });
  });
});
