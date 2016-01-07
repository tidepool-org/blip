import React from 'react';
import _ from 'lodash';
import sundial from 'sundial';

import utils from './utils';
import usrMessages from '../userMessages';

export default class ActionHandlers {
  constructor(component, fetcher) {
    this.component = component;
    this.fetcher = fetcher;
  }

  handleUpdatePatientData(userid, data) {
    // NOTE: intentional use of _.clone instead of _.cloneDeep
    // we only need a shallow clone at the top level of the patientId keys
    // and the _.cloneDeep I had originally would hang the browser for *seconds*
    // when there was actually something in this.component.state.patientData
    var patientData = _.clone(this.component.state.patientData);
    if (patientData !== null) {
      patientData[userid] = data;
      this.component.setState({
        patientData: patientData
      });
    }
  }

  handlePatientCreationSuccess(patient) {
    this.component.props.route.trackMetric('Created Profile');
    this.component.setState({
      user: _.extend({}, this.component.state.user, {
        profile: _.cloneDeep(patient.profile)
      }),
      patient: patient
    });
    var route = '/patients/' + patient.userid + '/data';
    this.component.props.history.pushState(null, route);
  }

  handleHideWelcomeSetup(options) {
    if (options && options.route) {
      this.component.props.history.pushState(null, options.route);
    }
    this.component.setState({showingWelcomeSetup: false});
  }

  handleAcceptedTerms() {
    var self = this;
    var comp = this.component;
    var acceptedDate = sundial.utcDateString();

    comp.props.route.api.user.acceptTerms({ termsAccepted: acceptedDate }, function(err) {
      if (err) {
        return self.handleApiError(err, usrMessages.ERR_ACCEPTING_TERMS, utils.buildExceptionDetails());
      }
      return comp.setState({ termsAccepted: acceptedDate });
    });

  }

  handleExternalPasswordUpdate() {
    // If the user is logged in, go to their profile to update password
    if (this.component.state.authenticated) {
      // this.renderPage = this.renderProfile;
      // this.setState({page: 'profile'});
      this.component.props.history.pushState(null, 'profile');
    } else {
      // If the user is not logged in, go to the forgot password page
      // this.showRequestPasswordReset();
      this.component.props.history.pushState(null, 'request-password-reset');
    }
  }

  handleApiError(error, message, details) {

    var utcTime = usrMessages.MSG_UTC + new Date().toISOString();

    if (message) {
      this.component.props.route.log(message);
    }
    //send it quick
    this.component.props.route.api.errors.log(utils.stringifyErrorData(error), message, utils.stringifyErrorData(details));

    if (error.status === 401) {
      //Just log them out
      this.component.props.route.log('401 so logged user out');
      this.component.setState({notification: null});
      this.component.props.route.api.user.destroySession();
      this.handleLogoutSuccess();
      return;
    } else {
      var body;

      if(error.status === 500){
        //somethings down, give a bit of time then they can try again
        body = (
          <div>
            <p> {usrMessages.ERR_SERVICE_DOWN} </p>
            <p> {utcTime} </p>
          </div>
        );
      } else if(error.status === 503){
        //offline nothing is going to work
        body = (
          <div>
            <p> {usrMessages.ERR_OFFLINE} </p>
            <p> {utcTime} </p>
          </div>
        );
      } else {

        var originalErrorMessage = [
          message, utils.stringifyErrorData(error)
        ].join(' ');

        body = (
          <div>
            <p>{usrMessages.ERR_GENERIC}</p>
            <p className="notification-body-small">
              <code>{'Original error message: ' + originalErrorMessage}</code>
              <br>{utcTime}</br>
            </p>
          </div>
        );
      }
      this.component.setState({
        notification: {
          type: 'error',
          body: body,
          isDismissable: true
        }
      });
    }
  }

  handleActionableError(error, message, link) {

    var utcTime = usrMessages.MSG_UTC + new Date().toISOString();

    message = message || '';
    //send it quick
    this.component.props.route.api.errors.log(utils.stringifyErrorData(error), message, '');

    var body = (
      <div>
        <p>{message}</p>
        {link}
      </div>
    );

    this.component.setState({
      notification: {
        type: 'alert',
        body: body,
        isDismissable: true
      }
    });
  }

