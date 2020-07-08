import React from 'react';
import Styled from 'styled-components';
import { Heading, Text, Link } from 'rebass/styled-components';

import {
  borders,
  colors,
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  space,
} from '../../themes/baseTheme';

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
  font-size: ${fontSizes[6]}px;
  line-height: ${lineHeights[1]};
  font-weight: ${fontWeights.regular};
  font-family: ${fonts.default};
  padding: 0;
  color: ${colors.text.primary};
`;

export const Display1 = Styled(H1)`
  font-size: ${fontSizes[5]}px;
  line-height: ${lineHeights[1]};
  font-weight: ${fontWeights.regular};
  font-family: ${fonts.default};
  padding: 0;
  color: ${colors.text.primary};
`;

export const Headline = Styled(H2)`
  font-size: ${fontSizes[4]}px;
  line-height: ${lineHeights[2]};
  font-weight: ${fontWeights.regular};
  font-family: ${fonts.default};
  color: ${colors.text.primary};
`;

export const Title = Styled(H3)`
  font-size: ${fontSizes[3]}px;
  line-height: ${lineHeights[3]};
  font-weight: ${fontWeights.regular};
  font-family: ${fonts.default};
  color: ${colors.text.primary};
`;

export const MediumTitle = Styled(Title)`
  font-weight: ${fontWeights.medium};
`;

export const Subheading = Styled(H4)`
  font-size: ${fontSizes[2]}px;
  line-height: ${lineHeights[4]};
  font-weight: ${fontWeights.medium};
  font-family: ${fonts.default};
  color: ${props => (props.color ? props.color : colors.text.primary)};
`;

export const Body2 = Styled(Text)`
  font-size: ${fontSizes[2]}px;
  line-height: ${lineHeights[3]};
  font-family: ${fonts.default};
  color: ${props => (props.color ? props.color : colors.text.primary)};
`;

export const Body1 = Styled(Text)`
  font-size: ${fontSizes[1]}px;
  line-height: ${lineHeights[3]};
  font-family: ${fonts.default};
  color: ${props => (props.color ? props.color : colors.text.primary)};
`;

export const Paragraph2 = Styled(Body2)`
  margin-bottom: 1em;
  &:last-child {
    margin-bottom: 0;
  }
`;

export const Paragraph1 = Styled(Body1)`
  margin-bottom: 1em;
  &:last-child {
    margin-bottom: 0;
  }
`;

export const Caption = Styled(Text)`
  font-size: ${fontSizes[0]}px;
  line-height: ${lineHeights[4]};
  font-family: ${fonts.default};
  color: ${props => (props.color ? props.color : colors.text.primary)};
  &.error {
    color: ${colors.feedback.danger}
  }
  &.warning {
    color: ${colors.feedback.warning}
  }
  &.required::after {
    content: ' *';
    display: inline;
  }
`;

export const NavigationLink = Styled(Link)`
  font-size: ${fontSizes[1]}px;
  margin: 0;
  font-family: ${fonts.default};
  line-height: ${lineHeights[0]};
  font-weight: ${fontWeights.regular};
  color: ${colors.text.primary};
  &:hover {
    color: ${colors.text.link};
    box-shadow: none;
    text-decoration: none;
  }
`;

export const OrderedList = Styled('ol')`
  margin: 0;
  li {
    margin-bottom: 0.5em;
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

export const DropdownGroupHeader = Styled(Text)`
  font-size: ${fontSizes[1]}px;
  margin: 0;
  font-family: ${fonts.default};
  line-height: ${lineHeights[0]};
  font-weight: ${fontWeights.regular};
  color: ${colors.text.primary};
  &:hover {
    color: ${colors.text.link};
    box-shadow: none;
    text-decoration: none;
  }
`;

export const TextLinkDisabled = Styled(Text)`
  color: ${colors.text.link};
  cursor: pointer;
  line-height: ${lineHeights[0]};
  font-family: ${fonts.default};
  &:hover {
    color: ${colors.text.link};
    text-decoration: none;
  }
`;

export const TextLinkStyle = Styled(Link)`
  color: ${colors.text.primary};
  font-family: ${fonts.default};
  &:hover {
    color: ${colors.text.link};
    text-decoration: none;
  }
`;

export const BlockQuote = Styled.blockquote`
  border-left: ${borders.default};
  font-weight: ${fontWeights.regular};
  margin-left: 0;
  padding-left: 32px;
  border-width: 4px;
  border-color: ${colors.indigo};
  & div:last-child {
    margin-bottom: 0;
  }
`;

export const BadgeFont = Styled(Text)`
  font-size: ${fontSizes[0]}px;
  font-weight: ${fontWeights.medium};
  line-height: ${lineHeights[0]};
  font-family: ${fonts.monospace};
  padding: 2px ${space[1]}px 3px ${space[1]}px;
  height: auto;
  text-transform: uppercase;
  vertical-align: baseline;
`;
