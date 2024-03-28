import React from 'react';
import PropTypes from 'prop-types';
import { Flex, FlexProps } from 'rebass/styled-components';

import {
  usePopupState,
  bindHover,
  bindPopover,
  bindToggle,
} from 'material-ui-popup-state/hooks';

import Popover from './Popover';

const PopoverElement = props => {
  const {
    disabled,
    id,
    keepOpenOnBlur,
    popoverContent: PopoverContent,
    popoverProps,
    triggerOnHover,
    children,
  } = props;

  const popupState = usePopupState({
    disableAutoFocus: true,
    variant: 'popover',
    popupId: id,
  });

  return disabled ? children : (
    <React.Fragment>
      <Flex {...(triggerOnHover ? bindHover(popupState) : bindToggle(popupState))}>
        {children}
      </Flex>

      <Popover
        {...bindPopover(popupState)}
        useHoverPopover={(triggerOnHover && !keepOpenOnBlur)}
        {...popoverProps}
      >
        {React.cloneElement(PopoverContent, {})}
      </Popover>
    </React.Fragment>
  );
};

PopoverElement.propTypes = {
  ...FlexProps,
  disabled: PropTypes.bool,
  id: PropTypes.string.isRequired,
  keepOpenOnBlur: PropTypes.bool,
  label: PropTypes.string,
  popoverContent: PropTypes.node,
  triggerOnHover: PropTypes.bool,
  popoverProps: PropTypes.object,
};

PopoverElement.defaultProps = {
  triggerOnHover: false,
  keepOpenOnBlur: false,
  popoverProps: { width: 'auto' },
};

export default PopoverElement;
