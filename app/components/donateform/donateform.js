/**
 * Copyright (c) 2017, Tidepool Project
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

import React, { Component } from 'react';
import _ from 'lodash';
import { translate, Trans } from 'react-i18next';

import InputGroup from '../../components/inputgroup';
import SimpleForm from '../../components/simpleform';

import {
  DATA_DONATION_NONPROFITS,
  URL_BIG_DATA_DONATION_INFO,
  TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL,
} from '../../core/constants';

import { getDonationAccountCodeFromEmail } from '../../core/utils';

export default translate()(class DonateForm extends Component {
  static propTypes = {
    dataDonationAccounts: React.PropTypes.array.isRequired,
    onUpdateDataDonationAccounts: React.PropTypes.func.isRequired,
    working: React.PropTypes.bool.isRequired,
    trackMetric: React.PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.nonprofitAccounts = _.reject(props.dataDonationAccounts, { email: TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL });
    const initialFormValues = this.getInitialFormValues();

    this.state = {
      formValues: initialFormValues,
      initialFormValues: initialFormValues,
      formSubmitted: false,
    };
  }

  render() {
    return (
      <div className="DonateForm">
        {this.renderForm()}
      </div>
    );
  }

  renderForm = () => {
    return (
      <SimpleForm
        inputs={this.getFormInputs()}
        formValues={this.state.formValues}
        submitButtonText={this.getSubmitButtonText()}
        submitDisabled={this.submitIsDisabled()}
        onSubmit={this.handleSubmit}
        onChange={this.handleChange}
      />
    );
  }

  getFormInputs() {
    const { t } = this.props;
    return [
      {
        name: 'dataDonate',
        label: t('Donate my anonymized data'),
        disabled: !_.isEmpty(this.state.formValues.dataDonateDestination),
        value: this.state.formValues.dataDonate,
        type: 'checkbox'
      },
      {
        name: 'dataDonateExplainer',
        type: 'explanation',
        text: (
          <Trans i18nKey="html.donate-form-explainer">
            You own your data. Read all the details about Tidepool's Big Data
            Donation project <a target="_blank" href={URL_BIG_DATA_DONATION_INFO}>here</a>.
          </Trans>
        ),
      },
      {
        name: 'dataDonateDestination',
        type: 'select',
        multi: true,
        value: this.state.formValues.dataDonateDestination,
        placeholder: t('Choose which diabetes organization(s) to support'),
        items: DATA_DONATION_NONPROFITS(), //eslint-disable-line new-cap
      },
      {
        name: 'donateExplainer',
        type: 'explanation',
        text: (
          <div>
            {t('Tidepool will share 10% of the proceeds with the diabetes organization(s) of your choice.')}
          </div>
        ),
      },
    ];
  }

  getInitialFormValues = () => {
    let selectedNonprofits = '';

    // Extract nonprofit account identifiers from email addresses,
    // and format as comma-separated string for the multi-select input
    if (this.nonprofitAccounts.length) {
      selectedNonprofits = [];

      _.forEach(this.nonprofitAccounts, account => {
        let code = getDonationAccountCodeFromEmail(account.email);
        code && selectedNonprofits.push(code);
      });

      selectedNonprofits = selectedNonprofits.sort().join(',');
    }

    return {
      dataDonate: !_.isEmpty(this.props.dataDonationAccounts),
      dataDonateDestination: selectedNonprofits,
    };
  }

  getSubmitButtonText = () => {
    if (this.props.working) {
      return 'Saving...';
    }
    if (this.formIsUpdated()) {
      return 'Save';
    }

    return this.props.dataDonationAccounts.length || this.state.formSubmitted ? 'Saved' : 'Save';
  }

  formIsUpdated = () => {
    const formValues = _.pick(this.state.formValues, ['dataDonate', 'dataDonateDestination']);
    const initialFormValues = _.pick(this.state.initialFormValues, ['dataDonate', 'dataDonateDestination']);
    return !_.isEqual(formValues, initialFormValues);
  }

  submitIsDisabled = () => {
    return this.props.working || !this.formIsUpdated();
  }

  handleChange = (attributes) => {
    let formValues = _.merge({}, this.state.formValues, {
      [attributes.name]: attributes.value,
    });

    if (attributes.name === 'dataDonateDestination') {
      // Sort the values so that we can accurately check see if the form values have changed
      let sortedValue = attributes.value.map(value => value.value).sort().join(',');
      formValues[attributes.name] = sortedValue;

      // Ensure that the donate checkbox is checked if there are nonprofits selected
      if (!_.isEmpty(attributes.value) && !formValues.dataDonate) {
        formValues.dataDonate = true;
      }
    }

    this.setState({ formValues });
  }

  handleSubmit = (formValues) => {
    if (this.submitIsDisabled()) {
      return;
    }

    const existingAccounts = _.keyBy(this.props.dataDonationAccounts, 'email');
    const selectedAccounts = formValues.dataDonateDestination.split(',');

    const addAccounts = [];
    const removeAccounts = [];

    // Determine all the accounts that should be present
    if (formValues.dataDonate) {
      addAccounts.push(TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL);

      _.forEach(selectedAccounts, accountId => {
        accountId && addAccounts.push(`bigdata+${accountId}@tidepool.org`);
      });
    }

    // Filter out any accounts that are already shared with
    const filteredAddAccounts = _.reject(addAccounts, account => { return _.get(existingAccounts, account) });

    // Remove any existing shared accounts that have been removed
    _.forEach(existingAccounts, account => {
      if (!_.includes(addAccounts, account.email)) {
        removeAccounts.push(account);
      }
    });

    this.props.onUpdateDataDonationAccounts(filteredAddAccounts, removeAccounts);

    // Reset the initial form values state to the submitted form values for subsequent equality comparisons
    this.setState({
      initialFormValues: formValues,
      formSubmitted: true,
    });

    if (this.props.trackMetric) {
      _.forEach(filteredAddAccounts, email => {
        const source = getDonationAccountCodeFromEmail(email) || 'none';
        this.props.trackMetric('web - big data sign up', { source, location: 'settings' });
      });

      _.forEach(removeAccounts, account => {
        const source = getDonationAccountCodeFromEmail(account.email) || 'none';
        this.props.trackMetric('web - big data cancellation', { source });
      });
    }
  }
});
