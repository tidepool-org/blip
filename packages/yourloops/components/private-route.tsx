/**
 * Copyright (c) 2021, Diabeloop
 * A wrapper for <Route> that redirects to the login
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
import { Redirect, Route, RouteProps } from "react-router-dom";
import { useAuth } from "../lib/auth/hook/use-auth";

/**
 * Perform a redirect if you are not authenticated yet
 * @param props RouteProps with the component to render.
 */
function PrivateRoute(props: RouteProps): JSX.Element {
  const auth = useAuth();
  const { component, ...rest } = props;

  if (typeof component === "undefined") {
    throw new Error("PrivateRoute: Invalid component");
  }

  const RenderComponent = (routeProps: RouteProps): JSX.Element => {
    if (auth.isLoggedIn()) {
      const Component = component as React.ComponentType<unknown>;
      return <Component {...routeProps} />;
    }
    return <Redirect to={{ pathname: "/", state: { from: routeProps.location } }} />;
  };

  return <Route {...rest} render={RenderComponent} />;
}

export default PrivateRoute;
