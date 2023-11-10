import React from 'react';
import { Heading, Text } from 'theme-ui';

export const Headline = props => <Heading as="h2" variant="headline" {...props} />;
export const Title = props => <Heading as="h3" variant="title" {...props} />;
export const MediumTitle = props => <Heading as="h3" variant="mediumTitle" {...props} />;
export const Subheading = props => <Heading as="h4" variant="subheading" {...props} />;
export const Body0 = props => <Text as="p" variant="body0" {...props} />;
export const Body1 = props => <Text as="p" variant="body1" {...props} />;
export const Body2 = props => <Text as="p" variant="body2" {...props} />;
export const Paragraph1 = props => <Text as="p" variant="paragraph1" {...props} />;
export const Paragraph2 = props => <Text as="p" variant="paragraph2" {...props} />;
export const Caption = props => <Text variant="caption" {...props} />;
