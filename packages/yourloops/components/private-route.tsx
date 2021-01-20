// A wrapper for <Route> that redirects to the login

import * as React from "react";
import { Redirect, Route, RouteProps } from "react-router-dom";
import { useAuth } from "../lib/auth/hook/use-auth";

interface PrivateRouteProps extends RouteProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: any,
}

/**
 * Perform a redirect if you are not authenticated yet
 * @param props RouteProps with the component to render.
 */
function PrivateRoute(props: PrivateRouteProps): JSX.Element {
  const auth = useAuth();
  const { component: Component, ...rest } = props;

  const render = (routeProps: RouteProps) => {
    if (auth.isLoggedIn()) {
      return <Component {...routeProps} />;
    }
    return <Redirect to={{ pathname: "/", state: { from: routeProps.location } }} />;
  };

  return <Route {...rest} render={render} />;
}

export default PrivateRoute;
