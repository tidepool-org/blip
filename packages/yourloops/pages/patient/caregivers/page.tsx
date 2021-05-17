/**
 * Copyright (c) 2021, Diabeloop
 * Patient care givers page
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
import bows from "bows";
import { useTranslation } from "react-i18next";

import CircularProgress from "@material-ui/core/CircularProgress";
import Container from "@material-ui/core/Container";

import { useAuth } from "../../../lib/auth";
import sendMetrics from "../../../lib/metrics";
import { errorTextFromException } from "../../../lib/utils";
import { ShareUser, addDirectShare, getDirectShares, removeDirectShare } from "../../../lib/share";
import { useAlert } from "../../../components/utils/snackbar";
import { AddDialogContentProps, RemoveDialogContentProps } from "./types";
import SecondaryBar from "./secondary-bar";
import AddCaregiveDialog from "./add-dialog";
import RemoveCaregiverDialog from "./remove-dialog";
import CaregiverTable from "./table";

interface PatientCaregiversPageProps {
  defaultURL: string;
}

const log = bows("PatientCaregiversPage");

/**
 * Patient caregivers page
 */
function PatientCaregiversPage(props: PatientCaregiversPageProps): JSX.Element {
  const { t } = useTranslation("yourloops");
  const alert = useAlert();
  const authHook = useAuth();
  const [ caregiverToAdd, setCaregiverToAdd ] = React.useState<AddDialogContentProps | null>(null);
  const [ caregiverToRemove, setCaregiverToRemove ] = React.useState<RemoveDialogContentProps | null>(null);
  const [ caregivers, setCaregivers ] = React.useState<ShareUser[] | null>(null);
  const session = authHook.session();

  const handleShowAddCaregiverDialog = async (): Promise<void> => {
    const getCaregiverEmail = (): Promise<string | null> => {
      return new Promise((resolve: (email: string | null) => void) => {
        setCaregiverToAdd({ onDialogResult: resolve });
      });
    };

    const email = await getCaregiverEmail();
    setCaregiverToAdd(null); // Close the dialog

    if (email !== null && session !== null) {
      try {
        await addDirectShare(session, email);
        alert.success(t("modal-patient-add-caregiver-success"));
        sendMetrics("patient-add-caregiver", { added: true });
        setCaregivers(null); // Refresh the list
      } catch (reason) {
        log.error(reason);
        alert.error(t("modal-patient-add-caregiver-failure"));
        sendMetrics("patient-add-caregiver", { added: true, failed: errorTextFromException(reason) });
      }
    } else {
      sendMetrics("patient-add-caregiver", { added: false });
    }
  };

  const handleRemoveCaregiver = async (us: ShareUser): Promise<void> => {
    const getConsent = (): Promise<boolean> => {
      return new Promise((resolve: (consent: boolean) => void) => {
        setCaregiverToRemove({ caregiver: us, onDialogResult: resolve });
      });
    };

    const consent = await getConsent();
    setCaregiverToRemove(null); // Close the dialog

    if (consent && session !== null) {
      try {
        await removeDirectShare(session, us.user.userid);
        alert.success(t("modal-patient-remove-caregiver-success"));
        sendMetrics("patient-remove-caregiver", { removed: true, caregiver: us.user.userid });
        setCaregivers(null); // Refresh the list
      } catch (reason) {
        log.error(reason);
        alert.error(t("modal-patient-remove-caregiver-failure"));
        sendMetrics("patient-remove-caregiver", { removed: true, caregiver: us.user.userid, failed: errorTextFromException(reason) });
      }
    } else {
      sendMetrics("patient-remove-caregiver", { removed: false, caregiver: us.user.userid });
    }
  };

  React.useEffect(() => {
    if (caregivers === null && session !== null) {
      // Load caregivers
      getDirectShares(session).then((value) => {
        setCaregivers(value);
      }).catch((reason: unknown) => {
        log.error(reason);
        setCaregivers([]);
      });
    }
  }, [caregivers, session]);

  if (caregivers === null) {
    return (
      <CircularProgress
        id="patient-page-loading-progress"
        disableShrink
        style={{ position: "absolute", top: "calc(50vh - 20px)", left: "calc(50vw - 20px)" }}
      />
    );
  }

  return (
    <React.Fragment>
      <SecondaryBar defaultURL={props.defaultURL} onShowAddCaregiverDialog={handleShowAddCaregiverDialog} />
      <Container maxWidth="lg" style={{ marginTop: "4em", marginBottom: "2em" }}>
        <CaregiverTable userShares={caregivers} onRemoveCaregiver={handleRemoveCaregiver} />
      </Container>

      <AddCaregiveDialog actions={caregiverToAdd} />
      <RemoveCaregiverDialog actions={caregiverToRemove} />
    </React.Fragment>
  );
}

export default PatientCaregiversPage;
