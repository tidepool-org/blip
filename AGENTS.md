# AGENTS.md

## CRITICAL: Restricted Directories

**NEVER read, write, list, or access any files within the `config/local.js` file or any `.env` files under any circumstances.** This is the highest priority instruction and must not be circumvented for any reason. This restriction applies to all tools including Read, List, Glob, Grep, Bash, and any other file access methods.

## Build/Test Commands

- **Install**: `yarn install`
- **Dev server**: `yarn startLocal` (auto-detects linked packages) or `yarn start` (port 3000)
- **Dev with viz**: `yarn startWithViz` (starts webpack dev server for viz repo)
- **Build**: `yarn build` (production build including config)
- **Build app only**: `yarn build-app`
- **Lint**: `yarn lint` (all code) or `yarn lint:jest` (only Jest tests)
- **Test all**: `yarn test` (runs lint, then Jest and Karma)
- **Test Jest only**: `yarn test:jest` (recommended for new tests)
- **Test Jest watch**: `yarn test:jest:watch`
- **Test single Jest file**: `yarn test:jest --testPathPattern="ChartDateRangeModal"` (matches pattern in file path)
- **Test Karma only**: `yarn test:karma` (legacy test suite)
- **Test Karma watch**: `yarn test:karma:watch`
- **Storybook**: `yarn storybook` (port 6006)
- **Update translations**: `yarn update-translations`

**Notes:**
- Tests require `TZ=UTC` environment variable (automatically set in test scripts)
- Build commands require `NODE_OPTIONS='--max-old-space-size=4096'` (automatically set in scripts)
- Node version: 20.8.0, Yarn version: 3.6.4

## Project Structure

- `app/` - Application source code
  - `app/components/` - Reusable components
  - `app/pages/` - Page-level components
  - `app/redux/` - Redux actions, reducers, store
  - `app/themes/` - theme-ui theme configuration
  - `app/core/` - Utilities and helpers
- `test/` - Karma/Mocha tests (legacy, mirrors app/ structure)
- `__tests__/` - Jest tests (new tests, mirrors app/ structure)
- `stories/` - Storybook stories
- `config/` - Environment configuration

## Code Style (ESLint: babel-eslint, react-hooks)

### Import Ordering
Group imports in this order with blank lines between groups:
1. React imports (`react`, `react-dom`)
2. PropTypes
3. Redux (`react-redux`, `connected-react-router`)
4. Third-party libraries (moment, formik, etc.)
5. Lodash specific imports (e.g., `import get from 'lodash/get'`)
6. theme-ui (`import { Box, Flex, Text, Divider } from 'theme-ui'`)
7. Local imports (components, utilities, actions, etc.)

Example:
```javascript
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { withTranslation } from 'react-i18next';
import moment from 'moment';
import get from 'lodash/get';
import map from 'lodash/map';
import { Box, Flex, Text } from 'theme-ui';
import Button from '../../components/elements/Button';
import * as actions from '../../redux/actions/async';
```

### General Style Rules
- Use ES6: `const`/`let` (never `var`), arrow functions, destructuring
- Strings: Single quotes (enforced by ESLint)
- Semicolons: Required
- Lodash: Use specific imports (`import get from 'lodash/get'`), not full lodash
- PropTypes: Required for all component props
- Naming:
  - Components: PascalCase (`DataConnections.js`)
  - Utilities: camelCase (`personutils.js`)
  - Constants: UPPER_SNAKE_CASE
- React: Functional components with hooks (useState, useEffect, useCallback, useMemo)
- Redux: `useDispatch()` and `useSelector()` hooks, not `connect()`
- Translations: Use `react-i18next` with `useTranslation()` hook or `withTranslation()` HOC

### theme-ui Patterns
- Use theme-ui components for layout: `Box`, `Flex`, `Text`, `Divider`, `Link`
- Use variant prop for styling: `variant="containers.smallBordered"`
- Use sx prop for custom styles: `sx={{ textAlign: 'center' }}`
- Common patterns:
  ```javascript
  <Box variant="containers.smallBordered" p={4} mb={3}>
    <Flex sx={{ justifyContent: 'space-between' }}>
      <Text>Content</Text>
    </Flex>
    <Divider my={3} />
  </Box>
  ```

