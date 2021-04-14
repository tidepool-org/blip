/**
 * Copyright (c) 2021, Diabeloop
 * Zendesk helper
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

/**
 * @returns true if zendesk is active
 */
export function isZendeskActive(): boolean {
  return typeof window.zE === "function";
}

/**
 * Ask zendesk to login the user
 *
 * Login routine is implemented in `templates/zendesk.js`
 */
export function zendeskLogin(): void {
  if (isZendeskActive()) {
    window.zE("webWidget", "helpCenter:reauthenticate");
  }
}

/**
 * Logout the user for zendesk
 */
export function zendeskLogout(): void {
  if (isZendeskActive()) {
    window.zE("webWidget", "logout");
    window.zE("webWidget", "clear");
    window.zE("webWidget", "reset");
  }
}

/**
 * @param allow true if zendesk can use cookies
 */
export function zendeskAllowCookie(allow: boolean): void {
  if (isZendeskActive()) {
    window.zE('webWidget', 'updateSettings', { cookies: allow });
  }
}

/**
 * Set the zendesk language
 * @param lang Language code
 */
export function zendeskLocale(lang: string): void {
  if (isZendeskActive()) {
    window.zE("webWidget", "setLocale", lang);
  }
}
