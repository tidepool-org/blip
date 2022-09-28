import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Flex, Text, BoxProps, FlexProps } from 'rebass/styled-components';
import map from 'lodash/map';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import reduce from 'lodash/reduce';

import {
  usePopupState,
  bindHover,
  bindPopover,
} from 'material-ui-popup-state/hooks';

import Popover from './Popover';
import Icon from './Icon';
import baseTheme, { space, shadows } from '../../themes/baseTheme';

export const Tag = props => {
  const {
    id,
    icon,
    iconColor,
    iconLabel,
    iconPosition,
    iconFontSize,
    iconSrc,
    name,
    onClick,
    onClickIcon,
    onDoubleClick,
    variant,
    sx = {},
    ...themeProps
  } = props;

  const isLeftIcon = iconPosition === 'left';
  const flexDirection = isLeftIcon ? 'row-reverse' : 'row';

  const iconMargins = {
    left: isLeftIcon ? 0 : 1,
    right: isLeftIcon ? 1 : 0,
  };

  const styles = {
    cursor: (onClick || onDoubleClick) ? 'pointer' : 'default',
    ...sx,
  };

  return (
    <Flex
      id={id}
      variant={`tags.${variant}`}
      onClick={onClick?.bind(null, id)}
      onDoubleClick={onDoubleClick?.bind(null, id)}
      flexDirection={flexDirection}
      sx={styles}
      {...themeProps}
    >
      <Text className="tag-text" as="span">
        {name}
      </Text>

      {(icon || iconSrc) && (
        <Icon
          onClick={onClickIcon?.bind(null, id)}
          tabIndex={-1}
          className="icon"
          fontSize={iconFontSize}
          mr={iconMargins.right}
          ml={iconMargins.left}
          theme={baseTheme}
          variant={onClickIcon ? 'default' : 'static'}
          color={iconColor}
          icon={icon}
          iconSrc={iconSrc}
          label={iconLabel}
        />
      )}
    </Flex>
  );
};

Tag.propTypes = {
  ...BoxProps,
  icon: PropTypes.elementType,
  iconLabel: PropTypes.string,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  iconFontSize: PropTypes.string,
  iconSrc: PropTypes.string,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['default', 'compact']),
};

Tag.defaultProps = {
  iconPosition: 'right',
  iconFontSize: 'inherit',
  variant: 'default',
};

export const TagList = props => {
  const { tags, maxCharactersVisible, tagProps, ...themeProps } = props;

  const visibleTags = [];
  const hiddenTags = [];

  if (maxCharactersVisible) {
    reduce(tags, (remainingChars, { name = '' }, i) => {
      const tagArray = (name.length <= remainingChars) ? visibleTags : hiddenTags;
      tagArray.push(tags[i]);
      return remainingChars - name.length;
    }, maxCharactersVisible);
  } else {
    visibleTags.push(...tags);
  }

  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'demoPopover',
  });

  const anchorOrigin = useMemo(() => ({
    vertical: 'bottom',
    horizontal: 'center',
  }), []);

  const transformOrigin = useMemo(() => ({
    vertical: 'top',
    horizontal: 'center',
  }), []);

  const triggerFontSize = tagProps.variant === 'compact' ? '10px' : '12px';

  return (
    <Flex
      className="tag-list"
      alignItems="center"
      flexWrap="wrap"
      sx={{ gap: 1 }}
      {...themeProps}
    >
      {map(visibleTags, tag => (
        <Tag
          id={tag.id}
          key={tag.id}
          name={tag.name}
          {...tagProps}
        />
      ))}

      {!!hiddenTags.length && (
        <React.Fragment>
          <Text
            className="tag-overflow-trigger"
            color="text.primary"
            fontWeight="medium"
            fontFamily="default"
            fontSize={triggerFontSize}
            lineHeight="normal"
            whiteSpace="nowrap"
            sx={{ cursor: 'default' }}
            {...bindHover(popupState)}
          >
            +{hiddenTags.length}
          </Text>

          <Popover
            useHoverPopover
            anchorOrigin={anchorOrigin}
            transformOrigin={transformOrigin}
            marginTop={`${space[2]}px`}
            boxShadow={shadows.small}
            {...bindPopover(popupState)}
          >
            <Flex
              classname="tag-list-overflow"
              maxWidth="250px"
              alignItems="center"
              flexWrap="wrap"
              p={1}
              sx={{ gap: 1 }}
            >
              {map(hiddenTags, tag => (
                <Tag
                  id={tag.id}
                  key={tag.id}
                  name={tag.name}
                  {...tagProps}
                />
              ))}
            </Flex>
          </Popover>
        </React.Fragment>
      )}
    </Flex>
  );
};

TagList.propTypes = {
  ...FlexProps,
  maxCharactersVisible: PropTypes.number,
  tags: PropTypes.arrayOf(PropTypes.shape(pick(Tag.propTypes, ['name', 'id']))),
  tagProps: PropTypes.shape(omit(Tag.propTypes, ['name', 'id'])),
};

TagList.defaultProps = {
  tagVariant: 'default',
  tags: [],
  tagProps: {},
};

export default Tag;