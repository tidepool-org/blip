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

import React from "react";
import { useTranslation } from "react-i18next";
import bows from "bows";

import { HcpProfession } from "../../models/hcp-profession";
import { SwitchRoleDialogsProps, SwitchRoleToHcpSteps } from "./models";
import metrics from "../../lib/metrics";
import { useAuth } from "../../lib/auth";
import { useAlert } from "../utils/snackbar";
import SwitchRoleConsequencesDialog from "./consequences-dialog";
import SwitchRoleConsentDialog from "./consent-dialog";
import SwitchRoleProfessionDialog from "./profession-dialog";

const log = bows("SwitchRoleDialogs");

function SwitchRoleDialogs(props: SwitchRoleDialogsProps): JSX.Element {
  const { t } = useTranslation("yourloops");
  const { switchRoleToHCP, user } = useAuth();
  const alert = useAlert();
  const [switchRoleStep, setSwitchRoleStep] = React.useState<SwitchRoleToHcpSteps>(SwitchRoleToHcpSteps.none);
  const [feedbackConsent, setFeedbackConsent] = React.useState<boolean>(false);

  if (!user) {
    throw new Error("User must be looged-in");
  }

  const role = user.role;
  const handleSwitchRoleToConditions = (): void => {
    setSwitchRoleStep(SwitchRoleToHcpSteps.consent);
  };

  const handleSwitchRoleToUpdate = async (hcpProfession: HcpProfession): Promise<void> => {
    try {
      await switchRoleToHCP(feedbackConsent, hcpProfession);
      metrics.send("switch_account", "accept_terms");
    } catch (reason: unknown) {
      alert.error(t("modal-switch-hcp-failure"));
      log.error("switchRoleToHCP", reason);
    }
  };

  const handleSwitchRoleToProfession = (feedback: boolean): void => {
    setFeedbackConsent(feedback);
    setSwitchRoleStep(SwitchRoleToHcpSteps.profession);
  };

  React.useEffect(() => {
    if (props.open && switchRoleStep === SwitchRoleToHcpSteps.none) {
      setSwitchRoleStep(SwitchRoleToHcpSteps.consequences);
    } else if (!props.open && switchRoleStep !== SwitchRoleToHcpSteps.none) {
      setSwitchRoleStep(SwitchRoleToHcpSteps.none);
    }
  }, [props.open, switchRoleStep, role]);

  return (
    <React.Fragment>
      <SwitchRoleConsequencesDialog
        title="modal-switch-hcp-title"
        open={switchRoleStep === SwitchRoleToHcpSteps.consequences}
        onAccept={handleSwitchRoleToConditions}
        onCancel={props.onCancel}
      />
      <SwitchRoleConsentDialog
        open={switchRoleStep === SwitchRoleToHcpSteps.consent}
        onAccept={handleSwitchRoleToProfession}
        onCancel={props.onCancel}
      />
      <SwitchRoleProfessionDialog
        open={switchRoleStep === SwitchRoleToHcpSteps.profession}
        onAccept={handleSwitchRoleToUpdate}
        onCancel={props.onCancel}
      />
    </React.Fragment>
  );
}

export default SwitchRoleDialogs;
