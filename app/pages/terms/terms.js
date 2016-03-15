
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
import LoginNav from '../../components/loginnav';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as actions from '../../redux/actions';

export class Terms extends React.Component {
  static propTypes = {
    onSubmit: React.PropTypes.func.isRequired,
    trackMetric: React.PropTypes.func.isRequired,
    ages: React.PropTypes.object.isRequired,
    messages: React.PropTypes.object.isRequired,
    termsAccepted: React.PropTypes.string.isRequired,
    authenticated: React.PropTypes.bool.isRequired
  };

  static defaultProps = {
    ages: {
      OF_AGE: {value: '>=18', label: ' I am 18 years old or older.'},
      WITH_CONSENT: {value: '13-17', label: ' I am between 13 and 17 years old. You\'ll need to have a parent or guardian agree to the terms on the next screen.' },
      NOT_OF_AGE: {value: '<=12', label: ' I am 12 years old or younger.'}
    },
    messages: {
      ACCEPT_OF_AGE: 'I am 18 or older and I accept the terms of the Tidepool Applications Terms of Use and Privacy Policy',
      ACCEPT_ON_BEHALF: 'I agree that my child aged 13 through 17 can use Tidepool Applications and agree that they are also bound to the terms of the Tidepool Applications Terms of Use and Privacy Policy',
      SORRY_NOT_OF_AGE: 'We are really sorry, but you need to be 13 or older in order to create an account and use Tidepool\'s Applications.'
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      agreed: false,
      agreedOnBehalf: false,
      ageConfirmed: false,
      ageSelected: this.props.ages.OF_AGE.value //default
    };
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.termsAccepted && this.props.location.state && this.props.location.state.originalPath) {
      this.props.history.pushState(null, this.props.location.state.originalPath)
    }
  }

  renderAgeConsentStep() {
    return (
      <form ref='confirmAgeStep' className='terms-age-form'>
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
        <button
          className='btn btn-primary js-terms-submit'
          onClick={this.handleAgeSubmit.bind(this)}>Continue</button>
      </form>
    );
  }

  getTermsAndPrivacyButtonState() {
    var isDisabled = !this.state.agreed;

    if (this.state.ageSelected === this.props.ages.WITH_CONSENT.value) {
      if (this.state.agreed && this.state.agreedOnBehalf) {
        isDisabled = false;
      }
      else {
        isDisabled = true;
      }
    }
    return isDisabled;
  }

  renderTermsAndPrivacyStep() {
    var terms = this.websiteTerms();
    var privacy = this.websitePrivacy();
    var termsForm = this.renderTermsForm();

    return (
      <div ref='acceptTermsStep'>
        <div className='terms-title'>TERMS OF USE</div>
        {terms}
        <div className='privacy-title'>PRIVACY POLICY</div>
        {privacy}
        {termsForm}
      </div>
    );
  }

  renderTermsForm() {
    var agreeConfirmation = this.renderAgreeCheckboxes();
    var backBtn = this.renderBackBtn();
    var continueBtnDisabled = this.getTermsAndPrivacyButtonState();

    var termsForm;
    if (this.props.authenticated && !this.props.termsAccepted) {
      termsForm = (
        <form className='terms-form'>
          {agreeConfirmation}
          {backBtn}
          <button
            className='terms-button terms-button-submit'
            onClick={this.handleTermsAndPrivacySubmit.bind(this)}
            disabled={continueBtnDisabled}>Continue</button>
        </form>
      );
    }
    return termsForm;
  }

  renderBackBtn() {
    return (
      <button
        className='terms-button terms-button-back'
        onClick={this.handleBack.bind(this)}>Back</button>
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

    return (
      <div className='terms-accept-checkbox'>
        <label htmlFor='agreed'>
          <input
            id='agreed'
            type='checkbox'
            className='js-terms-checkbox'
            checked={this.state.agreed}
            onChange={this.handleAgreementChange.bind(this)} />
          {this.props.messages.ACCEPT_OF_AGE}
        </label>
        {onBehalf}
      </div>
    );
  }

  renderSorryMessage() {
    var backBtn = this.renderBackBtn();
    return (
      <div ref='sorryMsg'>
        <p className='terms-sorry-message'>{this.props.messages.SORRY_NOT_OF_AGE}</p>
        {backBtn}
      </div>
    );
  }

  render() {
    var content = '';
    if (!this.props.authenticated || (this.props.authenticated && this.props.termsAccepted)) {
      content = this.renderTermsAndPrivacyStep();
    }

    if (this.props.authenticated && !this.props.termsAccepted) {
      content = this.renderAgeConsentStep();
    }

    if (this.state.ageConfirmed) {
      //assume we are good to go
      content = this.renderTermsAndPrivacyStep();

      if (this.state.ageSelected === this.props.ages.NOT_OF_AGE.value) {
        //unless they are NOT_OF_AGE
        content = this.renderSorryMessage();
      }
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

  websiteTerms() {
    return React.DOM.iframe({
      className         : 'terms-iframe',
      src               : 'https://tidepool.org/terms-of-use/',
      scrolling         : 'yes',
      frameBorder       : '0',
      allowTransparency : 'true'
    });
  }

  websitePrivacy() {
    return React.DOM.iframe({
      className         : 'terms-iframe',
      src               : 'https://tidepool.org/privacy-policy/',
      scrolling         : 'yes',
      frameBorder       : '0',
      allowTransparency : 'true'
    });
  }

  handleBack(e) {
    if (e) {
      e.preventDefault();
    }
    this.setState(this.getInitialState());
    this.props.trackMetric('Back');
  }

  handleAgeSubmit(e) {
    if (e) {
      e.preventDefault();
    }
    this.setState({ageConfirmed: true });
    this.props.trackMetric('Confirmed age');
  }

  handleAgeChange(e) {
    this.setState({ ageSelected: e.target.value});
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

  if (state.blip.allUsersMap) {
    if (state.blip.loggedInUserId) {
      termsAccepted = state.blip.allUsersMap[state.blip.loggedInUserId].termsAccepted;
    }
  }

  return {
    authenticated: state.blip.isLoggedIn,
    termsAccepted: termsAccepted
  };

};

let mapDispatchToProps = dispatch => bindActionCreators({
  acceptTerms: actions.async.acceptTerms,
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  var api = ownProps.routes[0].api;
  return Object.assign({}, ownProps, stateProps, dispatchProps, {
    onSubmit: dispatchProps.acceptTerms.bind(null, api),
    trackMetric: ownProps.routes[0].trackMetric
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Terms);
