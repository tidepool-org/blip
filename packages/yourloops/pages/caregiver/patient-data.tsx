/**
 * Copyright (c) 2021, Diabeloop
 * Patient data page
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
import bows from "bows";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import CircularProgress from "@material-ui/core/CircularProgress";
import Container from "@material-ui/core/Container";

import Blip from "blip";

import { getUserFirstLastName, setPageTitle } from "../../lib/utils";
import appConfig from "../../lib/config";
import { useData } from "../../lib/data";
import { useSharedUser, ShareUser } from "../../lib/share";

import InvalidRoute from "../../components/invalid-route";
import ProfileDialog from "../../components/dialogs/patient-profile";
import DialogDatePicker from "../../components/date-pickers/dialog-date-picker";
import DialogRangeDatePicker from "../../components/date-pickers/dialog-range-date-picker";
import DialogPDFOptions from "../../components/dialogs/pdf-print-options";

interface PatientDataParam {
  patientId?: string;
}

const log = bows("PatientDataPage");


function PatientDataPage(): JSX.Element | null {
  const { t } = useTranslation("yourloops");
  const paramHook = useParams();
  const [sharedUsersContext /*, sharedUsersDispatch */] = useSharedUser();
  const dataHook = useData();

  const [patient, setPatient] = React.useState<Readonly<ShareUser> | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const { blipApi } = dataHook;
  const { patientId: paramPatientId = null } = paramHook as PatientDataParam;
  const sharedUsers = sharedUsersContext.sharedUsers;

  React.useEffect(() => {
    log.debug("useEffect");
    if (patient === null && error === null) {
      if (paramPatientId === null) {
        setError("page-not-found");
      } else if (sharedUsers !== null) {
        const sharedUser = sharedUsers.find((su) => su.user.userid === paramPatientId);
        if (sharedUser) {
          setPatient(sharedUser);
        } else {
          log.error("Missing patient", paramPatientId);
          setError(t("patient-not-found"));
        }
      } else {
        log.error("sharedUsersContext not yet initialized");
      }
    } else if (patient !== null && patient.user.userid !== paramPatientId) {
      setPatient(null);
    }
  }, [paramPatientId, patient]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (patient) {
      setPageTitle(t("user-name", getUserFirstLastName(patient.user)), "PatientName");
    } else {
      setPageTitle();
    }
  }, [patient, t]);

  log.debug("render", { sharedUsersContext, patient, error, paramPatientId });

  if (error !== null) {
    return <InvalidRoute message={error} defaultURL={"/caregiver/patients"} />;
  }

  if (blipApi === null || patient === null) {
    return (
      <CircularProgress
        disableShrink
        style={{
          position: "absolute",
          top: "calc(50vh - 20px)",
          left: "calc(50vw - 20px)",
        }}
      />
    );
  }

  return (
    <Container maxWidth="lg">
      <Blip
        config={appConfig}
        api={blipApi}
        patient={patient.user}
        profileDialog={ProfileDialog}
        prefixURL={`/caregiver/patient/${paramPatientId}`}
        dialogDatePicker={DialogDatePicker}
        dialogRangeDatePicker={DialogRangeDatePicker}
        dialogPDFOptions={DialogPDFOptions}
      />
    </Container>
  );
}

export default PatientDataPage;
