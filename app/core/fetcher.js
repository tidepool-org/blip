import async from 'async';

import utils from './utils';
import usrMessages from '../userMessages';


export default class Fetcher {
  constructor(component) {
    this.component = component;
  }

  fetchUser() {
    var self = this.component;

    self.setState({fetchingUser: true});

    self.props.route.api.user.get(function(err, user) {
      if (err) {
        self.setState({fetchingUser: false});
        return self.handleApiError(err, usrMessages.ERR_FETCHING_USER, utils.buildExceptionDetails());
      }

      self.setState({
        user: user,
        termsAccepted : user.termsAccepted,
        fetchingUser: false
      });

      //will show terms if not yet accepted
      self.renderOverlay = self.renderTermsOverlay;

    });
  }

  fetchPendingInvites(cb) {
    var self = this.component;

    self.setState({fetchingPendingInvites: true});

    self.props.route.api.invitation.getSent(function(err, invites) {
      if (err) {
        self.setState({
          fetchingPendingInvites: false
        });

        if (cb) {
          cb(err);
        }

        return self.handleApiError(err, usrMessages.ERR_FETCHING_PENDING_INVITES, utils.buildExceptionDetails());
      }

      self.setState({
        pendingInvites: invites,
        fetchingPendingInvites: false
      });

      if (cb) {
        cb();
      }
    });
  }

  fetchInvites() {
    var self = this.component;

    self.setState({fetchingInvites: true});

    self.props.route.api.invitation.getReceived(function(err, invites) {
      if (err) {

        self.setState({
          fetchingInvites: false
        });

        return self.handleApiError(err, usrMessages.ERR_FETCHING_INVITES, utils.buildExceptionDetails());
      }

      self.setState({
        invites: invites,
        fetchingInvites: false
      });
    });
  }

  fetchPatients(options) {
    var self = this.component;

    if(options && !options.hideLoading) {
        self.setState({fetchingPatients: true});
    }

    self.props.route.api.patient.getAll(function(err, patients) {
      if (err) {
        self.setState({fetchingPatients: false});
        return self.handleApiError(err, usrMessages.ERR_FETCHING_TEAMS, utils.buildExceptionDetails());
      }

      self.setState({
        patients: patients,
        fetchingPatients: false
      });
    });
  }

  fetchPatient(patientId, callback) {
    var self = this.component;

    self.setState({fetchingPatient: true});

    self.props.route.api.patient.get(patientId, function(err, patient) {
      if (err) {
        if (err.status === 404) {
          self.props.route.log('Patient not found with id '+patientId);
          var setupMsg = (patientId === self.state.user.userid) ? usrMessages.ERR_YOUR_ACCOUNT_NOT_CONFIGURED : usrMessages.ERR_ACCOUNT_NOT_CONFIGURED;
          var dataStoreLink = (<a href="#/patients/new" onClick={self.closeNotification}>{usrMessages.YOUR_ACCOUNT_DATA_SETUP}</a>);
          return self.handleActionableError(err, setupMsg, dataStoreLink);
        }
        // we can't deal with it so just show error handler
        return self.handleApiError(err, usrMessages.ERR_FETCHING_PATIENT+patientId, utils.buildExceptionDetails());
      }

      self.setState({
        patient: patient,
        fetchingPatient: false
      });

      if (typeof callback === 'function') {
        callback(null, patient);
      }
    });
  }

  fetchPatientData(patient) {
    var self = this.component;

    var patientId = patient.userid;

    self.setState({fetchingPatientData: true});

    var loadPatientData = function(cb) {
      self.props.route.api.patientData.get(patientId, cb);
    };

    var loadTeamNotes = function(cb) {
      self.props.route.api.team.getNotes(patientId, cb);
    };

    async.parallel({
      patientData: loadPatientData,
      teamNotes: loadTeamNotes
    },
    function(err, results) {
      if (err) {
        self.setState({fetchingPatientData: false});
        // Patient with id not found, cary on
        if (err.status === 404) {
          self.props.route.log('No data found for patient '+patientId);
          return;
        }

        return self.handleApiError(err, usrMessages.ERR_FETCHING_PATIENT_DATA+patientId, utils.buildExceptionDetails());
      }

      var patientData = results.patientData || [];
      var notes = results.teamNotes || [];

      self.props.route.log('Patient device data count', patientData.length);
      self.props.route.log('Team notes count', notes.length);

      var combinedData = patientData.concat(notes);
      window.downloadInputData = function() {
        console.save(combinedData, 'blip-input.json');
      };
      patientData = self.processPatientData(combinedData);

      // NOTE: intentional use of _.clone instead of _.cloneDeep
      // we only need a shallow clone at the top level of the patientId keys
      // and the _.cloneDeep I had originally would hang the browser for *seconds*
      // when there was actually something in this.state.patientData
      var allPatientsData = _.clone(self.state.patientData) || {};
      allPatientsData[patientId] = patientData;

      self.setState({
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
    var self = this;

    self.props.route.log('fetching messages for ' + messageId);

    self.setState({fetchingMessageData: true});

    self.props.route.api.team.getMessageThread(messageId,function(err, thread){
      self.setState({fetchingMessageData: false});

      if (err) {
        self.handleApiError(err, usrMessages.ERR_FETCHING_MESSAGE_DATA+messageId, utils.buildExceptionDetails());
        return callback(null);
      }

      self.props.route.log('Fetched message thread with '+thread.length+' messages');
      return callback(thread);
    });
  }

  fetchCurrentPatientData() {
    if (!this.component.state.patient) {
      return;
    }

    this.fetchPatientData(patient);
  }
}