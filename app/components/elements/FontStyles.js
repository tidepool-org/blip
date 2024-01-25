import React from 'react';
import { Heading, Text } from 'theme-ui';

export function Headline(props) {
  return <Heading as="h2" variant="headline" {...props} />;
}
export function Title(props) {
  return <Heading as="h3" variant="title" {...props} />;
}
export function MediumTitle(props) {
  return <Heading as="h3" variant="mediumTitle" {...props} />;
}
export function Subheading(props) {
  return <Heading as="h4" variant="subheading" {...props} />;
}
export function Body0(props) {
  return <Text as="p" variant="body0" {...props} />;
}
export function Body1(props) {
  return <Text as="p" variant="body1" {...props} />;
}
export function Body2(props) {
  return <Text as="p" variant="body2" {...props} />;
}
export function Paragraph1(props) {
  return <Text as="p" variant="paragraph1" {...props} />;
}
export function Paragraph2(props) {
  return <Text as="p" variant="paragraph2" {...props} />;
}
export function Caption(props) {
  return <Text variant="caption" {...props} />;
}
