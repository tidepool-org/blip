
/**
 * Copyright (c) 2014, Tidepool Project
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
 */
import React  from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';

import config from '../../config';
import LoginNav from '../../components/loginnav';
import utils  from '../../core/utils';
import { URL_TERMS_OF_USE, URL_PRIVACY_POLICY } from '../../core/constants';

import * as actions from '../../redux/actions';

const ACCEPT_OF_AGE = <span>
  I am 18 or older and I accept the terms of the <a href={URL_TERMS_OF_USE} target='_blank'>Tidepool Applications Terms of Use</a> and <a href={URL_PRIVACY_POLICY} target='_blank'>Privacy Policy</a>
</span>;

const ACCEPT_ON_BEHALF = <span>
  I agree that my child aged 13 through 17 can use Tidepool Applications and agree that they are also bound to the terms of the <a href={URL_TERMS_OF_USE} target='_blank'>Tidepool Applications Terms of Use</a> and <a href={URL_PRIVACY_POLICY} target='_blank'>Privacy Policy</a>
</span>;

const TERMS_OF_USE_UPDATED = <p>
  The Terms of Use and Privacy Policy have changed since you last used Tidepool.<br/>
  You need to accept the changes to continue.
</p>;

export class Terms extends React.Component {
  static propTypes = {
    ages: React.PropTypes.object.isRequired,
    authenticated: React.PropTypes.bool.isRequired,
    messages: React.PropTypes.object.isRequired,
    onSubmit: React.PropTypes.func.isRequired,
    termsAccepted: React.PropTypes.bool.isRequired,
    acceptedLatestTerms: React.PropTypes.bool.isRequired,
    trackMetric: React.PropTypes.func.isRequired
  };

  static defaultProps = {
    ages: {
      OF_AGE: {value: '>=18', label: ' I am 18 years old or older.'},
      WITH_CONSENT: {value: '13-17', label: ' I am between 13 and 17 years old. You\'ll need to have a parent or guardian agree to the terms on the next screen.' },
      NOT_OF_AGE: {value: '<=12', label: ' I am 12 years old or younger.'}
    },
    messages: {
      ACCEPT_OF_AGE: ACCEPT_OF_AGE,
      ACCEPT_ON_BEHALF:  ACCEPT_ON_BEHALF,
      TERMS_OF_USE_UPDATED: TERMS_OF_USE_UPDATED,
      SORRY_NOT_OF_AGE: 'We are really sorry, but you need to be 13 or older in order to create an account and use Tidepool\'s Applications.',
    }
  };

  constructor(props) {
    super(props);

    function getDefaultState() {
      return {
        agreed: false,
        agreedOnBehalf: false,
        ageSelected: props.ages.OF_AGE.value // default
      }
    }

    this.state = getDefaultState();
    this.getDefaultState = getDefaultState.bind(this);
  }

  renderAgeConsentStep() {
    return (
      <div className='terms-age-radio'>
        <label>
          <input type='radio' name='age'
            key={this.props.ages.OF_AGE.value}
            value={this.props.ages.OF_AGE.value}
            onChange={this.handleAgeChange.bind(this)}
            defaultChecked={true} />
          {this.props.ages.OF_AGE.label}
        </label>
        <label>
          <input type='radio' name='age'
            key={this.props.ages.WITH_CONSENT.value}
            value={this.props.ages.WITH_CONSENT.value}
            onChange={this.handleAgeChange.bind(this)} />
          {this.props.ages.WITH_CONSENT.label}
        </label>
        <label>
          <input type='radio' name='age'
            key={this.props.ages.NOT_OF_AGE.value}
            value={this.props.ages.NOT_OF_AGE.value}
            onChange={this.handleAgeChange.bind(this)} />
          {this.props.ages.NOT_OF_AGE.label}
        </label>
      </div>
    );
  }

  renderTermsUpdated() {
    if (!this.props.termsAccepted) {
      return null;
    }

    return (
      <div className='terms-title'>
        <p>{this.props.messages.TERMS_OF_USE_UPDATED}</p>
      </div>
    );
  }

  getTermsAndPrivacyButtonState() {
    var isDisabled = !this.state.agreed;

    if (this.state.ageSelected === this.props.ages.NOT_OF_AGE.value) {
      isDisabled = true;
    } else if (this.state.ageSelected === this.props.ages.WITH_CONSENT.value) {
      if (this.state.agreed && this.state.agreedOnBehalf) {
        isDisabled = false;
      }
      else {
        isDisabled = true;
      }
    }
    return isDisabled;
  }

