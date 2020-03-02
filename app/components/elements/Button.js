import React from 'react';
import { Button as Base, Flex } from 'rebass';
import Styled from 'styled-components';
import PropTypes from 'prop-types';

import { ButtonFont } from './FontStyles';

import {
  space,
  colors,
  fontSizes,
  transitions,
} from '../../themes/baseTheme';

const ButtonComponent = Styled(Base)`
  color: #fff;
  border-radius: 4px;
  padding-right: ${space[4]}px;
  padding-left: ${space[4]}px;
  padding-bottom: ${space[2]}px;
  padding-top: ${space[2]}px;
  font-size: ${fontSizes[0]}px;
  line-height: 14px;
  font-family: BasisMedium, Helvetica, Ariel, sans-serif;
  background-color: ${colors.purpleMedium};
  height: 32px;
  transition: ${transitions.easeOut};
  border: 1px solid ${colors.purpleMedium};
  cursor: pointer;
  white-space: nowrap;

  a {
    color: #fff;
  }

  &:hover {
    background-color: #fff;
    ${ButtonFont} {
      color: ${colors.purpleMedium};
    }
  }

  &:focus {
    box-shadow: none;
  }

  &.active {
    border: none;
    box-shadow: none;
  }

  &:active {
    border: solid 1px ${colors.lightGrey};
    background-color: transparent;
  }

  &.outline {
    border: solid 1px ${colors.lightGrey};
    background-color: transparent;
  }

  &.outline:hover {
    border-color: ${colors.purpleMedium};
  }

  &.outline ${ButtonFont} {
    color: ${colors.purpleMedium};
  }

  &.bold {
    border: solid 1px ${colors.coral};
    background-color: ${colors.coral};
  }

  &.bold:hover{
    background-color: ${colors.orange};
  }

  &.bold ${ButtonFont} {
    color: ${colors.white};
  }

  &.bold:hover ${ButtonFont} {
    color: #fff;
  }

  &.small {
    padding-right: ${space[2]}px;
    padding-left: ${space[2]}px;
  }

  &.large {
    height: 44px;
  }
`;

class Button extends React.PureComponent {
  render() {
    return (
      <Flex>
        <ButtonComponent width={[1, 1, 1, 'auto']} className={this.props.className}>
          <Flex width={1} justifyContent="center" alignItems="center">
            <Flex>
              <ButtonFont>{this.props.text !== 'Default' ? this.props.text : this.props.children}</ButtonFont>
            </Flex>
          </Flex>
        </ButtonComponent>
      </Flex>
    );
  }
}

Button.propTypes = {
  text: PropTypes.string,
  className: PropTypes.string,
  to: PropTypes.string,
};

Button.defaultProps = {
  text: 'Default',
  className: '',
  to: '/',
};

/** @component */
export default Button;
