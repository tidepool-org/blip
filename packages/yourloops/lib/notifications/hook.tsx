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

import * as React from "react";
import bows from "bows";
import NotifAPIImpl from "./api";
import { INotification, NotificationAPI, NotificationContext, NotificationProvider, NotificationType } from "./models";
import { useAuth } from "../auth/hook";
import { Session } from "../auth/models";

const ReactNotificationContext = React.createContext<NotificationContext>({} as NotificationContext);
const log = bows("NotificationHook");
/** hackish way to prevent 2 or more consecutive loading */
let lock = false;

function NotificationContextImpl(api: NotificationAPI): NotificationContext {
  log.debug("enter notificatin hook");
  const authHook = useAuth();
  const [count, setCount] = React.useState(0);

  const isLoggedIn = authHook.isLoggedIn();

  const getPendingInvitations = async (userId: string | undefined): Promise<INotification[]> => {
    log.debug("Get pending invitations for: ", userId);
    if (userId === undefined) {
      throw new Error("http-error-40x");
    }
    const session = authHook.session() as Session;
    const results: INotification[] = await api.getPendingInvitations(session, userId);
    setCount(results.length);
    return Promise.resolve(results);
  };

  const accept = async (id: string, creatorId: string | undefined, targetId: string | undefined, type: NotificationType): Promise<void> => {
    log.debug("accept ", type, " invitation for user: ", creatorId);
    if (creatorId === undefined) {
      throw new Error("http-error-40x");
    }

    const session = authHook.session() as Session;
    await api.accept(session, id, creatorId, targetId, type);
    setCount((count) => { return count > 0 ? count-1 : 0; });
  };

  const decline = async (id:string, creatorId: string | undefined, targetId: string | undefined, type: NotificationType): Promise<void> => {
    log.debug("decline ", type, " invitation for user: ", creatorId);
    if (creatorId === undefined) {
      throw new Error("http-error-40x");
    }

    const session = authHook.session() as Session;
    await api.decline(session, id, creatorId, targetId, type);
    setCount((count) => { return count > 0 ? count-1 : 0; });
  };

  const initHook = () => {
    log.info("init", lock);
    if (lock === false) {
      lock = true;
      if (isLoggedIn) {
        const session = authHook.session() as Session;
        api
          .getPendingInvitations(session, session?.user?.userid)
          .then((notifs: INotification[]) => {
            setCount(notifs.length);
          })
          .catch((reason: unknown) => {
            log.error("failed init", reason);
          });
      }
      lock = false;
    }
  };

  React.useEffect(initHook, [authHook, isLoggedIn, api]);

  return {
    count,
    getPendingInvitations,
    accept,
    decline,
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
