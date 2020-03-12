import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

// import Checkbox from '@material-ui/core/Checkbox';

import {
  colors,
} from '../../themes/baseTheme';

// import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

const useStyles = makeStyles({
  root: {
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  icon: {
    borderRadius: 3,
    width: 16,
    height: 16,
    boxShadow: 'inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)',
    backgroundColor: '#f5f8fa',
    backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))',
    '$root.Mui-focusVisible &': {
      outline: '2px auto rgba(19,124,189,.6)',
      outlineOffset: 2,
    },
    'input:hover ~ &': {
      backgroundColor: '#ebf1f5',
    },
    'input:disabled ~ &': {
      boxShadow: 'none',
      background: 'rgba(206,217,224,.5)',
    },
  },
  checkedIcon: {
    backgroundColor: '#137cbd',
    backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))',
    '&:before': {
      display: 'block',
      width: 16,
      height: 16,
      backgroundImage:
        "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath" +
        " fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 " +
        "1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23fff'/%3E%3C/svg%3E\")",
      content: '""',
    },
    'input:hover ~ &': {
      backgroundColor: '#106ba3',
    },
  },
});

// Inspired by blueprintjs
function StyledCheckbox(props) {
  const classes = useStyles();

  return (
    <FormControlLabel
      value="LABEL"
      control={
        <Checkbox
          className={classes.root}
          disableRipple
          color="default"
          checkedIcon={<span className={clsx(classes.icon, classes.checkedIcon)} />}
          icon={<span className={classes.icon} />}
          inputProps={{ 'aria-label': 'decorative checkbox' }}
          {...props}
        />}
      label="Label"
      labelPlacement="end"
    />
  );
}

export const CheckboxMaterialUI = props => {

  const { disabled, name, label, checked, ...labelProps } = props;

  return (
    <div>
      <StyledCheckbox
        disabled={disabled}
        id={name}
        name={name}
        checked={checked}
        value="primary"
        inputProps={{ 'aria-label': 'primary checkbox' }}
      />
    </div>
  );
};

export default CheckboxMaterialUI;


// const StyledCheckbox = styled(Checkbox)`
//   color: ${colors.purpleMedium};
// `;

// export const CheckboxMaterialUI = props => {
//   const { disabled, name, label, checked, ...labelProps } = props;

//   return (
//     <StyledCheckbox
//       disabled={disabled}
//       id={name}
//       name={name}
//       checked={checked}
//       value="primary"
//       inputProps={{ 'aria-label': 'primary checkbox' }}
//     />
//   );
// };

// CheckboxMaterialUI.propTypes = {
//   name: PropTypes.string.isRequired,
//   label: PropTypes.string,
//   disabled: PropTypes.bool,
//   checked: PropTypes.bool,
// };

// CheckboxMaterialUI.defaultProps = {
//   width: [1/2, 1/4], // eslint-disable-line space-infix-ops
//   p: 1,
// };

// export default CheckboxMaterialUI;
