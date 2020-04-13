import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { default as Base, PaginationProps } from '@material-ui/lab/Pagination';
import { borders, colors, space } from '../../themes/baseTheme';

const StyledPagination = styled(Base)``;

export const Pagination = props => {
  return <StyledPagination {...props} />;
};

Pagination.propTypes = {
  ...PaginationProps,
};

export default Pagination;
