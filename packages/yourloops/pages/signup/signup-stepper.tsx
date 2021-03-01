/* eslint-disable indent */
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

import * as React from "react";
import { useHistory } from "react-router-dom";
import _ from "lodash";
import { useTranslation } from "react-i18next";

import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import SignUpAccountForm from "./signup-account-form";
import SignUpAccountSelector from "./signup-account-selector";
import SignUpProfileForm from "./signup-profile-form";
import SignUpConsent from "./signup-consent";
import { useSignUpFormState } from "./signup-formstate-context";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
    },
    button: {
      marginRight: theme.spacing(1),
    },
    instructions: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
  })
);

export default function SignUpStepper() : JSX.Element {
  const { t } = useTranslation("yourloops");
  const classes = useStyles();
  const { state, dispatch } = useSignUpFormState();
  const history = useHistory();
  const [activeStep, setActiveStep] = React.useState(0);
  const [tittle, setTitle] = React.useState("");
  const steps = [
    "signup-steppers-step1",
    "signup-steppers-step2",
    "signup-steppers-step3",
    "signup-steppers-step4",
  ];

  React.useEffect(() => {
    if (!_.isEmpty(state.formValues?.accountRole)) {
      setTitle(`signup-steppers-${state.formValues.accountRole}-title`);
    }
  }, [state.formValues.accountRole]);

  const handleNext = (): void => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    if (activeStep === 0) {
      history.push("/");
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }
  };

  const handleLogin = () => {
    dispatch({ type: "RESET_FORMVALUES" });
    history.push("/");
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <SignUpAccountSelector
            handleBack={handleBack}
            handleNext={handleNext}
          />
        );
      case 1:
        return (
          <SignUpConsent handleBack={handleBack} handleNext={handleNext} />
        );
      case 2:
        return (
          <SignUpProfileForm handleBack={handleBack} handleNext={handleNext} />
        );
      // eslint-disable-next-line no-magic-numbers
      case 3:
        return (
          <SignUpAccountForm handleBack={handleBack} handleNext={handleNext} />
        );
      default:
        return t("signup-steppers-step-unknown");
    }
  };

  return (
    <div className={classes.root}>
      {activeStep > 0 && (
        <Typography color="primary" variant="h4" gutterBottom>
          {t(tittle)}
        </Typography>
      )}
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => {
          const stepProps: { completed?: boolean } = {};
          const labelProps: { optional?: React.ReactNode } = {};
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{t(label)}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      <div>
        {activeStep === steps.length ? (
          <div>
            <Typography className={classes.instructions}>
              {t("signup-steppers-ending-message", {
                email: state.formValues.accountUsername,
              })}
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              className={classes.button}
              onClick={handleLogin}
            >
              {t("signup-steppers-back-login")}
            </Button>
          </div>
        ) : (
          <div>{getStepContent(activeStep)}</div>
        )}
      </div>
    </div>
  );
}
