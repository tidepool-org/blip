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

import React from "react";
import bows from "bows";

import { useAuth } from "../auth";

import BlipApi from "./blip-api";

export interface DataContext {
  blipApi: BlipApi | null;
}

export interface DataProvider {
  children: React.ReactNode;
  context: () => DataContext;
}

const log = bows("DataHook");
export function DefaultDataContext(): DataContext {
  const authHook = useAuth();
  const [blipApi, setBlipApi] = React.useState<BlipApi | null>(null);

  const hooksInitialized = authHook.initialized();

  React.useEffect(() => {
    if (hooksInitialized) {
      if (blipApi === null) {
        log.debug("Creating BlipApi");
        setBlipApi(new BlipApi(authHook));
      } else {
        log.debug("Updating BlipApi");
        blipApi.authContext = authHook;
      }
    }
  }, [hooksInitialized, blipApi, authHook]);

  return { blipApi };
}

const ReactDataContext = React.createContext<DataContext>({} as DataContext);

/**
 * Provider component that wraps your app and makes auth object available to any child component that calls useData().
 * @param props for data provider & children
 */
export function DataContextProvider(props: DataProvider): JSX.Element {
  const { context, children } = props;
  const dataContext = context();
  return <ReactDataContext.Provider value={dataContext}>{children}</ReactDataContext.Provider>;
}

/**
 * Hook for child components to get the data functionalities
 *
 * Trigger a re-render when it change.
 */
export function useData(): DataContext {
  return React.useContext(ReactDataContext);
}
