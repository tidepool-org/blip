import React from 'react';
import _ from 'lodash';
import async from 'async';
import sundial from 'sundial';
import { Link } from 'react-router';

import nurseShark from 'tideline/plugins/nurseshark/';
import TidelineData from 'tideline/js/tidelinedata';

import utils from './utils';
import usrMessages from '../userMessages';


export default class Fetcher {
  constructor(component) {
    this.component = component;
  }

  fetchUser() {
    var comp = this.component;

    comp.setState({fetchingUser: true});
    comp.props.route.api.user.get(function(err, user) {
      if (err) {
        comp.setState({fetchingUser: false});
        return comp.actionHandlers.handleApiError(err, usrMessages.ERR_FETCHING_USER, utils.buildExceptionDetails());
      }

      comp.setState({
        user: user,
        termsAccepted : user.termsAccepted,
        fetchingUser: false
      });

      //will show terms if not yet accepted
      comp.renderOverlay = comp.renderTermsOverlay;
    });
  }

  fetchPendingInvites(cb) {
    var comp = this.component;

    comp.setState({fetchingPendingInvites: true});

    comp.props.route.api.invitation.getSent(function(err, invites) {
      if (err) {
        comp.setState({
          fetchingPendingInvites: false
        });

        if (cb) {
          cb(err);
        }

        return comp.actionHandlers.handleApiError(err, usrMessages.ERR_FETCHING_PENDING_INVITES, utils.buildExceptionDetails());
      }

      comp.setState({
        pendingInvites: invites,
        fetchingPendingInvites: false
      });

      if (cb) {
        cb();
      }
    });
  }

  fetchInvites() {
    var comp = this.component;

    comp.setState({fetchingInvites: true});

    comp.props.route.api.invitation.getReceived(function(err, invites) {
      if (err) {

        comp.setState({
          fetchingInvites: false
        });

        return comp.actionHandlers.handleApiError(err, usrMessages.ERR_FETCHING_INVITES, utils.buildExceptionDetails());
      }

      comp.setState({
        invites: invites,
        fetchingInvites: false
      });
    });
  }

  fetchPatients(options) {
    var comp = this.component;

    if(options && !options.hideLoading) {
        comp.setState({fetchingPatients: true});
    }

    comp.props.route.api.patient.getAll(function(err, patients) {
      if (err) {
        comp.setState({fetchingPatients: false});
        return comp.actionHandlers.handleApiError(err, usrMessages.ERR_FETCHING_TEAMS, utils.buildExceptionDetails());
      }

      comp.setState({
        patients: patients,
        fetchingPatients: false
      });
    });
  }

  fetchPatient(patientId, callback) {
    var comp = this.component;

    comp.setState({fetchingPatient: true, patient: null});

    comp.props.route.api.patient.get(patientId, function(err, patient) {
      if (err) {
        if (err.status === 404) {
          comp.props.route.log('Patient not found with id '+patientId);
          var setupMsg = (patientId === comp.state.user.userid) ? usrMessages.ERR_YOUR_ACCOUNT_NOT_CONFIGURED : usrMessages.ERR_ACCOUNT_NOT_CONFIGURED;
          var dataStoreLink = (<Link to="/patients/new" onClick={comp.closeNotification}>{usrMessages.YOUR_ACCOUNT_DATA_SETUP}</Link>);
          return comp.actionHandlers.handleActionableError(err, setupMsg, dataStoreLink);
        }
        // we can't deal with it so just show error handler
        return comp.actionHandlers.handleApiError(err, usrMessages.ERR_FETCHING_PATIENT+patientId, utils.buildExceptionDetails());
      }

      comp.setState({
        patient: patient,
        fetchingPatient: false
      });

      if (typeof callback === 'function') {
        callback(null, patient);
      }
    });
  }

