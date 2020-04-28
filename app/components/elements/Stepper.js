import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Flex, Text, BoxProps, FlexProps } from 'rebass/styled-components';
import { default as Base, StepperProps } from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import map from 'lodash/map';
import isFunction from 'lodash/isFunction';

import Button from './Button';
import { borders, colors, space } from '../../themes/baseTheme';

const StyledStepper = styled(Base)`
  font-size: inherit;
  font-weight: inherit;
  font-family: inherit;
  color: inherit;
  background-color: inherit;
  padding: initial;
`;

export const Stepper = props => {
  const {
    steps,
    children,
    id,
    activeStep: initialActiveStep = 0,
    themeProps,
    variant,
    ...stepperProps
  } = props;

  const [activeStep, setActiveStep] = React.useState(parseInt(initialActiveStep));
  const [skipped, setSkipped] = React.useState(new Set());

  const isStepOptional = (step) => steps[step].optional;
  const isStepSkipped = (step) => skipped.has(step);

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }
    setSkipped(newSkipped);

    if (activeStep < steps.length - 1) setActiveStep((prevActiveStep) => prevActiveStep + 1);
    if (isFunction(steps[activeStep].onComplete)) steps[activeStep].onComplete()
  };

  const handleBack = () => {
    if (activeStep > 0) setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (activeStep < steps.length - 1) setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  return (
    <Flex variant={`steppers.${variant}`} {...themeProps.wrapper}>
      <Box className="steps" {...themeProps.steps}>
        <StyledStepper
          orientation={variant}
          activeStep={activeStep}
          alternativeLabel
          {...stepperProps}
        >
          {map(steps, ({ label, icon, disabled }, index) => {
            const stepProps = {};
            if (isStepSkipped(index)) {
              stepProps.completed = false;
            }
            return (
              <Step
                key={index}
                id={`${id}-step-${index}`}
                active={activeStep === index}
                disabled={disabled}
                {...stepProps}
              >
                <StepLabel
                  optional={isStepOptional(index) && <Text className="optional" textAlign="center">{isStepSkipped(index) ? 'skipped' : 'optional'}</Text>}
                  icon={icon}
                >
                  {label}
                </StepLabel>
              </Step>
            );
          })}
        </StyledStepper>
      </Box>
      <Box className="step-panels" {...themeProps.panel}>
        {map(children, (Child, index) => (
          React.cloneElement(Child, {
            key: index,
            hidden: activeStep !== index,
            id: `${id}-step-panel-${index}`,
            'aria-labelledby': `${id}-step-${index}`,
          })
        ))}

        <Flex justifyContent="flex-end" className="step-actions" mt={3} {...themeProps.actions}>
          <Button
            disabled={activeStep === 0}
            variant="secondary"
            className="step-back"
            onClick={handleBack}
          >
            Back
          </Button>
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
          <Button
            variant="primary"
            ml={2}
            className="step-next"
            onClick={handleNext}
          >
            {steps[activeStep].completeText || (activeStep === (steps.length - 1) ? 'Finish' : 'Next')}
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
};

Stepper.propTypes = {
  ...StepperProps,
  'aria-label': PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  onStepChange: PropTypes.func.isRequired,
  value: PropTypes.number.isRequired,
  variant: PropTypes.oneOf(['horizontal', 'vertical']),
  themeProps: PropTypes.shape({
    wrapper: PropTypes.shape(FlexProps),
    panel: PropTypes.shape(BoxProps),
    steps: PropTypes.shape(BoxProps),
    actions: PropTypes.shape(FlexProps),
  }),
  steps: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    icon: PropTypes.elementType, // TODO: icons?
    disabled: PropTypes.bool,
    completed: PropTypes.bool,
    completeText: PropTypes.string,
    onComplete: PropTypes.func,
  })),
};

Stepper.defaultProps = {
  themeProps: {},
  value: 0,
  variant: 'horizontal',
};

export default Stepper;
