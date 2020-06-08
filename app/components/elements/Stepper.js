import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Flex, Text, BoxProps, FlexProps } from 'rebass/styled-components';
import { default as Base, StepperProps } from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import get from 'lodash/get';
import map from 'lodash/map';
import omit from 'lodash/omit';
import isFunction from 'lodash/isFunction';
import cx from 'classnames';
import i18next from '../../core/language';

import Button from './Button';
import { colors, transitions } from '../../themes/baseTheme';
import { usePrevious } from '../../core/hooks';

const t = i18next.t.bind(i18next);

const StyledStepper = styled(Base)`
  font-size: inherit;
  font-weight: inherit;
  font-family: inherit;
  color: inherit;
  background-color: inherit;
  padding: initial;

  .MuiStepConnector-lineHorizontal::after {
    content: "";
    display: block;
    width: 100%;
    height: 3px;
    top: -2px;
    position: relative;
    background-color: ${colors.text.link};
    transition: ${transitions.easeOut};
  }

  .MuiStep-horizontal.active {
    ~ .MuiStep-horizontal .MuiStepConnector-lineHorizontal::after {
      width: 0;
    }
    + .MuiStep-horizontal .MuiStepConnector-lineHorizontal::after {
      width: ${props => props.connectorwidth};
    }
  }
`;

StyledStepper.propTypes = {
  ...StepperProps,
  connectorwidth: PropTypes.string,
};