  fetchPatientData(patient) {
    var comp = this.component;

    var patientId = patient.userid;

    comp.setState({fetchingPatientData: true, patientData: null});

    var loadPatientData = function(cb) {
      comp.props.route.api.patientData.get(patientId, cb);
    };

    var loadTeamNotes = function(cb) {
      comp.props.route.api.team.getNotes(patientId, cb);
    };

    function processPatientData(data) {
      if (!(data && data.length >= 0)) {
        return null;
      }

      var mostRecentUpload = _.sortBy(_.where(data, {type: 'upload'}), (d) => Date.parse(d.time) ).reverse()[0];
      var timePrefsForTideline;
      if (!_.isEmpty(mostRecentUpload) && !_.isEmpty(mostRecentUpload.timezone)) {
        try {
          sundial.checkTimezoneName(mostRecentUpload.timezone);
          timePrefsForTideline = {
            timezoneAware: true,
            timezoneName: mostRecentUpload.timezone
          };
        }
        catch(err) {
          comp.props.route.log(err);
          comp.props.route.log('Upload metadata lacking a valid timezone!', mostRecentUpload);
        }
      }
      var queryParams = comp.state.queryParams;
      // if the user has put a timezone in the query params
      // it'll be stored already in the state, and we just keep using it
      if (!_.isEmpty(queryParams.timezone) || _.isEmpty(timePrefsForTideline)) {
        timePrefsForTideline = comp.state.timePrefs;
      }
      // but otherwise we use the timezone from the most recent upload metadata obj
      else {
        comp.setState({
          timePrefs: timePrefsForTideline
        });
        comp.props.route.log('Defaulting to display in timezone of most recent upload at', mostRecentUpload.time, mostRecentUpload.timezone);
      }

      console.time('Nurseshark Total');
      var res = nurseShark.processData(data, comp.state.bgPrefs.bgUnits);
      console.timeEnd('Nurseshark Total');
      console.time('TidelineData Total');
      var tidelineData = new TidelineData(res.processedData, {
        timePrefs: comp.state.timePrefs,
        bgUnits: comp.state.bgPrefs.bgUnits
      });
      console.timeEnd('TidelineData Total');

      window.tidelineData = tidelineData;
      window.downloadProcessedData = function() {
        console.save(res.processedData, 'nurseshark-output.json');
      };
      window.downloadErroredData = function() {
        console.save(res.erroredData, 'errored.json');
      };

      return tidelineData;
    }

    async.parallel({
      patientData: loadPatientData,
      teamNotes: loadTeamNotes
    },
    function(err, results) {
      if (err) {
        comp.setState({fetchingPatientData: false});
        // Patient with id not found, cary on
        if (err.status === 404) {
          comp.props.route.log('No data found for patient '+patientId);
          return;
        }

        return comp.actionHandlers.handleApiError(err, usrMessages.ERR_FETCHING_PATIENT_DATA+patientId, utils.buildExceptionDetails());
      }

      var patientData = results.patientData || [];
      var notes = results.teamNotes || [];

      comp.props.route.log('Patient device data count', patientData.length);
      comp.props.route.log('Team notes count', notes.length);

      var combinedData = patientData.concat(notes);
      window.downloadInputData = function() {
        console.save(combinedData, 'blip-input.json');
      };

      patientData = processPatientData(combinedData);

      // NOTE: intentional use of _.clone instead of _.cloneDeep
      // we only need a shallow clone at the top level of the patientId keys
      // and the _.cloneDeep I had originally would hang the browser for *seconds*
      // when there was actually something in this.state.patientData
      var allPatientsData = _.clone(comp.state.patientData) || {};
      allPatientsData[patientId] = patientData;

      comp.setState({
        bgPrefs: {
          bgClasses: patientData.bgClasses,
          bgUnits: patientData.bgUnits
        },
        patientData: allPatientsData,
        fetchingPatientData: false
      });
    });
  }

  fetchMessageThread(messageId,callback) {
    var comp = this.component;

    comp.props.route.log('fetching messages for ' + messageId);

    comp.setState({fetchingMessageData: true});

    comp.props.route.api.team.getMessageThread(messageId,function(err, thread){
      comp.setState({fetchingMessageData: false});

      if (err) {
        comp.actionHandlers.handleApiError(err, usrMessages.ERR_FETCHING_MESSAGE_DATA+messageId, utils.buildExceptionDetails());
        return callback(null);
      }

      comp.props.route.log('Fetched message thread with '+thread.length+' messages');
      return callback(thread);
    });
  }

  fetchCurrentPatientData() {
    if (!this.component.state.patient) {
      return;
    }

    this.fetchPatientData(this.component.state.patient);
  }
}