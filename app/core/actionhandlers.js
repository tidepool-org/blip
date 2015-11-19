import _ from 'lodash';

import utils from './utils';

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
    if (patientData != null) {
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

  handleLogoutSuccess() {
    this.clearUserData();
    this.component.props.history.pushState(null, 'login');
  }

  handleHideWelcomeSetup(options) {
    if (options && options.route) {
      this.component.props.history.pushState(null, options.route);
    }
    this.component.setState({showingWelcomeSetup: false});
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

  handleAcceptedTerms() {
    var self = this.component;
    var acceptedDate = sundial.utcDateString();

    self.props.route.api.user.acceptTerms({ termsAccepted: acceptedDate }, function(err) {
      if (err) {
        return self.handleApiError(err, usrMessages.ERR_ACCEPTING_TERMS, utils.buildExceptionDetails());
      }
      return self.setState({ termsAccepted: acceptedDate });
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
    var self = this.component;

    self.setState({
      showingWelcomeSetup: false,
      invites: _.filter(self.state.invites, function(e){
        return e.key !== invitation.key;
      })
    });

    self.props.route.api.invitation.dismiss(invitation.key, invitation.creator.userid, function(err) {
      if(err) {
        self.setState({
          invites: self.state.invites.concat(invitation)
        });
       return this.handleApiError(err, usrMessages.ERR_DISMISSING_INVITE, utils.buildExceptionDetails());
      }
    });
  }

  handleAcceptInvitation(invitation) {
    var invites = _.cloneDeep(this.state.invites);
    var self = this;

    self.setState({
      showingWelcomeSetup: false,
      invites: _.map(invites, function(invite) {
        if (invite.key === invitation.key) {
          invite.accepting = true;
        }
        return invite;
      })
    });

    self.props.route.api.invitation.accept(invitation.key, invitation.creator.userid, function(err) {

      var invites = _.cloneDeep(self.state.invites);
      if (err) {
        self.setState({
          invites: _.map(invites, function(invite) {
            if (invite.key === invitation.key) {
              invite.accepting = false;
            }
            return invite;
          })
        });
        return this.handleApiError(err, usrMessages.ERR_ACCEPTING_INVITE, utils.buildExceptionDetails());
      }

      self.setState({
        invites: _.filter(invites, function(e){
          return e.key !== invitation.key;
        }),
        patients: self.state.patients.concat(invitation.creator)
      });
    });
  }

  handleChangeMemberPermissions(patientId, memberId, permissions, cb) {
    var self = this.component;

    self.props.route.api.access.setMemberPermissions(memberId, permissions, function(err) {
      if(err) {
        cb(err);
        return this.handleApiError(err, usrMessages.ERR_CHANGING_PERMS, utils.buildExceptionDetails());
      }

      this.fetcher.fetchPatient(patientId, cb);
    });
  }

  handleRemovePatient(patientId,cb) {
    var self = this.component;

    self.props.route.api.access.leaveGroup(patientId, function(err) {
      if(err) {

        return this.handleApiError(err, usrMessages.ERR_REMOVING_MEMBER, utils.buildExceptionDetails());

      }

      this.fetcher.fetchPatients();
    });
  }

  handleRemoveMember(patientId, memberId, cb) {
    var self = this.component;

    self.props.route.api.access.removeMember(memberId, function(err) {
      if(err) {
        cb(err);
        return this.handleApiError(err, usrMessages.ERR_REMOVING_MEMBER ,utils.buildExceptionDetails());
      }

      this.fetcher.fetchPatient(patientId, cb);
    });
  }

  handleInviteMember(email, permissions, cb) {
    var self = this.component;

    self.props.route.api.invitation.send(email, permissions, function(err, invitation) {
      if(err) {
        if (cb) {
          cb(err);
        }
        if (err.status === 500) {
          return this.handleApiError(err, usrMessages.ERR_INVITING_MEMBER, utils.buildExceptionDetails());
        }
        return;
      }

      self.setState({
        pendingInvites: utils.concat(self.state.pendingInvites || [], invitation)
      });
      if (cb) {
        cb(null, invitation);
      }
      this.fetcher.fetchPendingInvites();
    });
  }

  handleCancelInvite(email, cb) {
    var self = this.component;

    self.props.route.api.invitation.cancel(email, function(err) {
      if(err) {
        if (cb) {
          cb(err);
        }
        return this.handleApiError(err, usrMessages.ERR_CANCELING_INVITE, utils.buildExceptionDetails());
      }

      self.setState({
        pendingInvites: _.reject(self.state.pendingInvites, function(i) {
          return i.email === email;
        })
      });
      if (cb) {
        cb();
      }
      this.fetcher.fetchPendingInvites();
    });
  }
}