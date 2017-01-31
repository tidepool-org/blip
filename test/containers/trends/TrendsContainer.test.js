/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

import _ from 'lodash';
import Chance from 'chance';
const chance = new Chance();
import { range } from 'd3-array';
import moment from 'moment-timezone';
import React from 'react';

import { mount } from 'enzyme';

import { MGDL_UNITS, MMOLL_UNITS } from '../../../src/utils/constants';
import { timezoneAwareCeiling } from '../../../src/utils/datetime';
import DummyComponent from '../../helpers/DummyComponent';

import { TrendsContainer, mapStateToProps, mapDispatchToProps }
  from '../../../src/containers/trends/TrendsContainer';
import TrendsSVGContainer from '../../../src/containers/trends/TrendsSVGContainer';

describe('TrendsContainer', () => {
  // stubbing console.warn gets rid of the annoying warnings from react-dimensions
  // due to not rendering TrendsContainer within a real app like blip
  // eslint-disable-next-line no-console
  console.warn = sinon.stub();

  describe('TrendsContainer (w/o redux connect()ion)', () => {
    let minimalData;
    let enoughCbgData;

    let minimalDataMmol;
    let enoughCbgDataMmol;

    const extentSize = 7;
    const timezone = 'US/Pacific';

    const justOneDatum = sinon.stub().returns([{
      id: chance.hash({ length: 6 }),
      msPer24: chance.integer({ min: 0, max: 864e5 }),
      value: 100,
    }]);
    const lowestBg = 25;
    const sevenDaysData = sinon.stub().returns(
      _.map(range(0, 288 * extentSize), () => ({
        id: chance.hash({ length: 6 }),
        msPer24: chance.integer({ min: 0, max: 864e5 }),
        value: chance.pickone([lowestBg, 525]),
      }))
    );

    const justOneDatumMmol = sinon.stub().returns([{
      id: chance.hash({ length: 6 }),
      msPer24: chance.integer({ min: 0, max: 864e5 }),
      value: 5.2,
    }]);
    const lowestBgMmol = 3.1;
    const sevenDaysDataMmol = sinon.stub().returns(
      _.map(range(0, 288 * extentSize), () => ({
        id: chance.hash({ length: 6 }),
        msPer24: chance.integer({ min: 0, max: 864e5 }),
        value: chance.pickone([lowestBgMmol, 28.4]),
      }))
    );

    function makeDataStubs(topStub) {
      const byDate = {
        filter: () => {},
        filterAll: sinon.stub().returnsThis(),
        top: (...args) => topStub(...args),
      };
      const byDayOfWeek = {
        filterAll: sinon.stub().returnsThis(),
        filterFunction: () => {},
        top: (...args) => topStub(...args),
      };
      return {
        cbgByDate: _.assign({}, byDate),
        cbgByDayOfWeek: _.assign({}, byDayOfWeek),
        smbgByDate: _.assign({}, byDate),
        smbgByDayOfWeek: _.assign({}, byDayOfWeek),
      };
    }

    const onDatetimeLocationChange = sinon.spy();
    const onSwitchBgDataSource = sinon.spy();
    const markTrendsViewed = sinon.spy();

    const props = {
      activeDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      },
      currentPatientInViewId: 'a1b2c3',
      extentSize,
      showingSmbg: false,
      showingCbg: true,
      smbgRangeOverlay: true,
      smbgGrouped: true,
      smbgLines: false,
      smbgTrendsComponent: DummyComponent,
      timePrefs: {
        timezoneAware: false,
        timezoneName: timezone,
      },
      yScaleClampTop: {
        [MGDL_UNITS]: 300,
        [MMOLL_UNITS]: 25,
      },
      onDatetimeLocationChange,
      onSelectDate: sinon.stub(),
      onSwitchBgDataSource,
      trendsState: {
        touched: false,
        cbgFlags: {
          cbg50Enabled: true,
          cbg80Enabled: true,
          cbg100Enabled: true,
          cbgMedianEnabled: true,
        },
      },
      focusTrendsSmbg: sinon.stub(),
      markTrendsViewed,
      unfocusTrendsSmbg: sinon.stub(),
    };

    const mgdl = {
      bgUnits: MGDL_UNITS,
      bgBounds: {
        veryHighThreshold: 300,
        targetUpperBound: 180,
        targetLowerBound: 80,
        veryLowThreshold: 60,
      },
    };
    const mmoll = {
      bgUnits: MMOLL_UNITS,
      bgBounds: {
        veryHighThreshold: 30,
        targetUpperBound: 10,
        targetLowerBound: 4.4,
        veryLowThreshold: 3.5,
      },
    };

    before(() => {
      minimalData = mount(
        <TrendsContainer {...props} {...mgdl} {...makeDataStubs(justOneDatum)} />
      );
    });

    afterEach(() => {
      onDatetimeLocationChange.reset();
      onSwitchBgDataSource.reset();
      markTrendsViewed.reset();
    });

    describe('componentWillMount', () => {
      let withInitialDatetimeLocation;

      before(() => {
        withInitialDatetimeLocation = mount(
          <TrendsContainer
            {...props}
            {...mgdl}
            {...makeDataStubs(justOneDatum)}
            initialDatetimeLocation="2016-03-15T19:00:00.000Z"
          />
        );
      });

      it('should set dateDomain based on current datetime if no initialDatetimeLocation', () => {
        const ceil = timezoneAwareCeiling(new Date().valueOf(), 'UTC').toISOString();
        const { dateDomain } = minimalData.state();
        expect(dateDomain.end).to.equal(ceil);
      });

      it('should set dateDomain based on initialDatetimeLocation if provided', () => {
        const { dateDomain } = withInitialDatetimeLocation.state();
        expect(dateDomain.end).to.equal('2016-03-16T00:00:00.000Z');
      });

      it('should set dateDomain.start based on initialDatetimeLocation and extentSize', () => {
        const { dateDomain } = withInitialDatetimeLocation.state();
        expect(dateDomain.start).to.equal('2016-03-09T00:00:00.000Z');
      });

      it('should mark trends viewed as `touched` if not already touched', () => {
        expect(markTrendsViewed.callCount).to.equal(0);
        mount(
          <TrendsContainer
            {...props}
            {...mgdl}
            {...makeDataStubs(justOneDatum)}
          />
        );
        expect(markTrendsViewed.callCount).to.equal(1);
      });

      it('should not mark trends view `touched` if already touched', () => {
        expect(markTrendsViewed.callCount).to.equal(0);
        mount(
          <TrendsContainer
            {..._.merge({}, props, { trendsState: { touched: true } })}
            {...mgdl}
            {...makeDataStubs(justOneDatum)}
          />
        );
        expect(markTrendsViewed.callCount).to.equal(0);
      });

      it('should toggle BG data source if not enough cbg data', () => {
        expect(onSwitchBgDataSource.callCount).to.equal(0);
        mount(
          <TrendsContainer
            {...props}
            {...mgdl}
            {...makeDataStubs(justOneDatum)}
          />
        );
        expect(onSwitchBgDataSource.callCount).to.equal(1);
      });

      it('should not toggle BG data source if enough cbg data', () => {
        expect(onSwitchBgDataSource.callCount).to.equal(0);
        mount(
          <TrendsContainer
            {...props}
            {...mgdl}
            {...makeDataStubs(sevenDaysData)}
          />
        );
        expect(onSwitchBgDataSource.callCount).to.equal(0);
      });

      it('should not toggle BG data source even if not enough cbg data if `touched`', () => {
        expect(onSwitchBgDataSource.callCount).to.equal(0);
        mount(
          <TrendsContainer
            {..._.merge({}, props, { trendsState: { touched: true } })}
            {...mgdl}
            {...makeDataStubs(justOneDatum)}
          />
        );
        expect(onSwitchBgDataSource.callCount).to.equal(0);
      });
    });

    describe('componentWillReceiveProps', () => {
      it('should perform data refiltering if `activeDays` changes', () => {
        const byDateSpy = sinon.spy(minimalData.props().smbgByDate, 'top');
        const instance = minimalData.instance();
        const refilterSpy = sinon.spy(instance, 'refilterByDayOfWeek');
        const stateSpy = sinon.spy(instance, 'setState');
        expect(refilterSpy.callCount).to.equal(0);
        expect(stateSpy.callCount).to.equal(0);
        minimalData.setProps({
          activeDays: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true,
            sunday: true,
          },
        });
        expect(refilterSpy.callCount).to.equal(2);
        expect(stateSpy.callCount).to.equal(1);
        expect(byDateSpy.callCount).to.equal(1);
        instance.refilterByDayOfWeek.restore();
        instance.setState.restore();
      });

      it('should not perform data refiltering if `activeDays` does not change', () => {
        const instance = minimalData.instance();
        const spy = sinon.spy(instance, 'refilterByDayOfWeek');
        const stateSpy = sinon.spy(instance, 'setState');
        expect(spy.callCount).to.equal(0);
        expect(stateSpy.callCount).to.equal(0);
        minimalData.setProps({
          smbgRangeOverlay: false,
        });
        expect(spy.callCount).to.equal(0);
        expect(stateSpy.callCount).to.equal(0);
        instance.refilterByDayOfWeek.restore();
        instance.setState.restore();
      });
    });

    describe('yScale', () => {
      describe('mg/dL blood glucose units', () => {
        before(() => {
          enoughCbgData = mount(
            <TrendsContainer {...props} {...mgdl} {...makeDataStubs(sevenDaysData)} />
          );
        });

        it('should have `clamp` set to true', () => {
          const { yScale } = minimalData.state();
          expect(yScale.clamp()).to.be.true;
        });

        it('should have a minimum yScale domain: [targetLowerBound, yScaleClampTop]', () => {
          const { yScale } = minimalData.state();
          expect(yScale.domain())
            .to.deep.equal([mgdl.bgBounds.targetLowerBound, props.yScaleClampTop[MGDL_UNITS]]);
        });

        it('should have a maximum yScale domain: [lowest generated value, yScaleClampTop]', () => {
          const { yScale } = enoughCbgData.state();
          expect(yScale.domain())
            .to.deep.equal([lowestBg, props.yScaleClampTop[MGDL_UNITS]]);
        });
      });

      describe('mmol/L blood glucose units', () => {
        before(() => {
          enoughCbgDataMmol = mount(
            <TrendsContainer {...props} {...mmoll} {...makeDataStubs(sevenDaysDataMmol)} />
          );
          minimalDataMmol = mount(
            <TrendsContainer {...props} {...mmoll} {...makeDataStubs(justOneDatumMmol)} />
          );
        });

        it('should have `clamp` set to true', () => {
          const { yScale } = minimalDataMmol.state();
          expect(yScale.clamp()).to.be.true;
        });

        it('should have a minimum yScale domain: [targetLowerBound, yScaleClampTop]', () => {
          const { yScale } = minimalDataMmol.state();
          expect(yScale.domain())
            .to.deep.equal([mmoll.bgBounds.targetLowerBound, props.yScaleClampTop[MMOLL_UNITS]]);
        });

        it('should have a maximum yScale domain: [lowest generated value, yScaleClampTop]', () => {
          const { yScale } = enoughCbgDataMmol.state();
          expect(yScale.domain())
            .to.deep.equal([lowestBgMmol, props.yScaleClampTop[MMOLL_UNITS]]);
        });
      });
    });

    // NB: these exposed component functions are a compatibility interface layer
    // with the <Modal /> component in blip, so it's actually useful and
    // important to just validate through tests that the functions exist!
    describe('exposed component functions (called by parent <Modal /> in blip)', () => {
      describe('getCurrentDay', () => {
        let withInitialDatetimeLocation;

        before(() => {
          withInitialDatetimeLocation = mount(
            <TrendsContainer
              {...props}
              {...mgdl}
              {...makeDataStubs(justOneDatum)}
              initialDatetimeLocation="2016-03-15T19:00:00.000Z"
            />
          );
        });

        it('should exist and be a function', () => {
          assert.isFunction(minimalData.instance().getCurrentDay);
        });

        it('should return local noon prior to now if no initialDatetimeLocation', () => {
          const instance = minimalData.instance();
          const expectedRes = moment.utc()
            .startOf('day')
            .hours(12)
            .toISOString();
          expect(instance.getCurrentDay()).to.equal(expectedRes);
        });

        it('should return local noon prior to initialDatetimeLocation', () => {
          const instance = withInitialDatetimeLocation.instance();
          expect(instance.getCurrentDay())
            .to.equal('2016-03-15T12:00:00.000Z');
        });
      });

      describe('for navigation along time dimension', () => {
        // prior to this we used fixtures with timezoneAware: false for simplicity
        // now we set it to true to test proper time navigation with DST
        before(() => {
          minimalData.setProps({
            timePrefs: {
              timezoneAware: true,
              timezoneName: timezone,
            },
          });
        });

        describe('setExtent', () => {
          it('should exist and be a function', () => {
            assert.isFunction(minimalData.instance().setExtent);
          });

          it('should call refilterByDate for cbg and smbg, then setState', () => {
            const instance = minimalData.instance();
            const refilterSpy = sinon.spy(instance, 'refilterByDate');
            const stateSpy = sinon.spy(instance, 'setState');
            expect(refilterSpy.callCount).to.equal(0);
            expect(stateSpy.callCount).to.equal(0);
            const domain = ['2016-03-15T07:00:00.000Z', '2016-03-22T07:00:00.000Z'];
            instance.setExtent(domain);
            expect(refilterSpy.callCount).to.equal(2);
            expect(refilterSpy.args[0][1]).to.deep.equal(domain);
            expect(refilterSpy.args[1][1]).to.deep.equal(domain);
            expect(stateSpy.callCount).to.equal(1);
            const { dateDomain: newDomain } = minimalData.state();
            expect(newDomain.start).to.equal(domain[0]);
            expect(newDomain.end).to.equal(domain[1]);
            instance.refilterByDate.restore();
            instance.setState.restore();
          });
        });

        describe('goBack', () => {
          it('should exist and be a function', () => {
            assert.isFunction(minimalData.instance().goBack);
          });

          it('should call setExtent and onDatetimeLocationChange', () => {
            const instance = minimalData.instance();
            const setExtentSpy = sinon.spy(instance, 'setExtent');

            expect(setExtentSpy.callCount).to.equal(0);
            expect(onDatetimeLocationChange.callCount).to.equal(0);

            instance.goBack();

            expect(setExtentSpy.callCount).to.equal(1);
            expect(onDatetimeLocationChange.callCount).to.equal(1);
            // 2nd arg is Boolean indicating whether atMostRecent
            expect(onDatetimeLocationChange.args[0][1]).to.be.false;

            const { dateDomain: newDomain } = minimalData.state();

            expect(newDomain.start).to.equal('2016-03-08T08:00:00.000Z');
            expect(newDomain.end).to.equal('2016-03-15T07:00:00.000Z');

            instance.setExtent.restore();
          });
        });

        describe('goForward', () => {
          it('should exist and be a function', () => {
            assert.isFunction(minimalData.instance().goForward);
          });

          it('should call setExtent & onDatetimeLocationChange', () => {
            const instance = minimalData.instance();
            const setExtentSpy = sinon.spy(instance, 'setExtent');

            const expectedDomain = [
              '2016-03-15T07:00:00.000Z',
              '2016-03-22T07:00:00.000Z',
            ];

            expect(setExtentSpy.callCount).to.equal(0);
            expect(onDatetimeLocationChange.callCount).to.equal(0);

            instance.goForward();

            expect(setExtentSpy.callCount).to.equal(1);
            expect(onDatetimeLocationChange.callCount).to.equal(1);
            expect(onDatetimeLocationChange.args[0][0]).to.deep.equal(expectedDomain);
            // 2nd arg is Boolean indicating whether atMostRecent
            expect(onDatetimeLocationChange.args[0][1]).to.be.false;

            const { dateDomain: newDomain } = minimalData.state();

            expect(newDomain.start).to.equal(expectedDomain[0]);
            expect(newDomain.end).to.equal(expectedDomain[1]);

            instance.setExtent.restore();
          });

          it('should call onDatetimeLocationChange w/2nd arg true when domain > mostRecent', () => {
            minimalData.setState({ mostRecent: '2016-03-29T06:59:59.999Z' });
            const instance = minimalData.instance();

            expect(onDatetimeLocationChange.callCount).to.equal(0);

            instance.goForward();

            expect(onDatetimeLocationChange.callCount).to.equal(1);
            // 2nd arg is Boolean indicating whether atMostRecent
            expect(onDatetimeLocationChange.args[0][1]).to.be.true;
          });
        });

        describe('goToMostRecent', () => {
          it('should exist and be a function', () => {
            assert.isFunction(minimalData.instance().goToMostRecent);
          });

          it('should call setExtent and onDatetimeLocationChange', () => {
            const instance = minimalData.instance();
            const setExtentSpy = sinon.spy(instance, 'setExtent');

            expect(setExtentSpy.callCount).to.equal(0);
            expect(onDatetimeLocationChange.callCount).to.equal(0);

            instance.goToMostRecent();

            expect(setExtentSpy.callCount).to.equal(1);
            expect(onDatetimeLocationChange.callCount).to.equal(1);
            // 2nd arg is Boolean indicating whether atMostRecent
            expect(onDatetimeLocationChange.args[0][1]).to.be.true;

            const { dateDomain: newDomain, mostRecent } = minimalData.state();
            expect(newDomain.end).to.equal(mostRecent);

            instance.setExtent.restore();
          });
        });
      });
    });

    describe('render', () => {
      it('should render `TrendsSVGContainer`', () => {
        const wrapper = mount(
          <TrendsContainer {...props} {...mgdl} {...makeDataStubs(justOneDatum)} />
        );
        expect(wrapper.find(TrendsSVGContainer)).to.have.length(1);
      });
    });
  });

  describe('mapStateToProps', () => {
    const userId = 'a1b2c3';
    const state = {
      viz: {
        trends: {
          [userId]: {
            oneOption: true,
            otherOption: false,
          },
        },
      },
    };

    it('should map state.viz.trends[currentPatientInViewId] to `trendsState`', () => {
      expect(mapStateToProps(state, { currentPatientInViewId: userId }).trendsState)
        .to.deep.equal(state.viz.trends[userId]);
    });
  });

  describe('mapDispatchToProps', () => {
    const ownProps = { currentPatientInViewId: 'a1b2c3' };

    it('should return an object with a `focusTrendsSmbg` key', () => {
      expect(mapDispatchToProps(sinon.stub(), ownProps)).to.have.property('focusTrendsSmbg');
    });

    it('should return an object with a `markTrendsViewed` key', () => {
      expect(mapDispatchToProps(sinon.stub(), ownProps)).to.have.property('markTrendsViewed');
    });

    it('should return an object with a `unfocusTrendsSmbg` key', () => {
      expect(mapDispatchToProps(sinon.stub(), ownProps)).to.have.property('unfocusTrendsSmbg');
    });
  });
});
