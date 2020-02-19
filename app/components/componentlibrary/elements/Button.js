import React from 'react';
import { Button as Base, Flex } from 'rebass';
import { Link } from 'react-router-dom';
import Styled from 'styled-components';
import PropTypes from 'prop-types';
import baseTheme from '../../../themes/baseTheme';
import { ButtonFont } from '../FontStyles';

const ButtonComponent = Styled(Base)`
color: #fff;
pointer: cursor;
border-radius: 4px;
padding-right: ${baseTheme.space[4]}px;
padding-left: ${baseTheme.space[4]}px;
padding-bottom: ${baseTheme.space[2]}px;
padding-top: ${baseTheme.space[2]}px;
font-size: ${baseTheme.fontSizes[0]}px;
line-height: 14px;
font-family: BasisMedium;


background-color: ${baseTheme.colors.mediumPurple};
height: 32px;
transition: ${baseTheme.transition};
border: 1px solid ${baseTheme.colors.mediumPurple};
cursor: pointer;
white-space: nowrap;

a {color: #fff;}


&:hover {

  background-color: #fff;
   ${ButtonFont}{
    color: ${baseTheme.colors.mediumPurple};

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
  border: solid 1px ${baseTheme.colors.lightGrey};
  background-color: transparent;
}



&.outline {
border: solid 1px ${baseTheme.colors.lightGrey};
background-color: transparent;

}

&.outline:hover {
border-color: ${baseTheme.colors.mediumPurple};

}

&.outline ${ButtonFont}{

  color: ${baseTheme.colors.mediumPurple};

}

&.bold {
  border: solid 1px ${baseTheme.colors.coral};
  background-color: ${baseTheme.colors.coral};
}

&.bold:hover{
  background-color: ${baseTheme.colors.orange};

}

&.bold ${ButtonFont}{
 color: ${baseTheme.colors.white};
}

&.bold:hover ${ButtonFont}{
  color: #fff;
}

&.small {
  padding-right: ${baseTheme.space[2]}px;
  padding-left: ${baseTheme.space[2]}px;
}

&.large {
  height: 44px;

}


`;

const WrapperLink = Styled(Link)`


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

// Full Button with logic -- was failing with storybook commented out for now
// Error: Invariant failed: You should not use <Link> outside a <Router>

// class Button extends React.PureComponent {
//   render() {
//     return (
//       <Flex {...this.props} px={this.props.outsidePadding ? this.props.outsidePadding : this.props.px}>
//         {!this.props.disabled ? (
//           <WrapperLink width={1} to={this.props.to}>
//             <ButtonComponent width={[1, 1, 1, 'auto']} className={this.props.className}>
//               <Flex width={1} justifyContent="center" alignItems="center">
//                 <Flex>
//                   <ButtonFont>{this.props.text !== 'Default' ? this.props.text : this.props.children}</ButtonFont>
//                 </Flex>
//               </Flex>
//             </ButtonComponent>
//           </WrapperLink>
//         ) : (
//           <ButtonComponent width={[1, 1, 1, 'auto']} className={this.props.className}>
//             <Flex width={1} justifyContent="center" alignItems="center">
//               <Flex>
//                 <ButtonFont>{this.props.text !== 'Default' ? this.props.text : this.props.children}</ButtonFont>
//               </Flex>
//             </Flex>
//           </ButtonComponent>
//         )}
//       </Flex>
//     );
//   }
// }

Button.propTypes = {
  text: PropTypes.string,
  className: PropTypes.string,
  to: PropTypes.string
};

Button.defaultProps = {
  text: 'Default',
  className: '',
  to: '/'
};

/** @component */
export default Button;
