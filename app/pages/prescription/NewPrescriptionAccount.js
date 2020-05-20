import React, { useState } from 'react';
import { translate } from 'react-i18next';
import { FastField, Field, useFormikContext, useFormik, withFormik } from 'formik';
import * as Yup from 'yup';
import { Box } from 'rebass/styled-components';
import bows from 'bows';
import get from 'lodash/get';

import RadioGroup from '../../components/elements/RadioGroup';
import { Headline } from '../../components/elements/FontStyles';

const log = bows('NewPrescriptionAccount');

export const accountForm = {
  mapPropsToValues: () => ({ 'account_type': null }),
  displayName: 'AccountForm',
};

export const accountForm2 = {
  initialValues: { 'account_type': null },
};

export const AccountType = translate()((props) => {
// export const AccountType = (props) => {
  const { handleChange, values, t } = props;

  return (
    <Box width={0.5} margin="auto">
      <Headline>{t('Who are you creating your account for?')}</Headline>
      <RadioGroup
        id="account_type"
        name="account_type"
        options={[
          { value: 'patient', label: t('Patient') },
          { value: 'caregiver', label: t('Patient and caregiver') },
        ]}
        value={values.account_type}
        onChange={handleChange}
      />
    </Box>
  );
// };
});

export const accountSteps = () => {
  const [formikState, setFormikState] = React.useState();
  const handleFormikStateChange = (newState) => {
    setFormikState(newState);
  }

  // const withFormikWrapper = (WrappedComponent) => withFormik(accountForm)((props) => {
  const withFormikWrapper = WrappedComponent => (props = {}) => {
    const formikProps = useFormik(accountForm2);
    // const formikProps = useFormikContext();
    const {values, touched, errors} = formikProps;

    React.useEffect(() => {
      console.log('values', values);
      console.log('touched', touched);
      console.log('errors', errors);
      handleFormikStateChange({ values, touched, errors })
    }, [values, touched, errors]);

    return <WrappedComponent {...props} {...formikProps} />
    // return (props) => <WrappedComponent {...props} {...formikProps} />
  };

  // console.log('withFormikWrapper(AccountType)()', withFormikWrapper(AccountType)());
  // console.log('withFormik(accountForm)(AccountType)', withFormik(accountForm)(AccountType));
  // console.log('withFormik(accountForm)(AccountType)', withFormik(accountForm)(AccountType));
  // console.log('withFormik(accountForm)()', withFormik(accountForm)(withFormikWrapper(AccountType)()));
  // console.log('withFormik(accountForm)(AccountType)', withFormik(accountForm)(AccountType));

  return {
    label: 'Create Patient Account',
    onComplete: () => log('Patient Account Created'),
    subSteps: [
      {
        label: 'Step One',
        onComplete: () => log('Account Step One Complete'),
        // panelContent: withFormik(accountForm)(AccountType),
        panelContent: withFormikWrapper(AccountType)(),
        // panelContent: withFormik(accountForm)(withFormikWrapper(AccountType)()),
        disableComplete: !get(formikState, 'values.account_type'),
      },
      // {
      //   label: 'Step Two',
      //   onComplete: log('Account Step Two Complete'),
      //   panelContent: <AccountType />,
      // },
    ],
  };
};

export default accountSteps;
