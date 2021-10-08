/**
 * Copyright (c) 2021, Diabeloop
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import _ from "lodash";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { makeStyles, Theme } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

import sendMetrics from "../../lib/metrics";
import { useSignUpFormState, FormValuesType } from "./signup-formstate-context";
import { availableCountries } from "../../lib/language";
import SignUpFormProps from "./signup-form-props";

interface Errors {
  firstName: boolean;
  lastName: boolean;
  country: boolean;
  job: boolean;
  phone: boolean;
}

const formStyle = makeStyles((theme: Theme) => {
  return {
    TextField: {
      textAlign: "start",
      marginLeft: theme.spacing(0),
      marginRight: theme.spacing(1),
    },
    Checkbox: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
    Buttons: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: theme.spacing(4),
      marginLeft: "100px",
      marginRight: "100px",
      marginBottom: theme.spacing(2),
    },
    Button: {
      marginRight: theme.spacing(1),
    },
  };
});

/**
 * SignUpProfileForm Form
 */
function SignUpProfileForm(props: SignUpFormProps): JSX.Element {
  const { t } = useTranslation("yourloops");
  const { state, dispatch } = useSignUpFormState();
  const { handleBack, handleNext } = props;
  const defaultErr = {
    firstName: false,
    lastName: false,
    country: false,
    job: false,
    phone: false,
  };
  const [errors, setErrors] = React.useState<Errors>(defaultErr);

  const classes = formStyle();

  const onChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    keyField: FormValuesType
  ): void => {
    dispatch({
      type: "EDIT_FORMVALUE",
      key: keyField,
      value: event.target.value,
    });
  };

  const onSelectChange = (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: string | unknown;
    }>,
    keyField: FormValuesType
  ): void => {
    dispatch({
      type: "EDIT_FORMVALUE",
      key: keyField,
      value: event.target.value as string,
    });
  };

  const validateFirstName = (): boolean => {
    const err = _.isEmpty(state.formValues?.profileFirstname.trim());
    setErrors({ ...errors, firstName: err });
    return !err;
  };

  const validateLastName = (): boolean => {
    const err = _.isEmpty(state.formValues?.profileLastname.trim());
    setErrors({ ...errors, lastName: err });
    return !err;
  };

  const validateCountry = (): boolean => {
    const err = _.isEmpty(state.formValues?.profileCountry);
    setErrors({ ...errors, country: err });
    return !err;
  };

  const onNext = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    if (
      validateFirstName() &&
      validateLastName() &&
      validateCountry()
    ) {
      handleNext();
      sendMetrics("registration", "create_profile", state.formValues.accountRole);
    }
  };

  return (
    <form
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
      noValidate
      autoComplete="off"
    >
      <TextField
        id="firstname"
        className={classes.TextField}
        margin="normal"
        label={t("firstname")}
        variant="outlined"
        value={state.formValues?.profileFirstname}
        required
        error={errors.firstName}
        onBlur={() => validateFirstName()}
        onChange={(e) => onChange(e, "profileFirstname")}
        helperText={errors.firstName && t("required-field")}
      />
      <TextField
        id="lastname"
        className={classes.TextField}
        margin="normal"
        label={t("lastname")}
        variant="outlined"
        value={state.formValues?.profileLastname}
        required
        error={errors.lastName}
        onBlur={() => validateLastName()}
        onChange={(e) => onChange(e, "profileLastname")}
        helperText={errors.lastName && t("required-field")}
      />
      <FormControl
        variant="outlined"
        className={classes.TextField}
        margin="normal"
        required
        error={errors.country}
      >
        <InputLabel id="country-selector-input-label">
          {t("signup-country")}
        </InputLabel>
        <Select
          labelId="country-selector-label"
          label={t("signup-country")}
          id="country-selector"
          value={state.formValues?.profileCountry}
          onBlur={() => validateCountry()}
          onChange={(e) => onSelectChange(e, "profileCountry")}
        >
          <MenuItem key="" value="" />
          {availableCountries.map((item) => (
            <MenuItem id={`signup-country-menuitem-${item.code}`} key={item.code} value={item.code}>
              {t(item.name)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <div id="signup-profileform-button-group" className={classes.Buttons}>
        <Button
          id="button-signup-steppers-back"
          variant="contained"
          color="secondary"
          className={classes.Button}
          classes={{ label: "button-signup-steppers-back-label" }}
          onClick={handleBack}
        >
          {t("signup-steppers-back")}
        </Button>
        <Button
          id="button-signup-steppers-next"
          variant="contained"
          color="primary"
          className={classes.Button}
          classes={{ label: "button-signup-steppers-next-label" }}
          onClick={onNext}
        >
          {t("signup-steppers-next")}
        </Button>
      </div>
    </form>
  );
}

export default SignUpProfileForm;
