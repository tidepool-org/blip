import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { FastField, Field, useFormikContext } from 'formik';
import { Box, Flex, Text, BoxProps } from 'theme-ui';
import filter from 'lodash/filter';
import get from 'lodash/get';
import includes from 'lodash/includes';
import map from 'lodash/map';
import isInteger from 'lodash/isInteger';
import sortedLastIndexBy from 'lodash/sortedLastIndexBy';
import DeleteOutlineRoundedIcon from '@material-ui/icons/DeleteOutlineRounded';

import { getFieldError, getThresholdWarning, onChangeWithDependantFields } from '../../core/forms';
import { useFieldArray } from '../../core/hooks';
import i18next from '../../core/language';
import utils from '../../core/utils';
import TextInput from '../../components/elements/TextInput';
import Icon from '../../components/elements/Icon';
import Button from '../../components/elements/Button';
import Select from '../../components/elements/Select';
import { MS_IN_MIN, MS_IN_DAY } from '../../core/constants';
import { convertMsPer24ToTimeString, convertTimeStringToMsPer24 } from '../../core/datetime';
import { inlineInputStyles } from './prescriptionFormStyles';

const t = i18next.t.bind(i18next);

const ScheduleForm = props => {
  const {
    addButtonText,
    dependantFields,
    fieldArrayName,
    fields,
    max,
    minutesIncrement,
    separator,
    t,
    useFastField,
    ...boxProps
  } = props;

  const formikContext = useFormikContext();

  const {
    setFieldTouched,
    setFieldValue,
    values,
  } = formikContext;

  const [refs, setRefs] = React.useState([]);
  const [focusedId, setFocusedId] = React.useState();

  const [schedules, , { move, remove, replace, push }] = useFieldArray({ name: fieldArrayName });
  const schedulesLength = schedules.value.length;
  const lastSchedule = useMemo(() => schedules.value[schedulesLength - 1], [schedules.value, schedulesLength]);
  const msIncrement = minutesIncrement * MS_IN_MIN;

  React.useEffect(() => {
    // add or remove refs as the schedule length changes
    setRefs(refs => (
      Array(schedulesLength).fill().map((_, i) => refs[i] || React.createRef())
    ));
  }, [schedulesLength]);

  React.useEffect(() => {
    isInteger(focusedId) && refs[focusedId].current.focus();
  }, [focusedId]);

  const FieldElement = useFastField ? FastField : Field;

  const timeOptions = [];

  for (let startTime = msIncrement; startTime <= (MS_IN_DAY - (msIncrement)); startTime += msIncrement) {
    timeOptions.push({ label: convertMsPer24ToTimeString(startTime, 'hh:mm'), value: startTime });
  }

  const selectedTimes = useMemo(() => map(schedules.value, 'start'), [schedules.value]);

  let availableTimeOptions = (currentStart, previousStart) => filter(timeOptions, option => {
    return option.value === currentStart || (option.value > previousStart && !includes(selectedTimes, option.value));
  });

  return (
    <Box {...boxProps}>
      {map(schedules.value, (schedule, index) => (
        <Flex className='schedule-row' key={index} sx={{ alignItems: 'flex-start' }} mb={3}>
          <Field
            as={index === 0 ? TextInput : Select}
            label={index === 0 ? t('Start Time') : null}
            options={availableTimeOptions(schedule.start, schedules.value[index - 1]?.start || 0)}
            readOnly={index === 0}
            value={index === 0 ? convertMsPer24ToTimeString(schedule.start) : schedule.start}
            onChange={e => {
              const start = index === 0 ? convertTimeStringToMsPer24(e.target.value) : parseInt(e.target.value, 10);
              const newValue = { ...schedules.value[index], start };
              const valuesCopy = [ ...schedules.value ];
              valuesCopy.splice(index, 1);
              const newPos = sortedLastIndexBy(valuesCopy, newValue, function(o) { return o.start; });
              replace(index, newValue);
              move(index, newPos);
              setFocusedId(newPos);
            }}
            onFocus={() => setFocusedId(index)}
            onBlur={() => setFocusedId(undefined)}
            innerRef={refs[index]}
            id={`${fieldArrayName}.${index}.start`}
            name={`${fieldArrayName}.${index}.start`}
            error={getFieldError(`${fieldArrayName}.${index}.start`, formikContext)}
            {...inlineInputStyles}
          />
          {map(fields, (field, fieldIndex) => (
            <React.Fragment key={fieldIndex}>
              <FieldElement
                as={TextInput}
                label={index === 0 ? field.label : null}
                min={field.min}
                max={field.max}
                step={get(field, 'inputStep', field.increment)}
                type={field.type}
                id={`${fieldArrayName}.${index}.${field.name}`}
                name={`${fieldArrayName}.${index}.${field.name}`}
                suffix={field.suffix}
                error={getFieldError(`${fieldArrayName}.${index}.${field.name}`, formikContext)}
                warning={getThresholdWarning(get(values,`${fieldArrayName}.${index}.${field.name}`), field.threshold)}
                onBlur={e => {
                  setFieldTouched(`${fieldArrayName}.${index}.${field.name}`);
                  setFieldValue(`${fieldArrayName}.${index}.${field.name}`, utils.roundToNearest(e.target.value, field.increment))
                }}
                onChange={onChangeWithDependantFields(`${fieldArrayName}.${index}.${field.name}`, field.dependantFields, formikContext, field.setDependantsTouched)}
                {...inlineInputStyles}
              />
              {(fieldIndex < fields.length - 1 ) && separator && (
                <Text ml={3} mr={1} mt={index === 0 ? '33px' : '12px'}>{separator}</Text>
              )}
            </React.Fragment>
          ))}
          <Icon
            mx={2}
            mt={2}
            variant="button"
            label="Delete"
            icon={DeleteOutlineRoundedIcon}
            onClick={() => remove(index)}
            disabled={index === 0}
            tabIndex={index === 0 ? -1 : 0}
            sx={{
              top: index === 0 ? '1em' : 0,
            }}
          />
        </Flex>
      ))}
      <Button
        variant="tertiary"
        className="add-schedule"
        sx={{
          width: '100%',
          '> div': {
            width: '100%',
            textAlign: 'center',
          },
        }}
        disabled={(() => {
          return (schedulesLength >= max) || (lastSchedule.start >= (MS_IN_DAY - (msIncrement)));
        })()}
        onClick={() => {
          return push({
            ...lastSchedule,
            start: lastSchedule.start + (msIncrement),
          });
        }}
      >
        {addButtonText}
      </Button>
    </Box>
  );
};

ScheduleForm.propTypes = {
  ...BoxProps,
  addButtonText: PropTypes.string,
  fieldArrayName: PropTypes.string,
  fields: PropTypes.arrayOf(PropTypes.shape({
    dependantFields: PropTypes.arrayOf(PropTypes.string),
    label: PropTypes.string,
    name: PropTypes.string,
    setDependantsTouched: PropTypes.bool,
    min: PropTypes.number,
    max: PropTypes.number,
    increment: PropTypes.number,
    inputStep: PropTypes.number,
    suffix: PropTypes.string,
    type: PropTypes.string,
  })),
  max: PropTypes.number,
  minutesIncrement: PropTypes.number,
  separator: PropTypes.string,
  useFastField: PropTypes.bool,
};

ScheduleForm.defaultProps = {
  addButtonText: t('Add another'),
  fields: [],
  useFastField: false,
  max: 48,
  minutesIncrement: 30,
};

export default withTranslation()(ScheduleForm);
