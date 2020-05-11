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
import isFunction from 'lodash/isFunction';
import cx from 'classnames';

import Button from './Button';
import { colors } from '../../themes/baseTheme';

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
    transition: width .2s ease-in-out;
  }

  .MuiStep-horizontal.active {
    ~ .MuiStep-horizontal .MuiStepConnector-lineHorizontal::after {
      width: 0;
    }
    + .MuiStep-horizontal .MuiStepConnector-lineHorizontal::after {
      width: ${props => props.connectorWidth};
    }
  }
`;

export const Stepper = props => {
  const {
    steps,
    children,
    id,
    activeStep: initialActiveStep = 0,
    location,
    themeProps,
    variant,
    ...stepperProps
  } = props;

  const isHorizontal = variant === 'horizontal';
  const getStepId = stepIndex => `${id}-step-${stepIndex}`;

  const [activeStep, setActiveStep] = React.useState(parseInt(initialActiveStep, 10));
  React.useEffect(() => {
    location.hash = `#${getStepId(activeStep)}`;
  });

  const [activeSubStep, setActiveSubStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());

  const isStepOptional = stepIndex => steps[stepIndex].optional;
  const isStepSkipped = stepIndex => skipped.has(stepIndex);
  const stepHasSubSteps = stepIndex => get(steps[stepIndex], 'subSteps', []).length > 0;

  const getStepSubStepLength = stepIndex => (stepHasSubSteps(stepIndex)
    ? get(steps[stepIndex], 'subSteps', []).length
    : 1
  );

  const handleNext = () => {
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
        setActiveSubStep((prevActiveSubStep) => prevActiveSubStep + 1);
      }
    } else {
      if (isFunction(steps[activeStep].onComplete)) steps[activeStep].onComplete();
      if (activeStep < steps.length - 1) {
        const newActiveStep = activeStep + 1;
        setActiveStep(newActiveStep);
        setActiveSubStep(0);
      }
    }
  };

  const handleBack = () => {
    if (stepHasSubSteps(activeStep) && (activeSubStep > 0)) {
      setActiveSubStep((prevActiveSubStep) => prevActiveSubStep - 1);
    } else if (activeStep > 0) {
      const newActiveStep = activeStep - 1;
      setActiveStep(newActiveStep);
      setActiveSubStep(stepHasSubSteps(newActiveStep)
        ? steps[newActiveStep].subSteps.length - 1
        : 0);
    }
  };

  const handleSkip = () => {
    if (activeStep < steps.length - 1) setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const renderStepPanel = (Panel, index) => React.cloneElement(Panel, {
    key: index,
    hidden: activeStep !== index,
    id: `${id}-step-panel-${index}`,
    'aria-labelledby': getStepId(index),
    children: stepHasSubSteps(index)
      ? map(Panel.props.children, (Child, childIndex) => React.cloneElement(Child, {
        key: childIndex,
        hidden: stepHasSubSteps(index) ? activeSubStep !== childIndex : false,
        id: `${id}-step-panel-${index}-subpanel-${childIndex}`,
      }))
      : Panel.props.children,
  });

  const renderStepActions = () => (
    <Flex justifyContent="flex-end" className="step-actions" mt={3} {...themeProps.actions}>
      {!steps[activeStep].hideBack && (
        <Button
          disabled={activeStep === 0 && activeSubStep === 0}
          variant="secondary"
          className="step-back"
          onClick={handleBack}
        >
          {steps[activeStep].backText || 'Back'}
        </Button>
      )}
      {isStepOptional(activeStep) && (
        <Button
          variant="primary"
          ml={2}
          className="step-skip"
          onClick={handleSkip}
        >
          Skip
        </Button>
      )}
      {!steps[activeStep].hideComplete && (
        <Button
          variant="primary"
          ml={2}
          className="step-next"
          onClick={handleNext}
        >
          {steps[activeStep].completeText || (activeStep === (steps.length - 1) ? 'Finish' : 'Next')}
        </Button>
      )}
    </Flex>
  );

  const renderStepPanels = () => (
    <React.Fragment>
      {map(children, renderStepPanel)}
      {renderStepActions()}
    </React.Fragment>
  );

  return (
    <Flex variant={`steppers.${variant}`} {...themeProps.wrapper}>
      <Box className="steps" {...themeProps.steps}>
        <StyledStepper
          connectorWidth={`${(activeSubStep / getStepSubStepLength(activeStep)) * 100}%`}
          orientation={variant}
          activeStep={activeStep}
          alternativeLabel={isHorizontal}
          {...stepperProps}
        >
          {map(steps, ({ label, disabled }, index) => {
            const stepProps = {};
            if (isStepSkipped(index)) {
              stepProps.completed = false;
            }
            return (
              <Step
                key={index}
                id={getStepId(index)}
                active={activeStep === index}
                disabled={disabled}
                className={cx({ active: activeStep === index })}
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
                    {renderStepPanel(children[index], index)}
                    {renderStepActions()}
                  </StepContent>
                )}
              </Step>
            );
          })}
        </StyledStepper>
      </Box>
      {isHorizontal && (
        <Box className="step-panels" {...themeProps.panel}>
          {renderStepPanels()}
        </Box>
      )}
    </Flex>
  );
};

const StepPropTypes = PropTypes.shape({
  backText: PropTypes.string,
  completed: PropTypes.bool,
  completeText: PropTypes.string,
  hideBack: PropTypes.bool,
  hideComplete: PropTypes.bool,
  label: PropTypes.string,
  onComplete: PropTypes.func,
  optional: PropTypes.bool,
});

Stepper.propTypes = {
  ...StepperProps,
  'aria-label': PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  onStepChange: PropTypes.func.isRequired,
  steps: PropTypes.arrayOf({
    ...StepPropTypes,
    subSteps: PropTypes.arrayOf(StepPropTypes),
  }),
  themeProps: PropTypes.shape({
    wrapper: PropTypes.shape(FlexProps),
    panel: PropTypes.shape(BoxProps),
    steps: PropTypes.shape(BoxProps),
    actions: PropTypes.shape(FlexProps),
  }),
  value: PropTypes.number.isRequired,
  variant: PropTypes.oneOf(['horizontal', 'vertical']),
};

Stepper.defaultProps = {
  themeProps: {},
  value: 0,
  variant: 'horizontal',
};

export default Stepper;
