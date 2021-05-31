/**
 * Copyright (c) 2021, Diabeloop
 * Switch role dialogs management
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
import { useTranslation } from "react-i18next";

import { errorTextFromException } from "../../lib/utils";
import sendMetrics from "../../lib/metrics";
import { useAuth } from "../../lib/auth";
import { useAlert } from "../utils/snackbar";
import { SwitchRoleDialogsProps, SwitchRoleToHcpSteps } from "./models";
import SwitchRoleConsequencesDialog from "./consequences-dialog";
import SwitchRoleConsentDialog from "./consent-dialog";

function SwitchRoleDialogs(props: SwitchRoleDialogsProps): JSX.Element {
  const { t } = useTranslation("yourloops");
  const { switchRoleToHCP, user } = useAuth();
  const alert = useAlert();
  const [switchRoleStep, setSwitchRoleStep] = React.useState<SwitchRoleToHcpSteps>(SwitchRoleToHcpSteps.none);

  if (user === null) {
    throw new Error("User must be looged-in");
  }

  const role = user.role;
  const handleSwitchRoleToConditions = (accept: boolean): void => {
    const nextStep = accept ? SwitchRoleToHcpSteps.consent : SwitchRoleToHcpSteps.none;
    sendMetrics("user-switch-role", { from: role, to: "hcp", step: nextStep, cancel: !accept });
    setSwitchRoleStep(nextStep);
    if (!accept) {
      props.onCancel();
    }
  };
  const handleSwitchRoleToUpdate = (accept: boolean): void => {
    const nextStep = accept ? SwitchRoleToHcpSteps.update : SwitchRoleToHcpSteps.none;
    sendMetrics("user-switch-role", { from: role, to: "hcp", step: nextStep, cancel: !accept });
    setSwitchRoleStep(nextStep);

    if (accept) {
      switchRoleToHCP()
        .then(() => {
          sendMetrics("user-switch-role", {
            from: role,
            to: "hcp",
            step: SwitchRoleToHcpSteps.update,
            success: true,
          });
        })
        .catch((reason: unknown) => {
          alert.error(t("modal-switch-hcp-failure"));
          sendMetrics("user-switch-role", {
            from: role,
            to: "hcp",
            step: SwitchRoleToHcpSteps.update,
            success: false,
            error: errorTextFromException(reason),
          });
        });
    } else {
      props.onCancel();
    }
  };

  React.useEffect(() => {
    if (props.open && switchRoleStep === SwitchRoleToHcpSteps.none) {
      setSwitchRoleStep(SwitchRoleToHcpSteps.consequences);
      sendMetrics("user-switch-role", { from: role, to: "hcp", step: SwitchRoleToHcpSteps.consequences });
    } else if (!props.open && switchRoleStep !== SwitchRoleToHcpSteps.none) {
      setSwitchRoleStep(SwitchRoleToHcpSteps.none);
    }
  }, [props.open, switchRoleStep, role]);

  return (
    <React.Fragment>
      <SwitchRoleConsequencesDialog
        title="modal-switch-hcp-title"
        open={switchRoleStep === SwitchRoleToHcpSteps.consequences}
        onResult={handleSwitchRoleToConditions}
      />
      <SwitchRoleConsentDialog open={switchRoleStep === SwitchRoleToHcpSteps.consent} onResult={handleSwitchRoleToUpdate} />
    </React.Fragment>
  );
}

export default SwitchRoleDialogs;
