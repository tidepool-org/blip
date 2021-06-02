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
    id,
    label,
    popoverContent: PopoverContent,
    popoverWidth,
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
      <Flex color="text.primary" bg="white" {...wrapperProps}>
        {label && <Text mr={2}>{label}</Text>}
        <Icon
          label={iconLabel}
          icon={icon}
          {...(triggerOnHover ? bindHover(popupState) : bindToggle(popupState))}
        />
      </Flex>

      <Popover width={popoverWidth} {...bindPopover(popupState)}>
        {React.cloneElement(PopoverContent, {})}
      </Popover>
    </React.Fragment>
  );
};

PopoverLabel.propTypes = {
  ...FlexProps,
  icon: PropTypes.elementType.isRequired,
  iconLabel: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  popoverContent: PropTypes.node,
  popoverWidth: PropTypes.string.isRequired,
  triggerOnHover: PropTypes.bool,
};

PopoverLabel.defaultProps = {
  icon: InfoRoundedIcon,
  iconLabel: 'more info',
  popoverWidth: '25em',
  triggerOnHover: false,
};

export default PopoverLabel;
