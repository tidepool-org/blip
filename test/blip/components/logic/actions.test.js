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

/* global sinon */

var chai = require('chai');
var expect = chai.expect;
var _ = require('lodash');

var basicsActions = require('../../../../plugins/blip/basics/logic/actions');
var constants = require('../../../../plugins/blip/basics/logic/constants');
var togglableState = require('../../../../plugins/blip/basics/TogglableState');

describe('actions', function() {
  var app = {
    state: {
      sections: {
        'tst': { id: 'tst section', togglable: togglableState.closed },
        'tst2': { id: 'tst2 section', togglable: togglableState.open },
        'siteChanges': {
          id: 'siteChanges',
          togglable: togglableState.off,
          settingsTogglable: togglableState.closed,
          selectorOptions: {
            primary: { key: constants.SITE_CHANGE_RESERVOIR, label: 'Reservoir Change' },
            rows: [
              [
                { key: constants.SITE_CHANGE_TUBING, label: 'Tube Primes' },
                { key: constants.SITE_CHANGE_CANNULA, label: 'Cannula Fills' },
              ],
            ],
          },
          selectorMetaData: {
            canUpdateSettings: true,
          },
        },
        'fingersticks': {
          id: 'fingersticks',
          togglable: togglableState.off,
          selectorOptions: {
            primary: { key: 'total', label: 'Total' },
            rows: [
              [
                { key: 'calibrations', label: 'Calibrations' },
              ],
            ],
          },
        },
        'siteChangesOpen': { id: 'siteChangesOpen', togglable: togglableState.off, settingsTogglable: togglableState.open },
      },
    },
    setState: sinon.stub(),
    props: {
      patient: {
        userid: 1,
        profile: {
          fullName: 'Test Patient',
          patient: {
            about: 'Testing Patient Update',
            birthday: '2000-01-01',
            diagnosisDate: '2010-01-01',
          },
        },
        settings: {
          previousSetting: true,
        },
      },
    },
  };

  beforeEach(function() {
    basicsActions.bindApp(app);
  });

  describe('toggleSection', function() {
    it('should track opened metric', function() {
      var trackMetric = sinon.stub();
      expect(trackMetric.callCount).to.equal(0);
      basicsActions.toggleSection('tst', trackMetric);
      expect(trackMetric.callCount).to.equal(1);
      expect(trackMetric.calledWith('tst section was opened')).to.be.true;
    });
    it('should track closed metric', function() {
      var trackMetric = sinon.stub();
      expect(trackMetric.callCount).to.equal(0);
      basicsActions.toggleSection('tst2', trackMetric);
      expect(trackMetric.callCount).to.equal(1);
      expect(trackMetric.calledWith('tst2 section was closed')).to.be.true;
    });
  });

  describe('toggleSectionSettings', function() {
    it('should track opened metric', function() {
      var trackMetric = sinon.stub();
      expect(trackMetric.callCount).to.equal(0);
      basicsActions.toggleSectionSettings('siteChanges', trackMetric);
      expect(trackMetric.callCount).to.equal(1);
      expect(trackMetric.calledWith('siteChanges settings was opened')).to.be.true;
    });
    it('should track closed metric', function() {
      var trackMetric = sinon.stub();
      expect(trackMetric.callCount).to.equal(0);
      basicsActions.toggleSectionSettings('siteChangesOpen', trackMetric);
      expect(trackMetric.callCount).to.equal(1);
      expect(trackMetric.calledWith('siteChangesOpen settings was closed')).to.be.true;
    });
  });

  describe('selectSubtotal', function() {
    it('should track filtered metric if metrics function is provided', function() {
      var trackMetric = sinon.stub();
      expect(trackMetric.callCount).to.equal(0);
      basicsActions.selectSubtotal('fingersticks', 'calibrations', trackMetric);
      expect(trackMetric.callCount).to.equal(1);
      expect(trackMetric.calledWith('filtered on calibrations')).to.be.true;
    });
  });

  describe('setSiteChangeEvent', function() {
    it('should track metric for a user setting the source', function() {
      var trackMetric = sinon.stub();
      var updateBasicsSettings = sinon.stub();
      expect(trackMetric.callCount).to.equal(0);
      basicsActions.setSiteChangeEvent('siteChanges', constants.SITE_CHANGE_CANNULA, 'Cannula Prime', trackMetric, updateBasicsSettings);
      expect(trackMetric.callCount).to.equal(1);
      expect(trackMetric.calledWith('Selected Cannula Prime', { initiatedBy: 'User' })).to.be.true;
    });
    it('should track metric for a care team member setting the initiatedBy', function() {
      var careTeamApp = _.cloneDeep(app);
      careTeamApp.state.sections.siteChanges.selectorMetaData.canUpdateSettings = false;
      basicsActions.bindApp(careTeamApp);
      var trackMetric = sinon.stub();
      var updateBasicsSettings = sinon.stub();
      expect(trackMetric.callCount).to.equal(0);
      basicsActions.setSiteChangeEvent('siteChanges', constants.SITE_CHANGE_TUBING, 'Tubing Prime', trackMetric, updateBasicsSettings);
      expect(trackMetric.callCount).to.equal(1);
      expect(trackMetric.calledWith('Selected Tubing Prime', { initiatedBy: 'Care Team' })).to.be.true;
    });
    it('should call updateBasicsSettings function', function() {
      var trackMetric = sinon.stub();
      var updateBasicsSettings = sinon.stub();
      var canUpdateSettings = app.state.sections.siteChanges.selectorMetaData.canUpdateSettings;
      expect(updateBasicsSettings.callCount).to.equal(0);
      basicsActions.setSiteChangeEvent('siteChanges', constants.SITE_CHANGE_CANNULA, 'Cannula Prime', trackMetric, updateBasicsSettings);

      expect(canUpdateSettings).to.be.true;

      expect(updateBasicsSettings.callCount).to.equal(1);
      expect(updateBasicsSettings.calledWithExactly(
        app.props.patient.userid,
        {
          previousSetting: true,
          siteChangeSource: constants.SITE_CHANGE_CANNULA,
        },
        canUpdateSettings
      )).to.be.true;
    });
  });
});
