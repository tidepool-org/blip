/**
 * Copyright (c) 2021, Diabeloop
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
import NotifAPIImpl from "./api";
import { INotification, NotificationAPI, NotificationContext, NotificationProvider } from "./models";
import { useAuth } from "../auth/hook";

const ReactNotificationContext = React.createContext<NotificationContext>({} as NotificationContext);
const log = bows("NotificationHook");

/** hackish way to prevent 2 or more consecutive loading */
let lock = false;

function NotificationContextImpl(api: NotificationAPI): NotificationContext {
  const authHook = useAuth();
  const [receivedInvitations, setReceivedInvitations] = React.useState<INotification[]>([]);
  const [sentInvitations, setSentInvitations] = React.useState<INotification[]>([]);
  const [initialized, setInitialized] = React.useState(false);
  const session = authHook.session();

  if (session === null) {
    throw new Error("User must be logged-in to use the Notification hook");
  }

  const update = (): void => {
    setInitialized(false);
  };

  const accept = async (notification: INotification): Promise<void> => {
    log.info("Accept invitation", notification);
    await api.acceptInvitation(session, notification);
    const r = await api.getReceivedInvitations(session);
    setReceivedInvitations(r);
  };

  const decline = async (notification: INotification): Promise<void> => {
    log.info("Decline invitation", notification);
    await api.declineInvitation(session, notification);
    const r = await api.getReceivedInvitations(session);
    setReceivedInvitations(r);
  };

  const cancel = async (notification: INotification): Promise<void> => {
    log.info("Cancel invitation", notification);
    await api.cancelInvitation(session, notification);
    const r = await api.getSentInvitations(session);
    setSentInvitations(r);
  };

  const initHook = () => {
    if (initialized || lock) {
      return;
    }

    log.info("init");
    lock = true;

    Promise.all([
      api.getReceivedInvitations(session),
      api.getSentInvitations(session),
    ]).then((result: [INotification[], INotification[]]) => {
      setReceivedInvitations(result[0]);
      setSentInvitations(result[1]);
    }).catch((reason: unknown) => {
      log.error(reason);
    }).finally(() => {
      setInitialized(true);
      lock = false;
    });
  };

  React.useEffect(initHook, [session, initialized, api]);

  return {
    initialized,
    receivedInvitations,
    sentInvitations,
    update,
    accept,
    decline,
    cancel,
  };
}

// Hook for child components to get the  object
// and re-render when it changes.
export function useNotification(): NotificationContext {
  return React.useContext(ReactNotificationContext);
}

/**
 *
 */
export function NotificationContextProvider(props: NotificationProvider): JSX.Element {
  const { children, api, value } = props;
  const notifValue = value ?? NotificationContextImpl(api ?? NotifAPIImpl); // eslint-disable-line new-cap
  return (
    <ReactNotificationContext.Provider value={notifValue}>
      {children}
    </ReactNotificationContext.Provider>
  );
}
