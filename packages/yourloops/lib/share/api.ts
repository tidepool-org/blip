/**
 * Copyright (c) 2021, Diabeloop
 * Direct patient / caregivers share API calls
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

import { UserInvitationStatus } from "../../models/generic";
import { UserRoles } from "../../models/shoreline";
import { HttpHeaderKeys } from "../../models/api";
import appConfig from "../config";
import { errorFromHttpStatus } from "../utils";
import { Session } from "../auth";
import { ShareUser, DirectShareAPI } from "./models";

const log = bows("ShareApi");

async function getDirectShares(session: Session): Promise<ShareUser[]> {
  log.info("getDirectShares");

  // await waitTimeout(100);
  const { sessionToken, traceToken, user } = session;

  const apiURL = new URL("/v0/direct-shares", appConfig.API_HOST);
  const response = await fetch(apiURL.toString(), {
    method: "GET",
    headers: {
      [HttpHeaderKeys.traceToken]: traceToken,
      [HttpHeaderKeys.sessionToken]: sessionToken,
    },
  });

  if (response.ok) {
    const directShares = (await response.json()) as DirectShareAPI[];
    const shareUsers: ShareUser[] = [];
    if (Array.isArray(directShares)) {
      for (let i=0; i<directShares.length; i++) {
        const directShare = directShares[i];
        const directShareWith = directShare.patient ?? directShare.viewer;
        if (_.isNil(directShareWith)) {
          continue;
        }

        const shareUser: ShareUser = {
          status: UserInvitationStatus.accepted,
          user: {
            userid: directShareWith.userId,
            preferences: directShareWith.preferences ?? undefined,
            profile: directShareWith.profile ?? undefined,
            settings: directShareWith.settings ?? undefined,
            username: directShareWith.email,
            emails: [directShareWith.email],
            role: user.role === UserRoles.patient ? UserRoles.caregiver : UserRoles.patient,
          },
        };
        shareUsers.push(shareUser);
      }
    }
    log.debug(shareUsers);
    return shareUsers;
  }

  return Promise.reject(errorFromHttpStatus(response, log));
}

async function addDirectShare(session: Session, email: string): Promise<void> {
  const { sessionToken, traceToken, user } = session;
  log.info("addDirectShare", email);

  const apiURL = new URL(`/confirm/send/invite/${user.userid}`, appConfig.API_HOST);
  const response = await fetch(apiURL.toString(), {
    method: "POST",
    headers: {
      [HttpHeaderKeys.traceToken]: traceToken,
      [HttpHeaderKeys.sessionToken]: sessionToken,
    },
    body: JSON.stringify({ email }),
  });

  if (response.ok) {
    return response.json();
  }
  // TODO: 409 Conflict -> already pending invitation
  return Promise.reject(errorFromHttpStatus(response, log));
}

async function removeDirectShare(session: Session, userId: string): Promise<void> {
  const { sessionToken, traceToken, user } = session;
  log.info("removeDirectShare", userId);

  let apiURL: URL;
  if (user.role === UserRoles.patient) {
    apiURL = new URL(`/crew/v0/direct-share/${user.userid}/${userId}`, appConfig.API_HOST);
  } else {
    apiURL = new URL(`/crew/v0/direct-share/${userId}/${user.userid}`, appConfig.API_HOST);
  }

  const response = await fetch(apiURL.toString(), {
    method: "DELETE",
    headers: {
      [HttpHeaderKeys.traceToken]: traceToken,
      [HttpHeaderKeys.sessionToken]: sessionToken,
    },
  });

  if (response.ok) {
    log.info("removeDirectShare", await response.json());
    return Promise.resolve();
  }
  return Promise.reject(errorFromHttpStatus(response, log));
}

export default {
  getDirectShares,
  addDirectShare,
  removeDirectShare,
};
