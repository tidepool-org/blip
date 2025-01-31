import React, { useEffect } from 'react';
import _ from 'lodash';
import { setNavbarChartType } from '../../redux/actions/sync';
import { useDispatch } from 'react-redux';

const NavbarChartTypeSetter = ({ chartType }) => {
  const dispatch = useDispatch();

  // The Navbar needs to know the chartType to render its contents. However, the Navbar
  // sits at a higher level on the component tree than PatientData. This component only
  // exists to pass chartType up to redux whenever the value in PatientData changes.
  useEffect(() => {
    dispatch(setNavbarChartType(chartType || null));

    return () => dispatch(setNavbarChartType(null));
  }, [chartType]);

  return null;
};

export default NavbarChartTypeSetter;