  handleNotAuthorized(){
     this.component.setState({authenticated: false,  verificationEmailSent: false});
     this.component.showEmailVerification();
  }

  handleDismissInvitation(invitation) {
    var self = this;
    var comp = this.component;

    comp.setState({
      showingWelcomeSetup: false,
      invites: _.filter(comp.state.invites, function(e){
        return e.key !== invitation.key;
      })
    });

    comp.props.route.api.invitation.dismiss(invitation.key, invitation.creator.userid, function(err) {
      if(err) {
        comp.setState({
          invites: comp.state.invites.concat(invitation)
        });
       return self.handleApiError(err, usrMessages.ERR_DISMISSING_INVITE, utils.buildExceptionDetails());
      }
    });
  }

  handleAcceptInvitation(invitation) {
    var invites = _.cloneDeep(this.state.invites);
    var self = this;
    var comp = this.component;

    comp.setState({
      showingWelcomeSetup: false,
      invites: _.map(invites, function(invite) {
        if (invite.key === invitation.key) {
          invite.accepting = true;
        }
        return invite;
      })
    });

    comp.props.route.api.invitation.accept(invitation.key, invitation.creator.userid, function(err) {

      var invites = _.cloneDeep(comp.state.invites);
      if (err) {
        comp.setState({
          invites: _.map(invites, function(invite) {
            if (invite.key === invitation.key) {
              invite.accepting = false;
            }
            return invite;
          })
        });
        return self.handleApiError(err, usrMessages.ERR_ACCEPTING_INVITE, utils.buildExceptionDetails());
      }

      comp.setState({
        invites: _.filter(invites, function(e){
          return e.key !== invitation.key;
        }),
        patients: comp.state.patients.concat(invitation.creator)
      });
    });
  }

  handleChangeMemberPermissions(patientId, memberId, permissions, cb) {
    var self = this;
    var comp = this.component;

    comp.props.route.api.access.setMemberPermissions(memberId, permissions, function(err) {
      if(err) {
        cb(err);
        return self.handleApiError(err, usrMessages.ERR_CHANGING_PERMS, utils.buildExceptionDetails());
      }

      self.fetcher.fetchPatient(patientId, cb);
    });
  }

  handleRemovePatient(patientId,cb) {
    var self = this;
    var comp = this.component;

    comp.props.route.api.access.leaveGroup(patientId, function(err) {
      if(err) {

        return self.handleApiError(err, usrMessages.ERR_REMOVING_MEMBER, utils.buildExceptionDetails());

      }

      self.fetcher.fetchPatients();
    });
  }

  handleRemoveMember(patientId, memberId, cb) {
    var self = this;
    var comp = this.component;

    comp.props.route.api.access.removeMember(memberId, function(err) {
      if(err) {
        cb(err);
        return self.handleApiError(err, usrMessages.ERR_REMOVING_MEMBER ,utils.buildExceptionDetails());
      }

      self.fetcher.fetchPatient(patientId, cb);
    });
  }

  handleInviteMember(email, permissions, cb) {
    var self = this;
    var comp = this.component;

    comp.props.route.api.invitation.send(email, permissions, function(err, invitation) {
      if(err) {
        if (cb) {
          cb(err);
        }
        if (err.status === 500) {
          return self.handleApiError(err, usrMessages.ERR_INVITING_MEMBER, utils.buildExceptionDetails());
        }
        return;
      }

      comp.setState({
        pendingInvites: utils.concat(comp.state.pendingInvites || [], invitation)
      });
      if (cb) {
        cb(null, invitation);
      }
      self.fetcher.fetchPendingInvites();
    });
  }