export const Stepper = props => {
  const {
    activeStep: initialActiveStep = 0,
    activeSubStep: initialActiveSubStep = 0,
    backText,
    children,
    completeText,
    id,
    history,
    location,
    onStepChange,
    skipText,
    steps,
    themeProps,
    variant,
    ...stepperProps
  } = props;

  let initialActiveStepState = initialActiveStep;
  let initialActiveSubStepState = initialActiveSubStep;

  const params = () => new URLSearchParams(location.search);
  const activeStepParamKey = `${id}-step`;

  const setInitialActiveStepStateFromParams = () => {
    const activeStepsParam = params().get(activeStepParamKey);

    if (activeStepsParam) {
      const activeStepParts = activeStepsParam.split(',');
      initialActiveStepState = parseInt(activeStepParts[0], 10);
      initialActiveSubStepState = parseInt(activeStepParts[1], 10);
    }
  };

  setInitialActiveStepStateFromParams();

  const [transitioningToStep, setTransitioningToStep] = React.useState();
  const [activeStep, setActiveStep] = React.useState(initialActiveStepState);
  const [activeSubStep, setActiveSubStep] = React.useState(initialActiveSubStepState);
  const prevActiveStep = usePrevious(activeStep);

  window.top.addEventListener('popstate', (e) => {
    e.preventDefault();
    setInitialActiveStepStateFromParams();
    setTransitioningToStep([initialActiveStepState, initialActiveSubStepState].join(','));
    setActiveStep(initialActiveStepState);
    setActiveSubStep(initialActiveSubStepState);
    setTimeout(() => {
      setTransitioningToStep(null);
    }, 0);
  });

  const [skipped, setSkipped] = React.useState(new Set());
  const [processing, setProcessing] = React.useState(false);
  const [pendingStep, setPendingStep] = React.useState([]);

  const isHorizontal = variant === 'horizontal';
  const isStepOptional = stepIndex => steps[stepIndex].optional;
  const isStepSkipped = stepIndex => skipped.has(stepIndex);

  const getStepId = stepIndex => `${id}-step-${stepIndex}`;

  const stepHasSubSteps = stepIndex => get(steps[stepIndex], 'subSteps', []).length > 0;

  const getStepSubStepLength = stepIndex => (stepHasSubSteps(stepIndex)
    ? get(steps[stepIndex], 'subSteps', []).length
    : 1
  );

  const getActiveStepAsyncState = () => {
    let activeStepAsyncState = get(steps[activeStep], 'asyncState');

    if (stepHasSubSteps(activeStep) && activeSubStep < steps[activeStep].subSteps.length - 1) {
      activeStepAsyncState = undefined;
    }

    const activeSubStepAsyncState = get(steps[activeStep], ['subSteps', activeSubStep, 'asyncState']);

    const asyncState = {
      stepIsAsync: !!activeStepAsyncState,
      subStepIsAsync: !!activeSubStepAsyncState,
      step: activeStepAsyncState,
      subStep: activeSubStepAsyncState,
    };

    return asyncState;
  };

  const advanceActiveStep = () => {
    if (activeStep < steps.length - 1) setActiveStep(activeStep + 1);
    setActiveSubStep(0);
  };

  const handleActiveStepOnComplete = () => {
    if (isFunction(steps[activeStep].onComplete)) steps[activeStep].onComplete();
  };

  const completeAsyncStep = () => {
    if (pendingStep.length) {
      setActiveStep(pendingStep[0]);
      setActiveSubStep(pendingStep[1]);
      setPendingStep([]);
    }
    setProcessing(false);
  };

  React.useEffect(() => {
    const { subStepIsAsync, stepIsAsync, step = {}, subStep = {} } = getActiveStepAsyncState();

    if (pendingStep.length && (subStepIsAsync || stepIsAsync)) {
      const { pending: subStepPending, complete: subStepComplete } = subStep;
      const { pending: stepPending, complete: stepComplete } = step;

      if (subStepIsAsync && !subStepPending && subStepComplete) {
        if (!stepIsAsync || stepComplete) {
          completeAsyncStep();
        }
        if (pendingStep[1] === 0 && !stepPending && !stepComplete) handleActiveStepOnComplete();
      } else if (activeSubStep === get(steps[activeStep], 'subSteps.length', 1) - 1) {
        if (!subStepPending && stepIsAsync && !stepPending) {
          if (!stepComplete) {
            handleActiveStepOnComplete();
          } else {
            completeAsyncStep();
          }
        }
      }
    } else {
      if (pendingStep.length) setPendingStep([]);
      if (processing) setProcessing(false);
    }
  }, [steps, pendingStep]);

  React.useEffect(() => {
    if (transitioningToStep) return;

    const newStep = [activeStep, activeSubStep];

    // At init, the previous activeStep is `undefined`. In this case, we want to replace the current
    // state rather than push a new one to avoid having to hit the browser back button twice to go
    // back to the previous location
    const updateMethod = prevActiveStep === undefined ? 'replaceState' : 'pushState';

    const currentParams = params();
    if (currentParams.get(activeStepParamKey) !== newStep.join(',')) {
      currentParams.set(activeStepParamKey, newStep);
      history[updateMethod]({}, '', decodeURIComponent(`${location.pathname}?${currentParams}`));
    }

    if (isFunction(onStepChange)) onStepChange(newStep);
  }, [activeStep, activeSubStep]);

  const handleNext = () => {
    const { subStepIsAsync, stepIsAsync } = getActiveStepAsyncState();

    setProcessing(false);
    let pending;

    if (stepIsAsync || subStepIsAsync) {
      pending = true;
      setProcessing(true);

      setPendingStep([
        (activeStep < steps.length - 1) ? activeStep + 1 : activeStep,
        (stepHasSubSteps(activeStep) && activeSubStep < steps[activeStep].subSteps.length - 1)
          ? activeSubStep + 1
          : 0,
      ]);
    }

    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }
    setSkipped(newSkipped);

    if (stepHasSubSteps(activeStep)) {
      if (isFunction(steps[activeStep].subSteps[activeSubStep].onComplete)) {
        steps[activeStep].subSteps[activeSubStep].onComplete();
      }
      if (activeSubStep < steps[activeStep].subSteps.length - 1) {
        setActiveSubStep(activeSubStep + 1);
      } else {
        if (!pending) {
          handleActiveStepOnComplete();
          advanceActiveStep();
        }
      }
    } else {
      if (!pending) {
        handleActiveStepOnComplete();
        advanceActiveStep();
      }
    }
  };

  const handleBack = () => {
    if (stepHasSubSteps(activeStep) && (activeSubStep > 0)) {
      setActiveSubStep(activeSubStep - 1);
    } else if (activeStep > 0) {
      const newActiveStep = activeStep - 1;
      setActiveStep(newActiveStep);
      setActiveSubStep(stepHasSubSteps(newActiveStep)
        ? steps[newActiveStep].subSteps.length - 1
        : 0);
    }
  };

  const handleSkip = () => {
    advanceActiveStep();
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const renderStepActions = () => {
    const step = stepHasSubSteps(activeStep)
      ? steps[activeStep].subSteps[activeSubStep]
      : steps[activeStep];

    return (
      <Flex justifyContent="flex-end" className="step-actions" mt={3} {...themeProps.actions}>
        {!step.hideBack && (
          <Button
            disabled={processing || (activeStep === 0 && activeSubStep === 0)}
            variant="secondary"
            className="step-back"
            onClick={handleBack}
          >
            {step.backText || backText}
          </Button>
        )}
        {isStepOptional(activeStep) && (
          <Button
            variant="primary"
            ml={2}
            className="step-skip"
            onClick={handleSkip}
          >
            {step.skipText || skipText}
          </Button>
        )}
        {!step.hideComplete && (
          <Button
            variant="primary"
            ml={2}
            className="step-next"
            disabled={step.disableComplete}
            onClick={handleNext}
            processing={processing}
            type={(activeStep === steps.length - 1 && activeSubStep === get(steps[activeStep], 'subSteps.length', 1) - 1)
              ? 'submit' : 'button'
            }
          >
            {step.completeText || completeText}
          </Button>
        )}
      </Flex>
    );
  };

  const renderActiveStepPanel = () => {
    const Panel = stepHasSubSteps(activeStep)
      ? steps[activeStep].subSteps[activeSubStep].panelContent
      : steps[activeStep].panelContent;

    return React.cloneElement(Panel, {
      key: activeStep,
      id: `${id}-step-panel-${activeStep}`,
      'aria-labelledby': getStepId(activeStep),
    });
  };

  return (
    <Flex variant={`steppers.${variant}`} {...themeProps.wrapper} id={id}>
      <Box className="steps" {...themeProps.steps}>
        <StyledStepper
          connectorwidth={`${(activeSubStep / getStepSubStepLength(activeStep)) * 100}%`}
          orientation={variant}
          activeStep={activeStep}
          alternativeLabel={isHorizontal}
          {...stepperProps}
        >
          {map(steps, ({ label, disabled }, index) => {
            const stepProps = {};

            if (activeStep >= index && steps[index].completed) stepProps.completed = true;
            if (isStepSkipped(index)) stepProps.completed = false;

            return (
              <Step
                key={index}
                id={getStepId(index)}
                active={activeStep === index}
                disabled={disabled}
                className={cx({ active: activeStep === index, skipped: isStepSkipped(index) })}
                {...stepProps}
              >
                <StepLabel
                  optional={isStepOptional(index) && (
                    <Text
                      className="optional"
                      textAlign={isHorizontal ? 'center' : 'left'}
                    >
                      {isStepSkipped(index) ? 'skipped' : 'optional'}
                    </Text>
                  )}
                >
                  {label}
                </StepLabel>
                {!isHorizontal && (
                  <StepContent>
                    {renderActiveStepPanel()}
                    {renderStepActions()}
                  </StepContent>
                )}
              </Step>
            );
          })}
        </StyledStepper>
      </Box>
      {isHorizontal && (
        <Box {...themeProps.panel}>
          {renderActiveStepPanel()}
          {renderStepActions()}
        </Box>
      )}
    </Flex>
  );
};

