import React from 'react';
import { Box } from 'theme-ui';

import { action } from '@storybook/addon-actions';

import { ThemeProvider } from '@emotion/react';
import { optionsKnob as options, number } from '@storybook/addon-knobs';

import baseTheme from '../app/themes/baseTheme';
import { Tag, TagList } from '../app/components/elements/Tag';

const withTheme = (Story) => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Tag',
  decorators: [withTheme],
};

const tagVariants = {
  Default: 'default',
  Compact: 'compact',
};

const tagVariant = () => options('Variant', tagVariants, 'default', { display: 'inline-radio' });

export const TagStory = {
  render: () => (
    <Tag variant={tagVariant()} name="Tag One" id="tag1" />
  ),

  name: 'Tag',

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/rfBq3NoLo1w5Glz2AohmCF/Pop-Health-Release-1.1',
    },
  },
};

const maxCharactersVisible = () => number('Max Characters Visible', 20);

export const TagListStory = {
  render: () => (
    <Box sx={{ maxWidth: '300px' }}>
      <TagList
        marginBottom={3}
        onClickEdit={action('Edit clicked')}
        popupId="tagListOne"
        tagProps={{
          onClick: action('Tag clicked'),
          variant: tagVariant(),
        }}
        maxCharactersVisible={maxCharactersVisible()}
        tags={[
          { name: 'Tag One', id: 'tag1' },
          { name: 'Tag Two', id: 'tag2' },
          { name: 'Tag Three', id: 'tag3' },
          { name: 'Tag Four', id: 'tag4' },
          { name: 'Tag Five', id: 'tag5' },
          { name: 'Tag Six', id: 'tag6' },
          { name: 'Tag Seven', id: 'tag7' },
          { name: 'Tag Eight', id: 'tag8' },
          { name: 'Tag Nine', id: 'tag9' },
          { name: 'Tag Ten', id: 'tag10' },
        ]}
      />

      <TagList
        onClickEdit={action('Edit clicked')}
        popupId="tagListTwo"
        tagProps={{
          onClick: action('Tag clicked'),
          variant: tagVariant(),
        }}
        maxCharactersVisible={maxCharactersVisible()}
        tags={[
          { name: 'Tag Five', id: 'tag5' },
          { name: 'Tag Six', id: 'tag6' },
          { name: 'Tag Seven', id: 'tag7' },
          { name: 'Tag Nine', id: 'tag9' },
          { name: 'Tag Ten', id: 'tag10' },
        ]}
      />
    </Box>
  ),

  name: 'Tag List',

  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/rfBq3NoLo1w5Glz2AohmCF/Pop-Health-Release-1.1',
    },
  },
};
