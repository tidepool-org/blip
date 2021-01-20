/**
 * Copyright (c) 2021, Diabeloop
 * A wrapper for <Route> that redirects to the login
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
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
