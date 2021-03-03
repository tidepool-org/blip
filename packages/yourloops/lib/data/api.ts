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
import bows from "bows";
import _ from "lodash";

import { PatientData } from "models/device-data";
import { MessageNote, MessagesThread } from "models/message";
import { HttpHeaderKeys, HttpHeaderValues } from "../../models/api";
import { User, UserRoles } from "../../models/shoreline";

import HttpStatus from "../http-status-codes";
import appConfig from "../config";
import { t } from "../language";
import { errorFromHttpStatus } from "../utils";
import { Session } from "../auth";

const log = bows("data-api");

export async function loadPatientData(session: Session, patient: User): Promise<PatientData> {
  const { sessionToken, traceToken } = session;
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

  return Promise.reject(errorFromHttpStatus(response, log));
}

/**
 * Get notes of a given patient
 * @param userId ID of the patient
 */
export async function getMessages(session: Session, userId: string): Promise<MessageNote[]> {
  const { sessionToken, traceToken } = session;
  const messagesURL = new URL(`/message/notes/${userId}`, appConfig.API_HOST);
  const response = await fetch(messagesURL.toString(), {
    method: "GET",
    headers: {
      [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
      [HttpHeaderKeys.traceToken]: traceToken,
      [HttpHeaderKeys.sessionToken]: sessionToken,
    },
  });

  if (response.ok) {
    const result = (await response.json()) as MessagesThread;
    if (Array.isArray(result.messages)) {
      return result.messages;
    }
    return [];
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
  const messageURL = new URL(`/message/thread/${messageId}`, appConfig.API_HOST);
  const response = await fetch(messageURL.toString(), {
    method: "GET",
    headers: {
      [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
      [HttpHeaderKeys.traceToken]: traceToken,
      [HttpHeaderKeys.sessionToken]: sessionToken,
    },
  });

  if (response.ok) {
    const out = (await response.json()) as MessagesThread | undefined;
    const messages: MessageNote[] = out?.messages ?? [];
    if (!Array.isArray(messages)) {
      log.error("Expected an array of messages", { messages });
      Promise.reject(new Error("Invalid response"));
    }
    // Sort messages, so they are displayed in the right order.
    const sortedMessages = _.sortBy(messages, (message: MessageNote) => Date.parse(message.timestamp));
    // const sortedMessages = _.sortBy(messages, (message: MessageNote) => {
    //   return _.isEmpty(message.parentmessage) ? -1 : Date.parse(message.timestamp);
    // });
    return sortedMessages;
  }

  return Promise.reject(errorFromHttpStatus(response, log));
}

/**
 * Create a new note
 * @param message The note to send
 */
export async function startMessageThread(session: Session, message: MessageNote): Promise<string> {
  const { sessionToken, traceToken } = session;
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
  const { sessionToken, traceToken } = session;
  const messageURL = new URL(`/message/reply/${message.parentmessage}`, appConfig.API_HOST);
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
    const result = (await response.json()) as { id: string };
    return result.id;
  }

  return Promise.reject(errorFromHttpStatus(response, log));
}

/**
 * Edit a message
 * @param message The note to send
 */
export async function editMessage(session: Session, message: MessageNote): Promise<void> {
  const { sessionToken, traceToken } = session;
  const messageURL = new URL(`/message/edit/${message.id}`, appConfig.API_HOST);
  const response = await fetch(messageURL.toString(), {
    method: "PUT",
    headers: {
      [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
      [HttpHeaderKeys.traceToken]: traceToken,
      [HttpHeaderKeys.sessionToken]: sessionToken,
    },
    body: JSON.stringify({ message }),
  });

  if (response.ok) {
    return Promise.resolve();
  }
  return Promise.reject(errorFromHttpStatus(response, log));
}
