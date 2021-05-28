import React from 'react';
import PropTypes from 'prop-types';
import MoreHorizRoundedIcon from '@material-ui/icons/MoreHorizRounded';
import CircularProgress from '@material-ui/core/CircularProgress';
import map from 'lodash/map';
import get from 'lodash/get';
import noop from 'lodash/noop';

import {
  usePopupState,
  bindPopover,
  bindTrigger,
} from 'material-ui-popup-state/hooks';

import Button from './Button';
import Popover from './Popover';
import { Icon } from './Icon';

const PopoverMenu = props => {
  const {
    anchorOrigin,
    icon,
    iconLabel,
    id,
    items,
    popoverWidth,
    transformOrigin,
    ...triggerProps
  } = props;

  const popupState = usePopupState({
    disableAutoFocus: true,
    variant: 'popover',
    popupId: id,
  });

  return (
    <React.Fragment>
      <Icon
        color="text.primary"
        label="info"
        icon={icon}
        variant="button"
        active={popupState.isOpen}
        {...triggerProps}
        {...bindTrigger(popupState)}
      />

      <Popover
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        {...bindPopover(popupState)}
      >
        {map(items, item => (
          <Button
            disabled={item.disabled}
            icon={item.processing ? CircularProgress : item.icon}
            iconLabel={item.iconLabel}
            iconPosition={item.iconPosition}
            id={item.id}
            key={item.id}
            variant={item.variant}
            onClick={get(item, 'onClick', noop).bind(null, popupState)}
          >
            {item.text}
          </Button>
        ))}
      </Popover>
    </React.Fragment>
  );
};

PopoverMenu.propTypes = {
  anchorOrigin: PropTypes.shape({
    horizontal: PropTypes.string.isRequired,
    vertical: PropTypes.string.isRequired,
  }).isRequired,
  icon: PropTypes.elementType.isRequired,
  iconLabel: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    disabled: PropTypes.bool,
    icon: PropTypes.elementType,
    iconLabel: PropTypes.string,
    iconPosition: PropTypes.oneOf(['left', 'right']).isRequired,
    id: PropTypes.string.isRequired,
    variant: PropTypes.oneOf(['actionListItem', 'actionListItemDanger']).isRequired,
    onClick: PropTypes.func,
    processing: PropTypes.bool,
    text: PropTypes.string.isRequired,
  })).isRequired,
  popoverWidth: PropTypes.string.isRequired,
  transformOrigin: PropTypes.shape({
    horizontal: PropTypes.string.isRequired,
    vertical: PropTypes.string.isRequired,
  }).isRequired,
};

PopoverMenu.defaultProps = {
  anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
  icon: MoreHorizRoundedIcon,
  iconLabel: 'more actions',
  popoverWidth: 'auto',
  transformOrigin: { vertical: 'top', horizontal: 'right' },
};

export default PopoverMenu;
