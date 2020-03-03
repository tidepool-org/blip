import React from 'react';

import { withDesign } from 'storybook-addon-designs';
import { withKnobs, boolean } from '@storybook/addon-knobs';

import Dialog from '../app/components/elements/Dialog';

// This silly decorator allows the components to properly re-render when knob values are changed
const withWrapper = Story => <Story />;

const getOpen = (open = true) => boolean('Initially Open', open);

const setOpen = open => {
  const isOpen = getOpen()
}

const withOpenButton = Story => (
  <React.Fragment>
    <button disabled={getOpen()} onClick={setOpen(true)}>
      Open Dialog
    </button>
    <Story />
  </React.Fragment>
);

export default {
  title: 'Dialogs',
  decorators: [withDesign, withKnobs, withOpenButton],
};

export const DialogStory = () => {
  return <Dialog
    id="confirmDialog"
    initialOpen={getOpen()}
    title="Hello"
  />;
};

DialogStory.story = {
  name: 'Confirmation',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=8%3A826',
    },
  },
};
