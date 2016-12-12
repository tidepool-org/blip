import React from 'react';

import { storiesOf } from '@kadira/storybook';

import Tooltip from '../../../../src/components/common/tooltips/Tooltip';

const props = {
  title: <span style={{ padding: '5px', display: 'block' }}>Title</span>,
  content: <span style={{ fontSize: '15px', display: 'block', padding: '5px' }}>Some Content</span>,
  position: { top: 200, left: 200 },
};

const refDiv = (
  <div
    style={{
      position: 'absolute',
      width: '3px',
      height: '3px',
      top: '199px',
      left: '199px',
      backgroundColor: 'red',
      zIndex: '1',
    }}
  />
);

storiesOf('Tooltip', module)
  .add('defaults', () => (
    <div>
      {refDiv}
      <Tooltip {...props} />
    </div>
  ))
  .add('offset -5,-5', () => (
    <div>
      {refDiv}
      <Tooltip {...props} offset={{ top: -5, left: -5 }} />
    </div>
  ))
  .add('borderColor', () => (
    <div>
      {refDiv}
      <Tooltip {...props} borderColor={'blue'} />
    </div>
  ))
  .add('borderWidth', () => (
    <div>
      {refDiv}
      <Tooltip {...props} borderWidth={3} />
    </div>
  ))
  .add('tailWidth', () => (
    <div>
      {refDiv}
      <Tooltip {...props} tailWidth={10} />
    </div>
  ))
  .add('tailHeight', () => (
    <div>
      {refDiv}
      <Tooltip {...props} tailHeight={4} />
    </div>
  ))
  .add('no content', () => (
    <div>
      {refDiv}
      <Tooltip {...props} content={null} />
    </div>
  ))
  .add('no title', () => (
    <div>
      {refDiv}
      <Tooltip {...props} title={null} />
    </div>
  ))
  .add('no tail', () => (
    <div>
      {refDiv}
      <Tooltip {...props} tail={false} />
    </div>
  ))
  .add('no tail, no title', () => (
    <div>
      {refDiv}
      <Tooltip {...props} tail={false} title={null} />
    </div>
  ))
  .add('no tail, no title, offset -10,0', () => (
    <div>
      {refDiv}
      <Tooltip {...props} tail={false} title={null} offset={{ left: -10, top: 0 }} />
    </div>
  ))
  .add('no tail, on right', () => (
    <div>
      {refDiv}
      <Tooltip {...props} tail={false} side={'right'} />
    </div>
  ))
  .add('tail, on right', () => (
    <div>
      {refDiv}
      <Tooltip {...props} side={'right'} />
    </div>
  ))
  .add('tail, on right, offset 5,5', () => (
    <div>
      {refDiv}
      <Tooltip {...props} side={'right'} offset={{ top: 5, left: 5 }} />
    </div>
  ))
  .add('tail, on right, no content', () => (
    <div>
      {refDiv}
      <Tooltip {...props} side={'right'} content={null} />
    </div>
  ))
  .add('tail, on right, no title', () => (
    <div>
      {refDiv}
      <Tooltip {...props} side={'right'} title={null} />
    </div>
  ))
  .add('top, no tail', () => (
    <div>
      {refDiv}
      <Tooltip {...props} side={'top'} tail={false} />
    </div>
  ))
  .add('top, no tail, no title', () => (
    <div>
      {refDiv}
      <Tooltip {...props} side={'top'} tail={false} title={null} />
    </div>
  ))
  .add('top, no tail, no title, offset 0,-10', () => (
    <div>
      {refDiv}
      <Tooltip {...props} side={'top'} tail={false} title={null} offset={{ left: 0, top: -10 }} />
    </div>
  ))
  .add('top, no tail, no content', () => (
    <div>
      {refDiv}
      <Tooltip {...props} side={'top'} tail={false} content={null} />
    </div>
  ))
  .add('bottom, no tail', () => (
    <div>
      {refDiv}
      <Tooltip {...props} side={'bottom'} tail={false} />
    </div>
  ))
  .add('bottom, no tail, no title', () => (
    <div>
      {refDiv}
      <Tooltip {...props} side={'bottom'} tail={false} title={null} />
    </div>
  ))
  .add('bottom, no tail, no content', () => (
    <div>
      {refDiv}
      <Tooltip {...props} side={'bottom'} tail={false} content={null} />
    </div>
  ));
