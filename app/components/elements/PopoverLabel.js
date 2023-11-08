import React from 'react';
import PropTypes from 'prop-types';
import InfoRoundedIcon from '@material-ui/icons/InfoRounded';
import { Text, Flex, Box, FlexProps } from 'theme-ui';

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
    iconProps,
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
      <Flex sx={{ alignItems: 'center' }} color="text.primary" bg="inherit" {...wrapperProps}>
        {label && <Box mr={2}>{label}</Box>}
        <Icon
          label={iconLabel}
          icon={icon}
          {...iconProps}
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
  iconProps: PropTypes.object,
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  popoverContent: PropTypes.node,
  triggerOnHover: PropTypes.bool,
  popoverProps: PropTypes.object,
};

PopoverLabel.defaultProps = {
  icon: InfoRoundedIcon,
  iconLabel: 'more info',
  iconProps: { sx: { fontSize: '1em' } },
  triggerOnHover: false,
  popoverProps: { width: '25em' },
};

export default PopoverLabel;
