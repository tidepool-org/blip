import React from 'react';
import { shallow } from 'enzyme';
import AppWrapper from '../../../../app/pages/app/AppWrapper';
import AppBanner from '../../../../app/providers/AppBanner/AppBanner';
import useProviderConnectionPopup from '../../../../app/components/datasources/useProviderConnectionPopup';

/* global describe */
/* global it */
/* global expect */
/* global sinon */
/* global beforeEach */
/* global afterEach */

describe('AppWrapper', () => {
  let AppBannerStub;
  let trackMetricStub;
  let useProviderConnectionPopupStub;

  beforeEach(() => {
    AppBannerStub = () => <div classname="app-banner-stub" />;
    trackMetricStub = sinon.stub();
    useProviderConnectionPopupStub = sinon.stub()
    AppWrapper.__Rewire__('AppBanner', AppBannerStub);
    AppWrapper.__Rewire__('useProviderConnectionPopup', useProviderConnectionPopupStub);
  });

  afterEach(() => {
    AppWrapper.__ResetDependency__('AppBanner');
    AppWrapper.__ResetDependency__('useProviderConnectionPopup');
  });

  it('should call useProviderConnectionPopup hook', () => {
    shallow(<AppWrapper trackMetric={trackMetricStub}><div className="child" /></AppWrapper>);
    expect(useProviderConnectionPopupStub.calledOnce).to.be.true;
  });

  it('should render AppBanner with trackMetric prop', () => {
    const wrapper = shallow(<AppWrapper trackMetric={trackMetricStub}><div className="child" /></AppWrapper>);
    const appBanner = wrapper.find(AppBannerStub);
    expect(appBanner).to.have.lengthOf(1);
    expect(appBanner.prop('trackMetric')).to.equal(trackMetricStub);
  });

  it('should render children passed to it', () => {
    const wrapper = shallow(
      <AppWrapper trackMetric={trackMetricStub}>
        <div className="child1" />
        <div className="child2" />
      </AppWrapper>
    );
    expect(wrapper.contains(<div className="child1" />)).to.be.true;
    expect(wrapper.contains(<div className="child2" />)).to.be.true;
  });
});
