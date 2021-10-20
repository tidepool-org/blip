/**
 * Copyright (c) 2021, Diabeloop
 * Login page / Resend activation link button
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

import React from "react";
import { useTranslation } from "react-i18next";

import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import metrics from "../../lib/metrics";
import { useAuth } from "../../lib/auth";
import { waitTimeout } from "../../lib/utils";
import { useAlert } from "../../components/utils/snackbar";

interface ButtonResendActivationLinkProps {
  username: string;
  log: Console;
  setResendActivationLinkInProgress: React.Dispatch<React.SetStateAction<boolean>>;
}

const buttonStyle = makeStyles((/* theme: Theme */) => {
  return {
    snackbarButton: {
      color: "black",
    },
  };
}, { name: "login-page-resend-button-styles" });

function ButtonResendActivationLink(props: ButtonResendActivationLinkProps): JSX.Element {
  const { username, log, setResendActivationLinkInProgress } = props;
  const { t } = useTranslation("yourloops");
  const alert = useAlert();
  const auth = useAuth();
  const classes = buttonStyle();
  const [workInProgress, setWorkInProgress] = React.useState(false);

  const onClickResendActivationLink = () => {
    setWorkInProgress(true);
    setResendActivationLinkInProgress(true);
    metrics.send("registration", "resend_signup");

    let resendResult = false;

    // Add a small timeout here, so the actions are clear for the user
    // If it is too fast, we do not have the time to understand what's going on.
    Promise.all([waitTimeout(1000), auth.resendSignup(username)])
      .then((result) => {
        resendResult = result[1];
      })
      .catch((reason) => {
        log.error(reason);
      })
      .finally(() => {
        setResendActivationLinkInProgress(false);
        if (resendResult) {
          alert.success(t("success-resent-activation-link"), null, true);
        } else {
          alert.error(t("error-resent-activation-link"), null, true);
        }
      });
  };

  return (
    <Button
      id="button-resend-activation-link"
      color="primary"
      size="small"
      className={classes.snackbarButton}
      onClick={onClickResendActivationLink}
      disabled={workInProgress}>
      {t("button-resend-activation-link")}
    </Button>
  );
}

export default ButtonResendActivationLink;
