import React from 'react';
import PropTypes from 'prop-types';
import InfoRoundedIcon from '@material-ui/icons/InfoRounded';
import { Text, Flex, FlexProps } from 'rebass/styled-components';

import {
  usePopupState,
  bindHover,
  bindPopover,
  bindToggle,
} from 'material-ui-popup-state/hooks';

import Popover from './Popover';
import { Icon } from './Icon';

const PopoverLabel = props => {
  const {
    icon,
    iconLabel,
    iconFontSize,
    id,
    label,
    popoverContent: PopoverContent,
    popoverProps,
    triggerOnHover,
    ...wrapperProps
  } = props;

  const popupState = usePopupState({
    disableAutoFocus: true,
    variant: 'popover',
    popupId: id,
  });

  return (
    <React.Fragment>
      <Flex alignItems="center" color="text.primary" bg="inherit" {...wrapperProps}>
        {label && <Text mr={2}>{label}</Text>}
        <Icon
          label={iconLabel}
          icon={icon}
          fontSize={iconFontSize}
          {...(triggerOnHover ? bindHover(popupState) : bindToggle(popupState))}
        />
      </Flex>

      <Popover {...bindPopover(popupState)} useHoverPopover={triggerOnHover} {...popoverProps}>
        {React.cloneElement(PopoverContent, {})}
      </Popover>
    </React.Fragment>
  );
};

PopoverLabel.propTypes = {
  ...FlexProps,
  icon: PropTypes.elementType.isRequired,
  iconLabel: PropTypes.string.isRequired,
  iconFontSize: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  popoverContent: PropTypes.node,
  triggerOnHover: PropTypes.bool,
  popoverProps: PropTypes.object,
};

PopoverLabel.defaultProps = {
  icon: InfoRoundedIcon,
  iconLabel: 'more info',
  iconFontSize: '1em',
  triggerOnHover: false,
  popoverProps: { width: '25em' },
};

export default PopoverLabel;
