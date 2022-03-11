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

import bows from "bows";
import _ from "lodash";

import { PatientData } from "models/device-data";
import MessageNote from "models/message";
import { HttpHeaderKeys, HttpHeaderValues } from "../../models/api";
import { APITideWhispererErrorResponse } from "../../models/error";
import { ComputedTIR } from "../../models/device-data";
import { IUser, UserRoles } from "../../models/shoreline";

import HttpStatus from "../http-status-codes";
import appConfig from "../config";
import { t } from "../language";
import { errorFromHttpStatus } from "../utils";
import { Session } from "../auth";
import { GetPatientDataOptionsV0, GetPatientDataOptions } from "./models";

const log = bows("data-api");

export async function getPatientsDataSummary(session: Session, userId: string, options?: GetPatientDataOptionsV0): Promise<ComputedTIR> {

  let endpoint = "/compute/tir";
  if (appConfig.CBG_BUCKETS_ENABLED) {
    endpoint = `/data/v2/summary/${userId}`;
  }
  const dataURL = new URL(endpoint , appConfig.API_HOST);

  if (!appConfig.CBG_BUCKETS_ENABLED) {
    dataURL.searchParams.set("userIds", userId);
  }

  if (options) {
    if (options.startDate) {
      dataURL.searchParams.set("startDate", options.startDate);
    }
    if (options.endDate) {
      dataURL.searchParams.set("endDate", options.endDate);
    }
  }

  const { sessionToken, traceToken } = session;
  const response = await fetch(dataURL.toString(), {
    method: "GET",
    headers: {
      [HttpHeaderKeys.traceToken]: traceToken,
      [HttpHeaderKeys.sessionToken]: sessionToken,
    },
  });

  if (response.ok) {
    if (appConfig.CBG_BUCKETS_ENABLED) {
      return await response.json() as ComputedTIR;
    }
    const result = await response.json() as ComputedTIR[];
    if (Array.isArray(result) && result.length > 0) {
      return result[0];
    }
  }

  return Promise.reject(errorFromHttpStatus(response, log));
}

function getRange(session: Session, patient: IUser): Promise<Response> {
  const { sessionToken, traceToken } = session;
  if (patient.role !== UserRoles.patient) {
    return Promise.reject(new Error(t("not-a-patient")));
  }

  let endpoint = `/data/v1/range/${patient.userid}`;
  if (appConfig.CBG_BUCKETS_ENABLED) {
    endpoint = `/data/v2/range/${patient.userid}`;
  }

  const dataURL = new URL(endpoint, appConfig.API_HOST);
  return fetch(dataURL.toString(), {
    method: "GET",
    headers: {
      [HttpHeaderKeys.traceToken]: traceToken,
      [HttpHeaderKeys.sessionToken]: sessionToken,
    },
  });
}

/**
 * Fetch data range using tide-whisperer v1 or v2 route
 * @param session Session information
 * @param patient The patient (user) to fetch data
 * @returns Array [string, string] of ISO 8601 dates time
 */
export async function getPatientDataRange(session: Session, patient: IUser): Promise<string[] | null> {
  const response = await getRange(session, patient);
  if (response.ok) {
    const dataRange = (await response.json()) as string[];
    if (!Array.isArray(dataRange) || dataRange.length !== 2) {
      return Promise.reject(new Error("Invalid response"));
    }
    return dataRange;
  } else if (response.status === HttpStatus.StatusNotFound) {
    try {
      const text = await response.text();
      if (text.length > 0) {
        const errorResponse = JSON.parse(text) as APITideWhispererErrorResponse;
        if (_.get(errorResponse, "status", 0) === HttpStatus.StatusNotFound) {
          // This is a valid route response, no patient data
          return null;
        }
      }
    } catch (_err) {
      // Ignore
    }
  }
  return Promise.reject(errorFromHttpStatus(response, log));
}

/**
 * Fetch data using tide-whisperer v1 or v2 route
 * @param session Session information
 * @param patient The patient (user) to fetch data
 * @param options Options to pas to the API
 * @returns Patient data array
 */
