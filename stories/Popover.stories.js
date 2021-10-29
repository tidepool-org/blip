import React, { useState } from 'react';

import { action } from '@storybook/addon-actions';
import { withDesign } from 'storybook-addon-designs';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import { ThemeProvider } from 'styled-components';
import { Text, Box, Flex } from 'rebass/styled-components';
import DeleteForeverRoundedIcon from '@material-ui/icons/DeleteForeverRounded';
import EditRoundedIcon from '@material-ui/icons/EditRounded';
import KeyboardArrowDownRoundedIcon from '@material-ui/icons/KeyboardArrowDownRounded';
import CheckRoundedIcon from '@material-ui/icons/CheckRounded';
import find from 'lodash/find';
import map from 'lodash/map';

import {
  usePopupState,
  bindHover,
  bindPopover,
  bindTrigger,
} from 'material-ui-popup-state/hooks';

import baseTheme from '../app/themes/baseTheme';
import Popover from '../app/components/elements/Popover';
import PopoverMenu from '../app/components/elements/PopoverMenu';
import { Icon } from '../app/components/elements/Icon';
import InfoRoundedIcon from '@material-ui/icons/InfoRounded';
import { Paragraph1, Subheading } from '../app/components/elements/FontStyles';

import { DialogContent, DialogActions } from '../app/components/elements/Dialog';
import Button from '../app/components/elements/Button';
import RadioGroup from '../app/components/elements/RadioGroup';

/* eslint-disable max-len */

// Wrap each story component with the base theme
const withTheme = Story => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Popovers',
  decorators: [withDesign, withKnobs, withTheme],
};

export const Simple = () => {
  const onHover = () => boolean('Trigger On Hover', false);

  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'demoPopover',
  });

  return (
    <React.Fragment>
      <Text color="text.primary">
        <Icon
          label="info"
          icon={InfoRoundedIcon}
          {...(onHover() ? bindHover(popupState) : bindTrigger(popupState))}
        />
      </Text>

      <Popover width="20em" {...bindPopover(popupState)}>
        <Box p={3}>
          <Subheading>
            Insulin Sensitivity Factor
          </Subheading>
          <Paragraph1>
            <Text color="text.primarySubdued">
              The insulin sensitivity factor (ISF) governs the expected drop in blood glucose given one unit of insulin.
            </Text>
          </Paragraph1>
        </Box>
      </Popover>
    </React.Fragment>
  );
};

Simple.story = {
  name: 'Simple',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=51%3A379',
    },
  },
};

export const FilterMenu = () => {
  const initialFilterText = 'Search by';

  const [filterText, setFilterText] = useState(initialFilterText);
  const [filterActive, setFilterActive] = useState(false);
  const [selected, setSelected] = useState();

  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'demoPopover',
  });

  const radioOptions = [
    { value: 'email', label: 'Email Address' },
    { value: 'id', label: 'User ID' },
    { value: 'clinic', label: 'Clinic' },
  ];

  const handleSubmit = () => {
    popupState.close();
    setFilterActive(!!selected);
    let newFilterText = initialFilterText;
    if (selected) newFilterText += `: ${find(radioOptions, { value: selected }).label}`;
    setFilterText(newFilterText);
  };

  const handleClear = () => {
    popupState.close();
    setFilterActive(false);
    setSelected();
    setFilterText(initialFilterText);
  };

  const handleFilterChange = event => {
    setSelected(event.target.value);
  };

  return (
    <React.Fragment>
      <Button
        variant="filter"
        active={filterActive}
        {...bindTrigger(popupState)}
        icon={KeyboardArrowDownRoundedIcon}
        iconLabel="Search By"
      >
        {filterText}
      </Button>

      <Popover width="15em" {...bindPopover(popupState)}>
        <DialogContent px={2} py={3} dividers>
          <RadioGroup
            id="my-filters-group"
            name="my-filters"
            options={radioOptions}
            value={selected}
            onChange={handleFilterChange}
            variant="vertical"
          />
        </DialogContent>
        <DialogActions justifyContent="flex-end" p={1}>
          <Button fontSize={0} variant="textSecondary" onClick={handleClear}>
            Clear
          </Button>
          <Button fontSize={0} variant="textPrimary" onClick={handleSubmit}>
            Apply
          </Button>
        </DialogActions>
      </Popover>
    </React.Fragment>
  );
};

FilterMenu.story = {
  name: 'FilterMenu',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=51%3A379',
    },
  },
};

export const JumpMenu = () => {
  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'jumpMenu',
  });

  const menuOptions = [
    { id: null, label: 'Personal Workspace' },
    { id: 'clinicXYZ', label: 'XYZ Health\'s Workspace' },
  ];

  const [selected, setSelected] = useState(menuOptions[0]);
  const [filterText, setFilterText] = useState(selected.label);

  const handleSelect = option => {
    setSelected(option);
    setFilterText(option.label);
    popupState.close();
  };

  return (
    <Flex width="400px" justifyContent="center">
      <Button
        variant="textPrimary"
        color="text.primary"
        fontSize={2}
        {...bindTrigger(popupState)}
        icon={KeyboardArrowDownRoundedIcon}
        iconLabel="Search By"
      >
        {filterText}
      </Button>

      <Popover
        width="15em"
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        {...bindPopover(popupState)}
      >
        <Box py={2}>
          {map(menuOptions, (option, key) => (
            <Button
              variant="textPrimary"
              color="text.primary"
              width="100%"
              py={2}
              px={3}
              justifyContent="space-between"
              key={key}
              fontSize={2}
              icon={option.id === selected.id ? CheckRoundedIcon : null}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </Button>
          ))}
        </Box>
      </Popover>
    </Flex>
  );
};

JumpMenu.story = {
  name: 'JumpMenu',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=51%3A379',
    },
  },
};

export const ActionList = () => {
  const items = [
    {
      icon: EditRoundedIcon,
      iconLabel: 'Edit',
      iconPosition: 'left',
      id: 'edit',
      variant: 'actionListItem',
      onClick: action('"Edit" called'),
      text: 'Edit item details',
    },
    {
      icon: DeleteForeverRoundedIcon,
      iconLabel: 'Delete',
      iconPosition: 'left',
      id: 'delete',
      variant: 'actionListItemDanger',
      onClick: action('"Delete" called'),
      text: 'Delete item',
    },
  ];

  return (
    <PopoverMenu
      ml="200px"
      id="action-menu"
      items={items}
    />
  );
};

ActionList.story = {
  name: 'ActionList',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=51%3A379',
    },
  },
};
