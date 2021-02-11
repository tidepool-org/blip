/**
 * Copyright (c) 2021, Diabeloop
 * HCPs patient data page
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
import { useParams } from "react-router-dom";
import Container from "@material-ui/core/Container";

import Blip from "blip";

import { errorTextFromException } from "../../lib/utils";
import appConfig from "../../lib/config";
import { useTeam } from "../../lib/team";
import { useData } from "../../lib/data";

import ProfileDialog from "../../components/profile-dialog";

interface PatientDataParam {
  patientId?: string;
}

interface PatientDataPageErrorProps {
  msg: string;
}

const log = bows("PatientDataPage");

function PatientDataPageError({ msg }: PatientDataPageErrorProps): JSX.Element {
  return (
    <Container maxWidth="lg">
      <strong>{msg}</strong>
    </Container>
  );
}

function PatientDataPage(): JSX.Element {

  const paramHook = useParams();
  const teamHook = useTeam();
  const dataHook = useData();
  const [initialized, setInitialized] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const { patientId } = paramHook as PatientDataParam;
  log.debug("render", { patientId, initialized, error });

  React.useEffect(() => {
    if (!initialized) {

      if (!teamHook.initialized) {
        return;
      }

      setInitialized(true);

      if (typeof patientId === "undefined") {
        log.error("Invalid patient Id", patientId);
        setError("Invalid patient Id");
        return;
      }
      const patient = teamHook.getUser(patientId);
      if (patient === null) {
        log.error("Patient not found");
        setError("Patient not found");
        return;
      }
      dataHook.loadPatientData(patient).catch((reason: unknown) => {
        log.error(reason);
        setError(errorTextFromException(reason));
      });
    }
  }, [patientId, initialized, dataHook, teamHook]);

  if (error !== null) {
    return <PatientDataPageError msg={error} />;
  }

  return (
    <Container maxWidth="lg">
      <Blip config={appConfig} api={dataHook.blipApi} profileDialog={ProfileDialog} />
    </Container>
  );
}

export default PatientDataPage;