export async function getPatientData(session: Session, patient: IUser, options?: GetPatientDataOptions): Promise<PatientData> {
  const { sessionToken, traceToken } = session;
  if (patient.role !== UserRoles.patient) {
    return Promise.reject(new Error(t("not-a-patient")));
  }

  let endpoint = `/data/v1/data/${patient.userid}`;
  if (appConfig.CBG_BUCKETS_ENABLED) {
    endpoint = `/data/v1/dataV2/${patient.userid}`;
  }
  const dataURL = new URL(endpoint, appConfig.API_HOST);

  if (options) {
    if (options.withPumpSettings) {
      dataURL.searchParams.set("withPumpSettings", "true");
    }
    if (options.startDate) {
      dataURL.searchParams.set("startDate", options.startDate);
    }
    if (options.endDate) {
      dataURL.searchParams.set("endDate", options.endDate);
    }
  }

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

  return Promise.reject(errorFromHttpStatus(response, log));
}

/**
 * Get notes of a given patient
 * @param userId ID of the patient
 */
export async function getMessages(session: Session, patient: IUser, options?: GetPatientDataOptions): Promise<MessageNote[]> {
  const { sessionToken, traceToken } = session;
  const messagesURL = new URL(`/message/v1/notes/${patient.userid}`, appConfig.API_HOST);

  if (options) {
    if (options.startDate) {
      messagesURL.searchParams.set("starttime", options.startDate);
    }
    if (options.endDate) {
      messagesURL.searchParams.set("endtime", options.endDate);
    }
  }

  const response = await fetch(messagesURL.toString(), {
    method: "GET",
    headers: {
      [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
      [HttpHeaderKeys.traceToken]: traceToken,
      [HttpHeaderKeys.sessionToken]: sessionToken,
    },
  });

  if (response.ok) {
    return (await response.json()) as MessageNote[];
  } else if (response.status === HttpStatus.StatusNotFound) {
    // When the user has no message the api return a 404
    // We don't want to crash in that case
    return [];
  }

  return Promise.reject(errorFromHttpStatus(response, log));
}

/**
 * Get all messages for the given message thread
 * @param messageId The root note id
 */
export async function getMessageThread(session: Session, messageId: string): Promise<MessageNote[]> {
  const { sessionToken, traceToken } = session;
  const messageURL = new URL(`/message/v1/thread/${messageId}`, appConfig.API_HOST);
  const response = await fetch(messageURL.toString(), {
    method: "GET",
    headers: {
      [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
      [HttpHeaderKeys.traceToken]: traceToken,
      [HttpHeaderKeys.sessionToken]: sessionToken,
    },
  });

  if (response.ok) {
    const messages = (await response.json()) as MessageNote[] | undefined;
    if (!Array.isArray(messages)) {
      log.error("Expected an array of messages", { messages });
      Promise.reject(new Error("Invalid response"));
    }
    // Sort messages, so they are displayed in the right order.
    return _.sortBy(messages, (message: MessageNote) => Date.parse(message.timestamp));
  }

  return Promise.reject(errorFromHttpStatus(response, log));
}

/**
 * Create a new note
 * @param message The note to send
 */
export async function startMessageThread(session: Session, message: MessageNote): Promise<string> {
  const { sessionToken, traceToken } = session;
  const messageURL = new URL("/message/v1/send", appConfig.API_HOST);
  const response = await fetch(messageURL.toString(), {
    method: "POST",
    headers: {
      [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
      [HttpHeaderKeys.traceToken]: traceToken,
      [HttpHeaderKeys.sessionToken]: sessionToken,
    },
    body: JSON.stringify(message),
  });

  if (response.ok) {
    const result = (await response.json()) as { id: string };
    return result.id;
  }

  return Promise.reject(errorFromHttpStatus(response, log));
}

/**
 * reply to a message thread
 * @param message The note to send
 * @returns The id of the new message
 */
export async function replyMessageThread(session: Session, message: MessageNote): Promise<string> {
  return startMessageThread(session, message);
}

/**
 * Edit a message
 * @param message The note to send
 */
export async function editMessage(session: Session, message: MessageNote): Promise<void> {
  const { sessionToken, traceToken } = session;
  const messageURL = new URL("/message/v1/edit", appConfig.API_HOST);
  const response = await fetch(messageURL.toString(), {
    method: "PUT",
    headers: {
      [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
      [HttpHeaderKeys.traceToken]: traceToken,
      [HttpHeaderKeys.sessionToken]: sessionToken,
    },
    body: JSON.stringify(message),
  });

  if (response.ok) {
    return Promise.resolve();
  }
  return Promise.reject(errorFromHttpStatus(response, log));
}
