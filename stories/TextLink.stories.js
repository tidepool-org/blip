import React from 'react';

import { withDesign } from 'storybook-addon-designs';
import { withKnobs, text } from '@storybook/addon-knobs';
import { ThemeProvider } from 'styled-components';
import { Link as RebassLink, Text } from 'rebass/styled-components';
import { TextLink as StyledLink } from '../app/components/elements/FontStyles';

import baseTheme from '../app/themes/baseTheme';
import TextLink from '../app/components/elements/TextLink';

const withTheme = Story => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Text Link',
  component: TextLink,
  decorators: [withDesign, withKnobs, withTheme],
};

const linkText = () => text('Link Text', 'Link Text');
const link = () => text('URL', '');

export const TextLinkStory = () => (
  <React.Fragment>

    <Text backgroundColor="text.primary" fontSize={3}>
      {'Blah Blah Blah '}

      {/* TextLink component is wrapped in 2 divs, so will disrupt inline text flow */}
      {/* Also, cannot style it via theme colors or variants */}
      <TextLink
        mx={3}
        linkText={linkText()}
        variant="links.inverted"
        color="white"
        sx={{ color: 'white' }}
        link={link()}
      />
      {' Blah Blah Blah '}
    </Text>

    {/* Variants and color props won't work with styled component link -- will not be underlined or green */}
    <StyledLink mx={3} color="green" variant="links.underlined" href={link()}>
      {linkText()}
    </StyledLink>

    <RebassLink href={link()}>
      {linkText()}
    </RebassLink>

    <Text backgroundColor="text.primary" fontSize={3}>
      {'Blah Blah Blah '}
      <RebassLink variant="links.inverted" href={link()}>
        {linkText()}
      </RebassLink>
      {' Blah Blah Blah '}
    </Text>

    <Text lineHeight={3} fontSize={5}>
      {'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Deserunt quasi obcaecati iure sapiente eaque. Similique repellendus sequi iusto cupiditate magni nisi dolorum provident velit in, '}
      <RebassLink variant="links.underlined" href={link()}>
        {linkText()}
      </RebassLink>
      {' explicabo dolor nobis optio autem?'}
    </Text>

    <RebassLink href={link()} color="orange" variant="links.underlined">
      {linkText()}
    </RebassLink>
  </React.Fragment>
);

TextLinkStory.story = {
  name: 'Basic Link',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System-Sprint-1?node-id=986%3A140',
    },
  },
};
