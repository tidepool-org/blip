import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { Box, Flex, Text, BoxProps, FlexProps } from 'theme-ui';
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
    background-color: ${colors.purpleBright};
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

export function Stepper(props) {
  const {
    activeStep: activeStepProp,
    activeSubStep: activeSubStepProp,
    backText,
    children,
    completeText,
    disableDefaultStepHandlers,
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

  let initialActiveStep = activeStepProp || 0;
  let initialActiveSubStep = activeSubStepProp || 0;

  const params = () => new URLSearchParams(location.search);
  const activeStepParamKey = `${id}-step`;

  const setInitialActiveStepFromParams = () => {
    const activeStepsParam = params().get(activeStepParamKey);

    if (activeStepsParam) {
      const activeStepParts = activeStepsParam.split(',');
      initialActiveStep = parseInt(activeStepParts[0], 10);
      initialActiveSubStep = parseInt(activeStepParts[1], 10);
    }
  };

  const [transitioningToStep, setTransitioningToStep] = React.useState();
  const [activeStep, setActiveStep] = React.useState(initialActiveStep);
  const [activeSubStep, setActiveSubStep] = React.useState(initialActiveSubStep);
  const [pendingStep, setPendingStep] = React.useState([]);
  const [skipped, setSkipped] = React.useState(new Set());
  const [processing, setProcessing] = React.useState(false);
  const prevActiveStep = usePrevious(activeStep);

  React.useEffect(() => {
    const handlePopState = event => {
      event.preventDefault();
      setInitialActiveStepFromParams();
      setTransitioningToStep([initialActiveStep, initialActiveSubStep].join(','));
      setActiveStep(initialActiveStep);
      setActiveSubStep(initialActiveSubStep);
      setTimeout(() => {
        setTransitioningToStep(null);
      }, 0);
    };

    window.top.addEventListener('popstate', handlePopState);
    return () => window.top.removeEventListener('popstate', handlePopState);
  }, []);

  // Only on subsequent renders, force active step update when new step props passed in
  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setActiveStep(activeStepProp);
    setActiveSubStep(activeSubStepProp);
  }, [activeStepProp, activeSubStepProp]);

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
    if (isFunction(steps[activeStep].onComplete)) {
      steps[activeStep].onComplete();
    }
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
        if (pendingStep[1] === 0 && !stepPending && stepComplete === null) {
          handleActiveStepOnComplete();
        }
      } else if (activeSubStep === get(steps[activeStep], 'subSteps.length', 1) - 1) {
        if (!subStepPending && stepIsAsync && !stepPending) {
          if (stepComplete === null) {
            handleActiveStepOnComplete();
          } else if (stepComplete === false) {
            // failed async action so we don't run onComplete, but do set processing to false and
            // unset the pending step to allow re-submission attempts.
            setProcessing(false);
            setPendingStep([]);
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
        if (!disableDefaultStepHandlers) setActiveSubStep(activeSubStep + 1);
      } else {
        if (!pending) {
          handleActiveStepOnComplete();
          if (!disableDefaultStepHandlers) advanceActiveStep();
        }
      }
    } else {
      if (!pending) {
        handleActiveStepOnComplete();
        if (!disableDefaultStepHandlers) advanceActiveStep();
      }
    }
  };

  const handleBack = () => {
    if (stepHasSubSteps(activeStep)) {
      if (isFunction(steps[activeStep].subSteps[activeSubStep].onBack)) {
        steps[activeStep].subSteps[activeSubStep].onBack();
      }

      if (activeSubStep > 0 && !disableDefaultStepHandlers) {
        setActiveSubStep(activeSubStep - 1);
        return;
      }
    }

    if (activeStep > 0 && !disableDefaultStepHandlers) {
      const newActiveStep = activeStep - 1;
      setActiveStep(newActiveStep);
      setActiveSubStep(stepHasSubSteps(newActiveStep)
        ? steps[newActiveStep].subSteps.length - 1
        : 0);
    }

    if (isFunction(steps[activeStep].onBack)) {
      steps[activeStep].onBack();
    }
  };

  const handleStepEnter = () => {
    if (isFunction(steps[activeStep].onEnter)) steps[activeStep].onEnter();
  };

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

    // Calling `handleStepEnter` last allows us to redirect to another step after any step/subStep
    // updates, including those from the generic `onStepChange`, have taken effect.
    if (prevActiveStep && (activeStep !== prevActiveStep)) handleStepEnter();
  }, [activeStep, activeSubStep]);

  const handleSkip = () => {
    if (stepHasSubSteps(activeStep)) {
      if (isFunction(steps[activeStep].subSteps[activeSubStep].onSkip)) {
        steps[activeStep].subSteps[activeSubStep].onSkip();
      }
    }

    if (isFunction(steps[activeStep].onSkip)) {
      steps[activeStep].onSkip();
    }

    if (!disableDefaultStepHandlers) advanceActiveStep();

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

    return step ? (
      <Flex sx={{ justifyContent: 'flex-end' }} className="step-actions" mt={3} {...themeProps.actions}>
        {!step.hideBack && (
          <Button
            mr={4}
            py={2}
            disabled={step.disableBack || processing}
            variant="secondary"
            className="step-back"
            onClick={handleBack}
            tabIndex={0}
          >
            {step.backText || backText}
          </Button>
        )}
        {isStepOptional(activeStep) && (
          <Button
            variant="primary"
            mr={4}
            py={2}
            className="step-skip"
            onClick={handleSkip}
            tabIndex={0}
          >
            {step.skipText || skipText}
          </Button>
        )}
        {!step.hideComplete && (
          <Button
            variant="primary"
            py={2}
            className="step-next"
            disabled={step.disableComplete}
            onClick={handleNext}
            processing={processing}
            type={(activeStep === steps.length - 1 && activeSubStep === get(steps[activeStep], 'subSteps.length', 1) - 1)
              ? 'submit' : 'button'
            }
            tabIndex={0}
          >
            {step.completeText || completeText}
          </Button>
        )}
      </Flex>
    ) : null;
  };

  const renderActiveStepPanel = () => {
    const Panel = stepHasSubSteps(activeStep)
      ? steps[activeStep]?.subSteps?.[activeSubStep]?.panelContent
      : steps[activeStep]?.panelContent;

    return Panel ? React.cloneElement(Panel || null, {
      key: activeStep,
      id: `${id}-step-panel-${activeStep}`,
      'aria-labelledby': getStepId(activeStep),
      steps,
    }) : null;
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
                      sx={{ display: 'block', textAlign: isHorizontal ? 'center' : 'left' }}
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
}

const StepPropTypes = {
  asyncState: PropTypes.shape({
    complete: PropTypes.bool,
    pending: PropTypes.bool,
  }),
  backText: PropTypes.string,
  completed: PropTypes.bool,
  completeText: PropTypes.string,
  disableBack: PropTypes.bool,
  disableComplete: PropTypes.bool,
  hideBack: PropTypes.bool,
  hideComplete: PropTypes.bool,
  label: PropTypes.string,
  onBack: PropTypes.func,
  onComplete: PropTypes.func,
  onEnter: PropTypes.func,
  onSkip: PropTypes.func,
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
  disableDefaultStepHandlers: PropTypes.bool,
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
      PropTypes.shape(omit({ ...StepPropTypes }, ['completed', 'label', 'onEnter']))
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
  disableDefaultStepHandlers: false,
  history: window.history,
  location: window.location,
  skipText: t('Skip'),
  themeProps: {},
  variant: 'horizontal',
};

export default Stepper;
