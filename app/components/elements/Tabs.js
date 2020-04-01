import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, BoxProps } from 'rebass/styled-components';
import { default as TabsBase } from '@material-ui/core/Tabs';
import { default as TabBase } from '@material-ui/core/Tab';
import cx from 'classnames';

const StyledTab = styled(Box)`

`;

export const Tab = props => {
  const { icon: TabElement, label, ...buttonProps } = props;
  const as = props.variant === 'icons.button' ? 'button' : 'span';

  const classNames = cx({
    disabled: props.disabled,
  });

  return (
    <StyledTab
      as={as}
      aria-label={label}
      className={classNames}
      {...buttonProps}
    >
      <TabElement />
    </StyledTab>
  );
};

Tab.propTypes = {
  ...BoxProps,
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
};

Tab.defaultProps = {
  variant: 'icons.static',
};

export default Tab;