  renderForm() {
    var termsUpdated = this.renderTermsUpdated();
    var ageConsent = this.renderAgeConsentStep();
    var agreeConfirmation = this.renderAgreeCheckboxes();
    var continueBtnDisabled = this.getTermsAndPrivacyButtonState();
    var continueBtnClass = (this.state.ageSelected === this.props.ages.NOT_OF_AGE.value)
      ? 'terms-button-hidden' : 'terms-button';

    var termsForm;
    if (this.props.authenticated && !this.props.acceptedLatestTerms) {
      termsForm = (
        <form className='terms-form'>
          {termsUpdated}
          {ageConsent}
          {agreeConfirmation}
          <button
            className={continueBtnClass}
            onClick={this.handleTermsAndPrivacySubmit.bind(this)}
            disabled={continueBtnDisabled}>Continue</button>
        </form>
      );
    }
    return (
      <div>
        {termsForm}
      </div>
    );
  }

  renderAgreeCheckboxes() {
    var onBehalf;
    if (this.state.ageSelected === this.props.ages.WITH_CONSENT.value) {
      onBehalf = (
        <label htmlFor='agreedOnBehalf'>
          <input
            id='agreedOnBehalf'
            type='checkbox'
            className='js-terms-checkbox'
            checked={this.state.agreedOnBehalf}
            onChange={this.handleOnBehalfAgreementChange.bind(this)} />
          {this.props.messages.ACCEPT_ON_BEHALF}
        </label>
      );
    }

    var acceptTerms;
    if (this.state.ageSelected !== this.props.ages.NOT_OF_AGE.value) {
      acceptTerms = (
        <label htmlFor='agreed'>
          <input
            id='agreed'
            type='checkbox'
            className='js-terms-checkbox'
            checked={this.state.agreed}
            onChange={this.handleAgreementChange.bind(this)} />
          {this.props.messages.ACCEPT_OF_AGE}
        </label>
      );
    }

    var sorryMessage;
    if (this.state.ageSelected === this.props.ages.NOT_OF_AGE.value) {
      sorryMessage = (
        <div ref='sorryMsg'>
          <p className='terms-sorry-message'>{this.props.messages.SORRY_NOT_OF_AGE}</p>
        </div>
    );
    }

    return (
      <div className='terms-accept-checkbox'>
        {acceptTerms}
        {onBehalf}
        {sorryMessage}
      </div>
    );
  }

  render() {
    var content = '';
    if (this.props.authenticated && !this.props.acceptedLatestTerms) {
      content = this.renderForm();
    }

    return (
      <div className='terms js-terms'>
        <LoginNav hideLinks={true} trackMetric={this.props.trackMetric} />
        <div className='terms-content terms-box'>
          {content}
        </div>
      </div>
    );

  }

  handleAgeChange(e) {
    this.setState({ageSelected: e.target.value, agreed: false, agreedOnBehalf: false});
  }

  handleAgreementChange() {
    this.setState({agreed: !this.state.agreed});
  }

  handleOnBehalfAgreementChange() {
    this.setState({agreedOnBehalf: !this.state.agreedOnBehalf});
  }

  handleTermsAndPrivacySubmit(e) {
    if (e) {
      e.preventDefault();
    }

    this.props.trackMetric('Agreed To Terms Of Use');
    this.props.onSubmit();
  }
};

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */

export function mapStateToProps(state) {
  var termsAccepted = null;
  var latestTerms = new Date(config.LATEST_TERMS);

  if (state.blip.allUsersMap) {
    if (state.blip.loggedInUserId) {
      termsAccepted = state.blip.allUsersMap[state.blip.loggedInUserId].termsAccepted;
    }
  }

  return {
    authenticated: state.blip.isLoggedIn,
    termsAccepted: !_.isEmpty(termsAccepted),
    acceptedLatestTerms: new Date(latestTerms) < new Date(termsAccepted),
  };
};

let mapDispatchToProps = dispatch => bindActionCreators({
  acceptTerms: actions.async.acceptTerms,
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  var api = ownProps.routes[0].api;
  return Object.assign({}, stateProps, {
    onSubmit: dispatchProps.acceptTerms.bind(null, api),
    trackMetric: ownProps.routes[0].trackMetric
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Terms);
