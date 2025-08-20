import React from 'react';
import PropTypes from 'prop-types';
import { Box, Label, BoxProps } from 'theme-ui';
import ReactSelect, { createFilter } from 'react-select';
import cx from 'classnames';
import intersectionBy from 'lodash/intersectionBy';
import map from 'lodash/map';
import noop from 'lodash/noop';

import { fontWeights, colors } from '../../themes/baseTheme';
import { Caption } from './FontStyles';
import i18next from '../../core/language';

const t = i18next.t.bind(i18next);

const selectElementStyleOverrides = {
  option: base => ({ ...base, paddingLeft: '4px', paddingRight: '4px', fontSize: 14, color: colors.blueGreyDark }),
  placeholder: base => ({ ...base, fontSize: 14, color: colors.blueGreyMedium }),
  groupHeading: base => ({ ...base, textTransform: 'none', fontWeight: 'normal', paddingLeft: '4px', paddingRight: '0' }),
  menu: base => ({ ...base, top: 'unset' }),
  menuList: base => ({ ...base, padding: '10px' }),
  multiValue: base => ({ ...base, borderRadius: '3px', background: colors.blueGreyDark, border: 'none' }),
  multiValueLabel: base => ({ ...base, borderRadius: '0', color: colors.white }),
  input: base => ({ ...base, color: colors.blueGreyDark, fontSize: 14 }),
  control: (base, { isFocused, isDisabled }) => ({
    ...base,
    borderRadius: '3px',
    '&:hover': { borderColor: undefined },
    backgroundColor: isDisabled ? colors.lightestGrey : colors.white,
    color: isDisabled ? colors.primarySubdued : colors.text.primary,
    borderColor: isFocused // eslint-disable-line no-nested-ternary
      ? colors.border.focus
      : isDisabled
        ? colors.lightestGrey
        : '#DFE2E6',
    boxShadow: isFocused ? `0 0 0 1px ${colors.border.focus}` : base.boxShadow,
  }),
  group: base => ({
    ...base,
    marginLeft: '12px',
    marginRight: '12px',
    '&:nth-of-type(2)': { borderTop: `1px solid ${colors.blueGray10}` },
  }),
  multiValueRemove: base => ({
    ...base,
    borderRadius: '3px',
    color: colors.white,
    '&:hover': { background: 'none', cursor: 'pointer', color: colors.white },
  }),
};

export function MultiSelect(props) {
  const {
    disabled,
    innerRef,
    name,
    label,
    value: valueProp,
    variant,
    onMenuClose,
    onMenuOpen,
    onChange: onChangeProp,
    options,
    themeProps,
    width,
    required,
    selectMenuHeight,
    setFieldValue,
    error,
    ...selectProps
  } = props;

  const classNames = cx({ disabled, error, empty: valueProp === '' });
  const inputClasses = cx({
    error,
    required,
  });

  return (
    <Box width={['100%', '75%', '50%']} {...themeProps}>
      {label && (
        <Label htmlFor={name}>
          <Caption
            sx={{
              fontWeight: fontWeights.medium,
              fontSize: 1,
            }}
            className={inputClasses}
          >
            {label}
          </Caption>
        </Label>
      )}

      <Box alignItems="center" className={classNames} variant="inputs.select.multi" sx={{ border: 0 }}>
        <ReactSelect
          {...selectProps}
          styles={selectElementStyleOverrides}
          value={intersectionBy(
            options,
            map(valueProp.split(','), value => ({ value })),
            'value'
          )}
          onChange={selections => {
            const { value } = selections?.[0] || {};

            // Sort the values so that we can accurately check see if the form values have changed
            const sortedValue = map(selections, item => item.value).sort().join(',');
            setFieldValue(name, sortedValue);
            onChangeProp(value);
          }}
          onMenuClose={onMenuClose}
          onMenuOpen={onMenuOpen}
          options={options}
          closeMenuOnSelect={false}
          minMenuHeight={selectMenuHeight}
          maxMenuHeight={selectMenuHeight}
          filterOption={createFilter({ stringify: opt => opt.label })}
          isMulti
          isClearable
          ref={innerRef}
        />
      </Box>

      {error && (
        <Caption ml={2} mt={2} className={inputClasses}>
          {error}
        </Caption>
      )}
    </Box>
  );
}

MultiSelect.propTypes = {
  innerRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  isDisabled: PropTypes.bool,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  value: PropTypes.string,
  themeProps: PropTypes.shape(BoxProps),
  onChange: PropTypes.func.isRequired,
  onMenuClose: PropTypes.func.isRequired,
  onMenuOpen: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  placeholder: PropTypes.string.isRequired,
  required: PropTypes.bool,
  selectMenuHeight: PropTypes.number,
  setFieldValue: PropTypes.func.isRequired,
  error: PropTypes.string,
};

MultiSelect.displayName = 'MultiSelect';

MultiSelect.defaultProps = {
  themeProps: {},
  placeholder: t('Select one or more'),
  onChange: noop,
  onMenuClose: noop,
  onMenuOpen: noop,
  selectMenuHeight: 240,
};

export default MultiSelect;
