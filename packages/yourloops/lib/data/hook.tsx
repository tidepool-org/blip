/**
 * Copyright (c) 2021, Diabeloop
 * Data API Hook
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
import _ from "lodash";
import bows from "bows";

import { PatientData } from "models/device-data";
import { MessageNote } from "models/message";
import { User } from "../../models/shoreline";
import { AuthContext, useAuth } from "../auth";
import { t as translate } from "../language";
import sendMetrics from "../metrics";

import {
  loadPatientData as apiLoadPatientData,
  startMessageThread as apiStartMessageThread,
} from "./api";

const log = bows("DataHook");

export class PatientDataLoadedEvent extends Event {
  public user: User;
  public patientData: PatientData;

  constructor(user: User, patientData: PatientData) {
    super("patient-data-loaded");
    this.user = user;
    this.patientData = patientData;
  }
}
class BlipApi extends EventTarget {
  private authHook: AuthContext;
  public sendMetrics: (eventName: string, properties?: unknown) => void;

  constructor(authHook: AuthContext) {
    super();
    this.authHook = authHook;
    this.sendMetrics = sendMetrics;
  }

  public get whoami(): User | null {
    return _.cloneDeep(this.authHook.user);
  }

  public async loadPatientData(patient: User): Promise<PatientData> {
    const { traceToken, sessionToken } = this.authHook;
    if (traceToken !== null && sessionToken !== null) {
      this.dispatchEvent(new Event("patient-data-loading"));
      const patientData = await apiLoadPatientData(patient, traceToken, sessionToken);
      this.dispatchEvent(new PatientDataLoadedEvent(patient as User, patientData));
      return patientData;
    }
    return Promise.reject(new Error(translate("not-logged-in")));
  }

  public async startMessageThread(message: MessageNote): Promise<string> {
    log.debug("startMessageThread", message.userid);
    const { traceToken, sessionToken } = this.authHook;
    if (traceToken !== null && sessionToken !== null) {
      return apiStartMessageThread(message, traceToken, sessionToken);
    }
    return Promise.reject(new Error(translate("not-logged-in")));
  }
}

export interface DataContext {
  blipApi: BlipApi;
  loadPatientData: (patient: User) => Promise<PatientData>;
  startMessageThread: (message: MessageNote) => Promise<string>;
}

export interface DataProvider {
  children: React.ReactNode;
  context: () => DataContext;
}

export function DefaultDataContext(): DataContext {
  const authHook = useAuth();
  // const { t } = useTranslation("yourloops");
  const [blipApi] = React.useState<BlipApi>(new BlipApi(authHook));

  const loadPatientData = blipApi.loadPatientData.bind(blipApi);
  const startMessageThread = blipApi.startMessageThread.bind(blipApi);

  log.debug("DefaultDataContext");
  return {
    blipApi,
    loadPatientData,
    startMessageThread,
  };
}

const ReactDataContext = React.createContext<DataContext>({} as DataContext);

/**
 * Provider component that wraps your app and makes auth object available to any child component that calls useData().
 * @param props for data provider & children
 */
export function DataContextProvider(props: DataProvider): JSX.Element {
  const { context, children } = props;
  const dataContext = context();
  return (
    <ReactDataContext.Provider value={dataContext}>
      {children}
    </ReactDataContext.Provider>
  );
}

/**
 * Hook for child components to get the data functionalities
 *
 * Trigger a re-render when it change.
 */
export function useData(): DataContext {
  return React.useContext(ReactDataContext);
}
