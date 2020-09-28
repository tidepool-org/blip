
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

import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import i18next from '../../core/language';
import config from '../../config';
import { CONFIG } from '../../core/constants';

import * as actions from '../../redux/actions';

/** @type {(s: string, params?: object) => string} */
const t = i18next.t.bind(i18next);

export class Terms extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      agreed: false,
    };
  }

  renderTermsTitle() {
    const { termsWasAccepted } = this.props;
    /** @type {string} */
    const brand = _.get(CONFIG, `${config.BRANDING}.name`, 'Tidepool');

    let termsTitle = null;
    if (termsWasAccepted) {
      termsTitle = (
        <p id="terms-title-updated" className="terms-title">
          <span>{t('The Terms of Use and Privacy Policy have changed since you last used {{brand}}.', { brand })}</span>
          <br />
          <span>{t('You need to accept the changes to continue.')}</span>
        </p>
      );
    } else {
      termsTitle = (
        <p id="terms-title-first-time" className="terms-title">
          <span>{t('You need to accept the Terms of Use and Privacy Policy of {{brand}} to continue.', { brand })}</span>
        </p>
      );
    }

    return termsTitle;
  }

  /**
   *
   * @param {boolean} agreed True when the checkbox is checked.
   */
  renderCheckboxAgreedTerms(agreed) {
    const branding = CONFIG[config.BRANDING];
    const {
      termsText: textTermsOfUse,
      privacyText: textPrivacyPolicy,
      terms: urlTermsOfUse,
      privacy: urlPrivacyPolicy
    } = branding;

    // TODO Reuse <Trans /> from react-i18next after update to v11.6.0+
    // https://react.i18next.com/latest/trans-component#alternative-usage-v-11-6-0
    return (
      <p id="checkbox-agreed-terms">
        <label id="label-checkbox-agreed-terms" htmlFor='input-agreed-terms'>
          <input
            id='input-agreed-terms'
            type='checkbox'
            className='js-terms-checkbox'
            checked={agreed}
            onChange={() => this.setState({ agreed: !this.state.agreed })} />
          &nbsp;
          <Trans parent="span" i18nKey="html.terms-of-use.updated" i18n={i18next}>
            I am 18 or older and I accept the terms of the
            &nbsp;
            <a href={urlTermsOfUse} target='_blank' rel='noreferrer'>{textTermsOfUse}</a>
            &nbsp;
            and the
            &nbsp;
            <a href={urlPrivacyPolicy} target='_blank' rel='noreferrer'>{textPrivacyPolicy}</a>
          </Trans>
        </label>
      </p>
    );
  }

  render() {
    const { agreed } = this.state;

    const termsTitle = this.renderTermsTitle();
    const checkboxAgreedTerms = this.renderCheckboxAgreedTerms(agreed);

    return (
      <div className="container-terms">
        {termsTitle}
        {checkboxAgreedTerms}
        <div id="button-agreed-terms">
          <button
              className="btn btn-secondary"
              onClick={this.handleRejectTerms.bind(this)}>
            {t('Reject')}
          </button>
          <button
              className="btn btn-primary"
              onClick={this.handleTermsAndPrivacySubmit.bind(this)}
              disabled={!agreed}>
            {t('Accept')}
          </button>
        </div>
      </div>
    );
  }

  handleTermsAndPrivacySubmit(e) {
    const { termsWasAccepted } = this.props;
    e.preventDefault();
    this.props.trackMetric(termsWasAccepted ? 'Agreed to the new Terms Of Use' : 'Agreed to Terms Of Use');
    this.props.onSubmit();
  }

  handleRejectTerms(e) {
    const { termsWasAccepted } = this.props;
    e.preventDefault();
    this.props.trackMetric(termsWasAccepted ? 'Rejected the new Terms Of Use' : 'Rejected the Terms Of Use');
    this.props.onRefuse();
  }
}

Terms.propTypes = {
  termsWasAccepted: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onRefuse: PropTypes.func.isRequired,
  trackMetric: PropTypes.func.isRequired
};

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */
export function mapStateToProps(state) {
  /** @type {string} */
  const loggedInUserId = _.get(state, 'blip.loggedInUserId', 'invalidUserId');
  /** @type {string|null} */
  const termsAcceptedDate = _.get(state, `blip.allUsersMap.${loggedInUserId}.termsAccepted`, null);
  const termsWasAccepted = termsAcceptedDate !== null;

  return {
    termsWasAccepted,
  };
}

const mapDispatchToProps = dispatch => bindActionCreators({
  acceptTerms: actions.async.acceptTerms,
  logout: actions.async.logout,
}, dispatch);

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const api = ownProps.routes[0].api;
  return Object.assign({}, stateProps, {
    onSubmit: dispatchProps.acceptTerms.bind(null, api),
    onRefuse: dispatchProps.logout.bind(null, api),
    trackMetric: ownProps.routes[0].trackMetric
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Terms);