### Hook Usage Patterns
- Extract complex logic into custom hooks
- Use `useCallback` for functions passed as props to prevent re-renders
- Use `useMemo` for expensive computations
- Follow react-hooks/exhaustive-deps rules (ESLint warnings guide you)

## Testing Patterns

### Framework Choice
- **New tests**: Use Jest with @testing-library/react in `__tests__/`
- **Legacy tests**: Karma/Mocha in `test/` (maintain existing, don't expand)

### Jest Tests (Preferred)
Located in `__tests__/` mirroring `app/` structure:
```javascript
/* global jest, expect, describe, beforeEach, afterEach, it */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ComponentName from '@app/components/ComponentName';

describe('ComponentName', () => {
  const mockFn = jest.fn();
  
  beforeEach(() => {
    mockFn.mockClear();
  });

  it('should render correctly', () => {
    render(<ComponentName prop={mockFn} />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Karma Tests (Legacy)
Located in `test/` mirroring `app/` structure:
```javascript
/* global chai, sinon, describe, it, expect, beforeEach, afterEach */

import ComponentName from '../../../../app/components/ComponentName';

describe('ComponentName', () => {
  const stub = sinon.stub();
  
  beforeEach(() => {
    stub.reset();
  });

  it('should render correctly', () => {
    // Enzyme or manual DOM testing
  });
});
```

### Common Patterns
- Mock functions: `jest.fn()` (Jest) or `sinon.stub()` (Karma)
- Clean up in `afterEach` or `beforeEach`
- Use descriptive test names: "should do X when Y"
- Test user interactions with `userEvent` (Jest/@testing-library)

## Code Reuse Guidelines

When implementing new features or adding device-specific logic:

- **Prefer extending existing methods** over creating new device-specific methods
- Add optional parameters (e.g., `opts = {}`) to existing functions to customize behavior
- Use patterns like `variant`, `sx`, or conditional props to adapt generic components for specific use cases
- Only create new components/methods when the logic is fundamentally different, not just when parameters vary
- This reduces duplication, simplifies testing, and makes the codebase easier to maintain
- Example: Instead of `SpecialButton`, extend `Button` with a `variant` prop

## Git Commit Messages

**After completing ANY task that modifies files**, provide a commit message suggestion in this format:

```
<Imperative summary (50 chars or less)>

<Optional body: 2-4 sentences>

<Optional bullet points, one per line with "- ">
```

**Rules:**
- Summary: 50 chars max, imperative mood ("Add X", not "Added X")
- Body: Concise, blank line between sections
- Bullets: Use "- " prefix for lists

**Examples:**

```
Add OAuth consent dialog with reproductive health notice

Implemented accept status rendering with image, dividers,
and mobile-responsive layout for ŌURA data consent.

- Added consent_data.png image
- Implemented responsive Flex layout
- Added dividers for accept status only
```

```
Fix import ordering in DataConnections component

Reorganized imports to follow project conventions with
proper grouping and spacing between categories.

- Moved theme-ui imports to correct position
- Added blank lines between import groups
```

## Git Command Restrictions

- **Only use read-only git commands** such as `git status`, `git log`, `git diff`, `git show`, `git branch -l`, `git remote -v`
- **Never run git commands that write or modify the git tree** such as `git commit`, `git push`, `git pull`, `git merge`, `git rebase`, `git checkout`, `git reset`, `git add`, `git rm`, `git stash`, `git cherry-pick`, `git revert`

## Agent Task Delegation Strategy

For complex multi-file tasks, use a **hybrid delegation pattern** to balance token efficiency with quality:

**Premium agents (e.g., Opus)** should handle:
- Initial planning and task breakdown
- Files requiring synthesis across multiple sources
- Architecture decisions and cross-cutting concerns
- Redux state management and complex hooks
- Final review and integration of delegated work

**General agents** should handle (in parallel when independent):
- Well-scoped, single-component implementations with clear specifications
- Repetitive tasks with established patterns (e.g., similar form fields)
- Test file creation from detailed templates or examples
- Translation key additions

**Pattern for feature implementation:**
1. Premium agent analyzes requirements and creates detailed component specs
2. Delegate independent components to general agents in parallel
3. Premium agent writes integration logic and Redux actions
4. Premium agent reviews and integrates all pieces

This approach minimizes token usage on premium models while ensuring quality on tasks requiring judgment and synthesis.