  handleCancelInvite(email, cb) {
    var self = this;
    var comp = this.component;

    comp.props.route.api.invitation.cancel(email, function(err) {
      if(err) {
        if (cb) {
          cb(err);
        }
        return self.handleApiError(err, usrMessages.ERR_CANCELING_INVITE, utils.buildExceptionDetails());
      }

      comp.setState({
        pendingInvites: _.reject(comp.state.pendingInvites, function(i) {
          return i.email === email;
        })
      });
      if (cb) {
        cb();
      }
      self.fetcher.fetchPendingInvites();
    });
  }

  handleCreatePatient(patient, cb) {
    this.component.props.route.api.patient.post(patient, cb);
  }

  handleUpdateUser(formValues) {
    var self = this;
    var previousUser = self.component.state.user;

    var newUser = _.assign(
      {},
      _.omit(previousUser, 'profile'),
      _.omit(formValues, 'profile'),
      {profile: _.assign({}, previousUser.profile, formValues.profile)}
    );

    // Optimistic update
    self.component.setState({user: _.omit(newUser, 'password')});

    var userUpdates = _.cloneDeep(newUser);
    // If username hasn't changed, don't try to update
    // or else backend will respond with "already taken" error
    if (userUpdates.username === previousUser.username) {
      userUpdates = _.omit(userUpdates, 'username', 'emails');
    }

    self.component.props.route.api.user.put(userUpdates, (err, user) => {
      if (err) {
        // Rollback
        self.component.setState({user: previousUser});
        return self.handleApiError(err, usrMessages.ERR_UPDATING_ACCOUNT, utils.buildExceptionDetails());
      }

      user = _.assign(newUser, user);
      self.component.setState({user: user});
      self.component.props.route.trackMetric('Updated Account');
    });
  }

  handleUpdatePatient(patient) {
    var self = this;
    var previousPatient = self.component.state.patient;

    // Optimistic update
    self.component.setState({patient: patient});

    self.component.props.route.api.patient.put(patient, function(err, patient) {
      if (err) {
        // Rollback
        self.component.setState({patient: previousPatient});
        return self.handleApiError(err, usrMessages.ERR_UPDATING_PATIENT, utils.buildExceptionDetails());
      }
      self.component.setState({
        patient: _.assign({}, previousPatient, {profile: patient.profile})
      });
      self.component.props.route.trackMetric('Updated Profile');
    });
  }

  handleLogin(formValues, cb) {
    var user = formValues.user;
    var options = formValues.options;

    this.component.props.route.api.user.login(user, options, cb);
  }

  handleSignup(formValues, cb) {
    var user = formValues;
    this.component.props.route.api.user.signup(user, cb);
  }

  handleFinalizeSignup() {
    var comp = this.component;

    let signupKey = (comp.props.location) ? comp.props.location.signupKey : null;
    

    if(!_.isEmpty(signupKey) && !comp.state.finalizingVerification){
      comp.props.route.api.user.confirmSignUp(signupKey, function(err){
        if(err){
          comp.props.route.log('finalizeSignup err ',err);
        }
        comp.setState({finalizingVerification:true});
      });
    }
    return;
  }

  handleLogout() {
    var comp = this.component;

    if (comp.state.loggingOut) {
      return;
    }

    comp.setState({
      loggingOut: true
    });

    // Need to track this before expiring auth token
    comp.props.route.trackMetric('Logged Out');

    //Log out and wait for process to complete
    comp.props.route.api.user.logout(() => {
      comp.clearUserData();
      comp.props.history.pushState(null, 'login');
    });
  }

  handleLoginSuccess() {
    this.fetcher.fetchUser();
    if( this.component.state.finalizingVerification ){
      this.component.setState({
        showingWelcomeTitle: true,
        showingWelcomeSetup: true
      });
      this.component.props.route.trackMetric('Finalized Signup');
    }
    this.component.setState({
      authenticated: true 
    });
    this.component.redirectToDefaultRoute();
    this.component.props.route.trackMetric('Logged In');
  }

  handleSignupSuccess(user) {
    //once signed up we need to authenicate the email which is done via the email we have sent them
    this.component.setState({
      fetchingUser: false,
      verificationEmailSent: true
    });

    this.component.showEmailVerification();

    this.component.props.route.trackMetric('Signed Up');
  }
}