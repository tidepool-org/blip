import PrimaryNavBar from '../../components/primary-nav-bar';
import PatientData from '../patient-data';
import * as React from 'react';
import {
  Route, Switch,
} from "react-router-dom";

class Main extends React.Component {

  public render() : JSX.Element {
    return (
      <div>
        <PrimaryNavBar />

        <Switch>
          <Route exact path="/home/patients">
            <PatientData />
          </Route>
          <Route exact path="/home/careteams">
            {/* <Careteams /> */}
          </Route>
        </Switch>
      </div>
    );
  }
}

export default Main;
