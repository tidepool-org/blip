import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { mountWithProviders } from '../../../../utils/mountWithProviders';
import AppBanner from '../../../../../app/providers/AppBanner/AppBanner';
import { AppBannerContext, CLICKED_BANNER_ACTION, DISMISSED_BANNER_ACTION, SEEN_BANNER_ACTION } from '../../../../../app/providers/AppBanner/AppBannerProvider';
import Banner from '../../../../../app/components/elements/Banner';

/* global describe */
/* global it */
/* global beforeEach */
/* global afterEach */

describe('AppBanner handleClickAction', () => {
  let defaultState;
  let dispatchSpy;
  let trackMetricStub;
  let setBannerInteractedForPatientStub;
  let setBannerShownForPatientStub;
  let contextValue;
  let handleBannerInteractionStub;
  const apiStub = 'api'

  beforeEach(() => {
    defaultState = {
      loggedInUserId: 'user123',
      currentPatientInViewId: 'user123',
      working: {},
    };

    handleBannerInteractionStub = sinon.stub().callsFake((...args) => args);

    AppBanner.__Rewire__('api', apiStub);

    AppBanner.__Rewire__('async', {
      handleBannerInteraction: handleBannerInteractionStub,
    });

    dispatchSpy = sinon.spy();
    trackMetricStub = sinon.stub();
    setBannerInteractedForPatientStub = sinon.stub();
    setBannerShownForPatientStub = sinon.stub();

    contextValue = {
      banner: {
        id: 'testBanner',
        interactionId: 'TestBanner',
        label: 'Test Label',
        message: 'Test Message',
        title: 'Test Title',
        action: {},
      },
      bannerShownForPatient: {},
      setBannerShownForPatient: setBannerShownForPatientStub,
      bannerInteractedForPatient: {},
      setBannerInteractedForPatient: setBannerInteractedForPatientStub,
      setFormikContext: sinon.stub(),
      setTrackMetric: sinon.stub(),
    };
  });

  afterEach(() => {
    AppBanner.__ResetDependency__('api');
    AppBanner.__ResetDependency__('async');
  });

  function createWrapper(customBanner = {}) {
    const finalContext = {
      ...contextValue,
      banner: { ...contextValue.banner, ...customBanner },
    };

    const { store, wrapper } = mountWithProviders(
      <AppBannerContext.Provider value={finalContext}>
        <AppBanner trackMetric={trackMetricStub} />
      </AppBannerContext.Provider>,
      {
        preloadedState: defaultState,
        dispatchSpy,
      }
    );
    return { store, wrapper };
  }

  it('should call trackMetric if an action metric is defined', () => {
    const { wrapper } = createWrapper({
      action: {
        metric: 'testMetric',
        metricProps: { someProp: true },
      },
    });

    wrapper.find(Banner).prop('onAction')();
    expect(trackMetricStub.calledWith('testMetric', { someProp: true })).to.be.true;
  });

  it('should set showModal to true and not call the action handler if a modal component is present', () => {
    const actionHandlerStub = sinon.stub();
    const { wrapper } = createWrapper({
      action: {
        metric: 'testMetric',
        modal: { component: () => <div className='modal'>Modal</div> },
        handler: actionHandlerStub,
      },
    });
    wrapper.find(Banner).prop('onAction')();
    // showModal won't be directly testable, but we can check that the modal was rendered
    wrapper.update();
    expect(wrapper.find('div.modal').text()).to.equal('Modal');
    expect(actionHandlerStub.called).to.be.false;
  });

  it('should call the action handler if present (no modal)', () => {
    const actionHandlerStub = sinon.stub();
    const { wrapper } = createWrapper({
      action: {
        handler: actionHandlerStub,
      },
    });
    wrapper.find(Banner).prop('onAction')();
    expect(actionHandlerStub.called).to.be.true;
  });

  it('should call completeClickAction if no working key is defined', () => {
    const handlerStub = sinon.stub();
    const { wrapper } = createWrapper({
      action: {
        handler: handlerStub,
      },
    });
    wrapper.find(Banner).prop('onAction')();
    expect(handlerStub.called).to.be.true;

    // completeClickAction dispatches handleBannerInteraction with CLICKED_BANNER_ACTION
    expect(dispatchSpy.called).to.be.true;
    expect(handleBannerInteractionStub.calledWith('api', 'user123', 'TestBanner', CLICKED_BANNER_ACTION)).to.be.true;
  });

  it('should NOT call completeClickAction if a working key is defined', () => {
    const { wrapper } = createWrapper({
      action: {
        working: { key: 'someWorkKey' },
      },
    });
    wrapper.find(Banner).prop('onAction')();

    // completeClickAction dispatches handleBannerInteraction with CLICKED_BANNER_ACTION
    // If no handler is defined, they should not be called
    expect(dispatchSpy.called).to.be.false;
    expect(handleBannerInteractionStub.called).to.be.false;
  });

  it('should call handleBannerInteraction with SEEN_BANNER_ACTION when banner is shown', () => {
    const { wrapper } = createWrapper({
      show: {
        metric: 'showMetric',
        metricProps: { someProp: true },
      },
      maxUniqueDaysShown: 1,
    });

    wrapper.update();
    expect(dispatchSpy.called).to.be.true;
    expect(trackMetricStub.calledWith('showMetric', { someProp: true })).to.be.true;
    expect(setBannerShownForPatientStub.calledWith({ TestBanner: { user123: true } })).to.be.true;
    expect(handleBannerInteractionStub.calledWith('api', 'user123', 'TestBanner', SEEN_BANNER_ACTION)).to.be.true;
  });

  it('should call handleBannerInteraction with DISMISSED_BANNER_ACTION when banner is dismissed', () => {
    const handlerStub = sinon.stub();
    const { wrapper } = createWrapper({
      dismiss: {
        handler: handlerStub,
      },
    });

    wrapper.find(Banner).prop('onDismiss')();
    expect(handlerStub.called).to.be.true;

    // completeClickAction dispatches handleBannerInteraction with DISMISSED_BANNER_ACTION
    expect(dispatchSpy.called).to.be.true;
    expect(handleBannerInteractionStub.calledWith('api', 'user123', 'TestBanner', DISMISSED_BANNER_ACTION)).to.be.true;
  });
});
