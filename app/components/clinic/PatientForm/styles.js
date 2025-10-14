import { colors } from '../../../themes/baseTheme';

export const selectElementStyleOverrides = {
  placeholder: base => ({ ...base, fontSize: 14, color: colors.blueGreyMedium }),
  groupHeading: base => ({ ...base, textTransform: 'none', fontWeight: 'normal', paddingLeft: '4px', paddingRight: '0' }),
  menu: base => ({ ...base, top: 'unset' }),
  multiValue: base => ({ ...base, borderRadius: '3px', background: colors.blueGreyDark, border: 'none' }),
  multiValueLabel: base => ({ ...base, borderRadius: '0', color: colors.white }),
  input: base => ({ ...base, color: colors.blueGreyDark, fontSize: 14 }),
  singleValue: base => ({ ...base, color: colors.blueGreyDark, fontSize: 14 }),
  option: (base, state) => {
    const styles = {
      ...base,
      paddingLeft: '4px',
      paddingRight: '4px',
      fontSize: 14,
      color: colors.blueGreyDark,
    };

    if (state.isSelected) {
      styles.backgroundColor = colors.white;
    }

    return styles;
  },
  control: base => ({
    ...base,
    borderRadius: '3px',
    border: '1px solid #DFE2E6',
    '&:hover': { border: '1px solid #DFE2E6' },
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
