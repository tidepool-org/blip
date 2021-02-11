/**
 * Copyright (c) 2021, Diabeloop
 * Data API
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

import { v4 as uuidv4 } from "uuid";

import { APIErrorResponse } from "models/error";
import { PatientData } from "models/device-data";
import { MessageNote } from "models/message";
import { HttpHeaderKeys, HttpHeaderValues } from "../../models/api";
import { User, UserRoles } from "../../models/shoreline";

import appConfig from "../config";
import { t } from "../language";

export async function loadPatientData(patient: User, traceToken: string, sessionToken: string): Promise<PatientData> {
  if (!patient.roles?.includes(UserRoles.patient)) {
    return Promise.reject(new Error(t("not-a-patient")));
  }

  const dataURL = new URL(`/data/${patient.userid}`, appConfig.API_HOST);
  const response = await fetch(dataURL.toString(), {
    method: "GET",
    headers: {
      [HttpHeaderKeys.traceToken]: traceToken,
      [HttpHeaderKeys.sessionToken]: sessionToken,
    },
  });

  if (response.ok) {
    const patientData = (await response.json()) as PatientData;
    return patientData;
  }

  const responseBody = (await response.json()) as APIErrorResponse;
  throw new Error(t(responseBody.reason));
}

/**
 * Create a new note
 * @param message The note to send
 */
export async function startMessageThread(message: MessageNote, traceToken: string, sessionToken: string): Promise<string> {
  const messageURL = new URL(`/message/send/${message.groupid}`, appConfig.API_HOST);
  const response = await fetch(messageURL.toString(), {
    method: "POST",
    headers: {
      [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
      [HttpHeaderKeys.traceToken]: traceToken,
      [HttpHeaderKeys.sessionToken]: sessionToken,
    },
    body: JSON.stringify({
      message: {
        ...message,
        guid: uuidv4(),
      },
    }),
  });

  if (response.ok) {
    const result = await response.json();
    return result.id as string;
  }

  const responseBody = (await response.json()) as APIErrorResponse;
  throw new Error(t(responseBody.reason));
}