const StepPropTypes = {
  asyncState: PropTypes.shape({
    complete: PropTypes.bool,
    pending: PropTypes.bool,
  }),
  backText: PropTypes.string,
  completed: PropTypes.bool,
  completeText: PropTypes.string,
  disableComplete: PropTypes.bool,
  hideBack: PropTypes.bool,
  hideComplete: PropTypes.bool,
  label: PropTypes.string,
  onComplete: PropTypes.func,
  optional: PropTypes.bool,
  panelContent: PropTypes.node,
};

Stepper.propTypes = {
  ...StepperProps,
  'aria-label': PropTypes.string.isRequired,
  activeStep: PropTypes.number,
  activeSubStep: PropTypes.number,
  backText: PropTypes.string,
  completeText: PropTypes.string,
  history: PropTypes.shape({
    pushState: PropTypes.func.isRequired,
  }),
  id: PropTypes.string.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string,
    search: PropTypes.string,
  }),
  onStepChange: PropTypes.func,
  skipText: PropTypes.string,
  steps: PropTypes.arrayOf(PropTypes.shape({
    ...StepPropTypes,
    subSteps: PropTypes.arrayOf(
      PropTypes.shape(omit({ ...StepPropTypes }, ['completed', 'label'])),
    ),
  })),
  themeProps: PropTypes.shape({
    wrapper: PropTypes.shape(FlexProps),
    panel: PropTypes.shape(BoxProps),
    steps: PropTypes.shape(BoxProps),
    actions: PropTypes.shape(FlexProps),
  }),
  variant: PropTypes.oneOf(['horizontal', 'vertical']),
};

Stepper.defaultProps = {
  backText: t('Back'),
  completeText: t('Continue'),
  history: window.history,
  location: window.location,
  skipText: t('Skip'),
  themeProps: {},
  variant: 'horizontal',
};

export default Stepper;
