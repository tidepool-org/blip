import React, { useEffect } from 'react';
import _ from 'lodash';
import { setNavbarChartType } from '../../redux/actions/sync';
import { useDispatch } from 'react-redux';

const NavbarChartTypeSetter = ({ chartType }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setNavbarChartType(chartType || null));

    return () => dispatch(setNavbarChartType(null));
  }, [chartType]);

  return null;
};

export default NavbarChartTypeSetter;