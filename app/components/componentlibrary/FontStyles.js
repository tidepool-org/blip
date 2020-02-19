import React from 'react';
import Styled from 'styled-components';
import { Heading, Text, Link } from 'rebass';
import baseTheme from '../../themes/baseTheme';
import colorPalette from '../../themes/colorPalette';
import { NavLink } from 'react-router-dom';

// base theme:
// space: [0, 4, 8, 16, 32, 64, 128],
// fontSizes: [12, 14, 16, 20, 24, 36, 48],

export const H1 = props => (
  <Heading {...props} as="h1">
    {props.children}
  </Heading>
);

export const H2 = props => (
  <Heading {...props} as="h2">
    {props.children}
  </Heading>
);

export const H3 = props => (
  <Heading {...props} as="h3">
    {props.children}
  </Heading>
);

export const H4 = props => (
  <Heading {...props} as="h4">
    {props.children}
  </Heading>
);

export const Display2 = Styled(H1)`

font-size: ${baseTheme.fontSizes[6]}px;
line-height: 60px;
font-weight: 400;
font-family: BasisMedium, Helvetica, Ariel, sans-serif;
padding: 0;
color: ${baseTheme.colors.primaryFont};
`;

export const Display1 = Styled(H1)`

font-size: ${baseTheme.fontSizes[5]}px;
line-height:  44px;
font-weight: 400;
font-family: BasisMedium, Helvetica, Ariel, sans-serif;
padding: 0;
color: ${baseTheme.colors.primaryFont};

`;

export const Headline = Styled(H2)`

font-size: ${baseTheme.fontSizes[4]}px;
line-height: 32px;
font-weight: 400;
font-family: BasisMedium, Helvetica, Ariel, sans-serif;
color: ${baseTheme.colors.primaryFont};
`;

export const Title = Styled(H3)`

font-size: 18px;
line-height:  30px;
font-weight: 400;
font-family: BasisMedium, Helvetica, Ariel, sans-serif;
color: ${baseTheme.colors.primaryFont};
`;

export const Subheading = Styled(H4)`

font-size: ${baseTheme.fontSizes[2]}px;
line-height: 28px;
font-weight: 400;
font-family: BasisMedium, Helvetica, Ariel, sans-serif;

color: ${props => (props.color ? props.color : baseTheme.colors.primaryFont)};


`;
export const Body2 = Styled(Text)`

font-size: ${baseTheme.fontSizes[2]}px;
line-height: 28px;
font-family: BasisMedium, Helvetica, Ariel, sans-serif;
color: ${baseTheme.colors.primaryFont};
margin-block-start: 0em;
margin-block-end: 1em;
&.m0 {
  margin: 0;
}

`;

export const Body1 = Styled(Text)`

font-size: ${baseTheme.fontSizes[1]}px;
line-height: 24px;
font-family: BasisMedium, Helvetica, Ariel, sans-serif;
margin-block-start: 1em;
margin-block-end: 1em;
margin-bottom: 1em;
color: ${props => (props.color ? props.color : baseTheme.colors.primaryFont)};

`;

export const Caption = Styled(Text)`

font-size: ${baseTheme.fontSizes[0]}px;
line-height: 20px;
font-family: BasisMedium, Helvetica, Ariel, sans-serif;
color: ${props => (props.color ? props.color : baseTheme.colors.primaryFont)};

`;

export const NavigationLink = Styled(Link)`
  font-size: ${baseTheme.fontSizes[1]}px;
  margin: 0;
  font-family: BasisMedium, Helvetica, Ariel, sans-serif;
  line-height: 14px;
  font-weight: 400;
  color: ${baseTheme.colors.primaryFont};

  &:hover {
    color: ${baseTheme.colors.linkFont};
    box-shadow: none;
    text-decoration: none;
  }
`;

export const DropdownGroupHeader = Styled(Text)`
  font-size: ${baseTheme.fontSizes[1]}px;
  margin: 0;
  font-family: BasisMedium, Helvetica, Ariel, sans-serif;
  line-height: 14px;
  font-weight: 400;
  color: ${baseTheme.colors.primaryFont};

  &:hover {
    color: ${baseTheme.colors.linkFont};
    box-shadow: none;
    text-decoration: none;
  }
  `;

export const TextLinkDisabled = Styled(Text)`
color: ${baseTheme.colors.linkFont};
cursor: pointer;
line-height: 20px;
&:hover {
  color: ${baseTheme.colors.linkFont};
  text-decoration: none;
}
font-family: BasisMedium, Helvetica, Ariel, sans-serif;

`;

export const TextLinkStyle = Styled(Link)`
color: ${baseTheme.colors.primaryFont};
&:hover {
  color: ${baseTheme.colors.linkFont};
  text-decoration: none;
}
font-family: BasisMedium, Helvetica, Ariel, sans-serif;
`;

export const ButtonFont = Styled(Text)`

font-size: ${baseTheme.fontSizes[2]}px;
font-weight: 400;
line-height: 14px;
font-family: BasisMedium, Helvetica, Ariel, sans-serif;
padding: ${baseTheme.space[0]}px ${baseTheme.space[2]}px;
height: auto;

`;

export const BlockQuote = Styled.blockquote`

border-left: ${baseTheme.border};
font-weight: normal;
margin-left: 0;
padding-left: 32px;
border-width: 4px;
border-color: ${colorPalette.colors.indigos[4]};
& div:last-child {
  margin-bottom: 0;
}
`;
export const BadgeFont = Styled(Text)`

font-size: ${baseTheme.fontSizes[0]}px;
font-weight: 500;
line-height: 12px;
font-family: BasisMono;
padding: 2px ${baseTheme.space[1]}px 3px ${baseTheme.space[1]}px ;
height: auto;
text-transform: uppercase;
vertical-align: baseline;
`;

export const TopNavLink = Styled(NavLink)`
  font-size: ${baseTheme.fontSizes[1]}px;
  margin: 0;
  font-family: BasisMedium, Helvetica, Ariel, sans-serif;
  line-height: 14px;
  font-weight: 400;
  color: ${baseTheme.colors.primaryFont};
  text-decoration: none;

  &:hover {
    color: ${baseTheme.colors.linkFont};
    box-shadow: none;
    text-decoration: none;
  }
`;

export const TextLink = Styled(Link)`
color: ${baseTheme.colors.linkFont};
text-decoration: none;

line-height: 20px;
&:hover {
  color: ${baseTheme.colors.linkFont};
  text-decoration: none;
}
font-family: BasisMedium, Helvetica, Ariel, sans-serif;
`;

// Markdown extended components
