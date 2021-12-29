/**
 * Copyright (c) 2021, Diabeloop
 * Blip API class to be used by blip v1
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

import { PatientData } from "models/device-data";
import MessageNote from "models/message";
import { IUser } from "../../models/shoreline";
import { User, AuthContext } from "../auth";
import { t as translate } from "../language";
import metrics from "../metrics";

import { GetPatientDataOptions, GetPatientDataOptionsV0 } from "./models";
import {
  getPatientDataV0 as apiGetPatientDataV0,
  getPatientDataRange as apiGetPatientDataRange,
  getPatientData as apiGetPatientData,
  startMessageThread as apiStartMessageThread,
  getMessageThread as apiGetMessageThread,
  getMessages as apiGetMessages,
  replyMessageThread as apiReplyMessageThread,
  editMessage as apiEditMessage,
} from "./api";

/**
 * Wrapper for blip v1 to be able to call the API
 */
class BlipApi {
  private log: Console;
  private authHook: AuthContext;
  public metrics: typeof metrics;

  constructor(authHook: AuthContext) {
    this.authHook = authHook;
    this.metrics = metrics;
    this.log = bows("BlipAPI");
  }

  public set authContext(context: AuthContext) {
    this.authHook = context;
  }

  public get whoami(): User | null {
    return this.authHook.user !== null ? new User(this.authHook.user) : null;
  }

  public getPatientDataRange(patient: IUser): Promise<string[] | null> {
    this.log.debug("getPatientDataRange", { userId: patient.userid });
    const session = this.authHook.session();
    if (session !== null) {
      return apiGetPatientDataRange(session, patient);
    }
    return Promise.reject(new Error(translate("not-logged-in")));
  }

  public getPatientData(patient: IUser, options?: GetPatientDataOptions): Promise<PatientData> {
    this.log.debug("getPatientData", { userId: patient.userid, options });
    const session = this.authHook.session();
    if (session !== null) {
      metrics.startTimer("load_data");
      return apiGetPatientData(session, patient, options).then((r) => {
        metrics.endTimer("load_data");
        return Promise.resolve(r);
      }).catch((r) => {
        metrics.endTimer("load_data");
        return Promise.reject(r);
      });
    }
    return Promise.reject(new Error(translate("not-logged-in")));
  }

  public getPatientDataV0(patient: IUser, options?: GetPatientDataOptionsV0): Promise<PatientData> {
    this.log.debug("getPatientDataV0", { userId: patient.userid, options });
    const session = this.authHook.session();
    if (session !== null) {
      return apiGetPatientDataV0(session, patient, options);
    }
    return Promise.reject(new Error(translate("not-logged-in")));
  }

  public getMessages(patient: IUser, options?: GetPatientDataOptions): Promise<MessageNote[]> {
    this.log.debug("getMessages", { userId: patient.userid, options });
    const session = this.authHook.session();
    if (session !== null) {
      return apiGetMessages(session, patient, options);
    }
    return Promise.reject(new Error(translate("not-logged-in")));
  }

  public getMessageThread(messageId: string): Promise<MessageNote[]> {
    this.log.debug("getMessageThread", { messageId });
    const session = this.authHook.session();
    if (session !== null) {
      return apiGetMessageThread(session, messageId);
    }
    return Promise.reject(new Error(translate("not-logged-in")));
  }

  public startMessageThread(message: MessageNote): Promise<string> {
    this.log.debug("startMessageThread", { userId: message.userid });
    const session = this.authHook.session();
    if (session !== null) {
      return apiStartMessageThread(session, message);
    }
    return Promise.reject(new Error(translate("not-logged-in")));
  }

  public replyMessageThread(message: MessageNote): Promise<string> {
    this.log.debug("replyMessageThread", { userId: message.userid });
    const session = this.authHook.session();
    if (session !== null) {
      return apiReplyMessageThread(session, message);
    }
    return Promise.reject(new Error(translate("not-logged-in")));
  }

  public editMessage(message: MessageNote): Promise<void> {
    this.log.debug("editMessage", { userId: message.userid });
    const session = this.authHook.session();
    if (session !== null) {
      return apiEditMessage(session, message);
    }
    return Promise.reject(new Error(translate("not-logged-in")));
  }
}

export default BlipApi;
