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

import * as React from "react";
import bows from "bows";
import { useParams } from "react-router-dom";
import Container from "@material-ui/core/Container";

import Blip from "blip";

import { UserRoles } from "../models/shoreline";
import appConfig from "../lib/config";
import { useAuth } from "../lib/auth";
import { useTeam, TeamUser } from "../lib/team";
import { useData } from "../lib/data";

import ProfileDialog from "./profile-dialog";

interface PatientDataPageProps {
  prefixURL: string;
}

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

function PatientDataPage(props: PatientDataPageProps): JSX.Element | null {
  const paramHook = useParams();
  const authHook = useAuth();
  const teamHook = useTeam();
  const dataHook = useData();

  const [patient, setPatient] = React.useState<Readonly<TeamUser> | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const { blipApi } = dataHook;
  const { patientId: paramPatientId = null } = paramHook as PatientDataParam;
  const userId = authHook.user?.userid ?? null;
  const prefixURL = authHook.user?.role === UserRoles.patient ? props.prefixURL : `${props.prefixURL}/${paramPatientId}`;

  const initialized = authHook.initialized() && teamHook.initialized && blipApi !== null;

  React.useEffect(() => {
    if (!initialized) {
      return;
    }

    const patientId = paramPatientId ?? userId;
    if (patientId === null) {
      log.error("Invalid patient Id", patientId);
      setError("Invalid patient Id");
      return;
    }

    const user = teamHook.getUser(patientId);
    if (user === null || user.role !== UserRoles.patient) {
      log.error("Patient not found");
      setError("Patient not found");
    } else {
      setPatient(user);
    }
  }, [initialized, paramPatientId, patient, userId, teamHook]);

  log.debug("render", { userId, paramPatientId, error });

  if (error !== null) {
    return <PatientDataPageError msg={error} />;
  }

  if (blipApi === null || patient === null) {
    return null;
  }

  return (
    <Container maxWidth="lg">
      <Blip config={appConfig} api={blipApi} patient={patient} profileDialog={ProfileDialog} prefixURL={prefixURL} />
    </Container>
  );
}

export default PatientDataPage;
