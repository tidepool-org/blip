# == BSD2 LICENSE ==
# Copyright (c) 2014, Tidepool Project
# 
# This program is free software; you can redistribute it and/or modify it under
# the terms of the associated License, which is identical to the BSD 2-Clause
# License as published by the Open Source Initiative at opensource.org.
# 
# This program is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
# FOR A PARTICULAR PURPOSE. See the License for more details.
# 
# You should have received a copy of the License along with this program; if
# not, you can obtain one from Tidepool Project at tidepool.org.
# == BSD2 LICENSE ==
#
# usage: demo_data.py [-h] [-d DEXCOM_SEGMENTS] [-m] [-n NUM_DAYS]
#                     [-o OUTPUT_FILE] [-q]
#
# Generate demo diabetes data for Tidepool applications and visualizations.
#
# optional arguments:
#   -h, --help            show this help message and exit
#   -d DEXCOM_SEGMENTS, --dexcom DEXCOM_SEGMENTS
#                         name of file containing indexed continuous segments of
#                         Dexcom data; default is indexed_segments.json
#   -m, --mock            shortcut for producing new mock data for blip
#   -n NUM_DAYS, --num_days NUM_DAYS
#                         number of days of demo data to generate; default is 30
#   -o OUTPUT_FILE, --output_file OUTPUT_FILE
#                         name of output JSON file; default is device-data.json
#   -q, --quiet_messages  use this flag to turn off messages when bacon ipsum is
#                         being slow

# for Python 3 compatibility
from __future__ import print_function

import argparse
from datetime import datetime as dt
from datetime import time as t
from datetime import timedelta as td
import json
import random
import sys
from urllib2 import urlopen
import uuid

HOURS = range(0,24)

VERY_LIKELY = [7, 8, 11, 12, 6, 11]

for i in VERY_LIKELY:
    j = 0
    while j < 3:
        HOURS.append(i)
        j += 1

LIKELY = [9, 13, 4, 5, 9, 10]

for i in LIKELY:
    j = 0
    while j < 2:
        HOURS.append(i)
        j += 1

SIXTY = range(0, 60)

MICRO = range(0, 1000000)

class Basal:
    """Generate demo basal data."""

    def __init__(self, schedule, boluses, carbs):

        self.boluses = boluses

        self.carbs = carbs

        self.endpoints = self._get_endpoints()

        if schedule:
            self.schedule = schedule
        else:
            self.schedule = {
                t(0,0,0): 0.8,
                t(2,0,0): 0.65,
                t(4,0,0): 0.75,
                t(5,0,0): 0.85,
                t(6,0,0): 1.00,
                t(9,0,0): 0.8,
                t(15,0,0): 0.9,
                t(20,0,0): 0.8
            }

        self.segment_starts = sorted([time for time in self.schedule.keys()])

        self.segments = []

        self.temp_segments = []

        self.end_initial = self._get_initial_segment()

        self.end_middle = self._get_middle_segments()

        self._get_final_segment()

        self.generate_temp_basals()
        # more hackery because of my bad while loops /o\
        self.temp_segments.pop()

        self.json = [s for s in self.segments] + [s for s in self.temp_segments]

        for segment in self.json:
            segment['start'] = segment['start'].isoformat()
            segment['end'] = segment['end'].isoformat()
            segment['duration'] = abs(int(segment['duration'].total_seconds()*1000))
            segment['id'] = str(uuid.uuid4())

    def _append_segment(self, d, segment_start):

        try:
            index = self.segment_starts.index(t(d.hour, d.minute, d.second))
        except ValueError:
            index = self.segment_starts.index(segment_start) - 1

        try:
            current_segment = self.segment_starts[index]
        except IndexError:
            current_segment = self.segment_starts[len(self.segment_starts) - 1]

        start = dt(d.year, d.month, d.day, d.hour, d.minute, d.second)
        end = dt(d.year, d.month, d.day, segment_start.hour, segment_start.minute, segment_start.second)

        segment = {                
                    'type': 'basal-rate-segment',
                    'delivered': self.schedule[current_segment],
                    'value': self.schedule[current_segment],
                    'deliveryType': 'scheduled',
                    'start': start,
                    'end': end,
                    'duration': end - start
                }

        if segment_start == t(0,0,0):
            segment['end'] = segment['end'] + td(days=1)

        self.segments.append(segment);

    def _append_temp_segment(self, d, duration, percent):

        start = dt(d.year, d.month, d.day, d.hour, d.minute, d.second)

        segment = {                
                    'type': 'basal-rate-segment',
                    'percent': percent,
                    'deliveryType': 'temp',
                    'start': start,
                    'end': start + duration,
                    'duration': duration
                }

        self.temp_segments.append(segment);

    def _get_difference(self, t1, t2):

        d = dt.now() - td(days=30)

        dt1 = dt(d.year, d.month, d.day, t1.hour, t1.minute, t1.second)

        dt2 = dt(d.year, d.month, d.day, t2.hour, t2.minute, t2.second)

        if t1 == t(0,0,0):
            dt1 = dt1 + td(days=1)

        return dt1 - dt2

    def _get_endpoints(self):

        bolus_times = []

        for b in self.boluses:
            date_string = b['deviceTime']
            bolus_times.append({'deviceTime': dt.strptime(date_string, '%Y-%m-%dT%H:%M:%S')})

        all_pump_data = bolus_times + self.carbs

        all_pump_data = sorted(all_pump_data, key=lambda x: x['deviceTime'])

        return (all_pump_data[0], all_pump_data[len(all_pump_data) - 1])

    def _get_initial_segment(self):

        d = self.endpoints[0]['deviceTime']

        beginning = t(d.hour, d.minute, d.second)

        for i, start in enumerate(self.segment_starts):
            if beginning < start:
                self._append_segment(d, start)
                return start
        else:
            self._append_segment(d, t(0,0,0))
            return t(0,0,0)

    def _get_middle_segments(self):

        midnight = t(0,0,0)

        index = self.segment_starts.index(self.end_initial)

        segment_start = self.end_initial

        d = self.endpoints[0]['deviceTime']

        end = self.endpoints[1]['deviceTime']

        start_datetime = dt(d.year, d.month, d.day, segment_start.hour, segment_start.minute, segment_start.second)

        if segment_start == midnight:
            start_datetime = start_datetime + td(days=1)

        current_datetime = start_datetime

        while current_datetime < end:
            try:
                next_segment_start = self.segment_starts[index + 1]
                index += 1            
            except IndexError:
                next_segment_start = midnight
                index = 0
            self._append_segment(current_datetime, next_segment_start)
            start_datetime = current_datetime
            difference = self._get_difference(next_segment_start, t(current_datetime.hour, current_datetime.minute, current_datetime.second))
            current_datetime = current_datetime + difference

        return start_datetime

    def _get_final_segment(self):

        # this is hack since I didn't do a great job on the while loop in _get_middle_segments
        self.segments.pop()

        d = self.endpoints[1]['deviceTime']

        self._append_segment(self.end_middle, t(d.hour, d.minute, d.second))

    def generate_temp_basals(self):

        day_skip = range(0,1)

        durations = range(30, 510, 30)

        start = self.endpoints[0]['deviceTime']
        end = self.endpoints[1]['deviceTime']

        current_datetime = start

        basal_possibilities = [x / 100.0 for x in range(0, 155,5)]

        while current_datetime < end:
            days_delta = td(days=random.choice(day_skip))
            time_delta = td(hours=random.choice(HOURS), minutes=random.choice(SIXTY))
            current_datetime = current_datetime + days_delta + time_delta
            self._append_temp_segment(current_datetime, td(minutes=random.choice(durations)), random.choice(basal_possibilities))

class Boluses:
    """Generate demo bolus data."""

    def __init__(self, wizards):

        self.wizards = wizards

        self.ratio = 15.0

        self.mu = 2.0

        self.sigma = 2.0

        self.boluses = self._generate_meal_boluses()

        self._generate_extended_boluses()

        self._generate_correction_boluses()

        self.json = [b for b in self.boluses if (b['value'] > 0)]

    def _time_shift(self):

        return td(minutes=random.randint(-5,5))

    def _ratio_shift(self):

        return random.randint(-2, 2)

    def _dose_shift(self):

        return random.choice([-1.5, -1.0, -0.5, 0.5, 1.0, 1.5])

    def _recommendation(self):

        return random.randint(-3,3)

    def _generate_meal_boluses(self):
        """Generate boluses to match generated carb counts."""

        bolus = self

        likelihood = [0,0,0,0,1]

        boluses = [{'id': str(uuid.uuid4()), 'type': 'bolus', 'deviceTime': wiz['deviceTime'], 'joinKey': wiz['joinKey'], 'value': round(float(wiz['payload']['carbInput'] / (bolus.ratio + random.choice(likelihood) * bolus._ratio_shift())), 1), 'recommended': round(wiz['payload']['carbInput'] / bolus.ratio, 1)} for wiz in bolus.wizards.json]

        return boluses

    def _generate_correction_boluses(self):
        """Generate some correction boluses."""

        likelihood = [0,0,1]

        self.meals = sorted(self.wizards.json, key=lambda x: x['deviceTime'])

        t = dt.strptime(self.meals[0]['deviceTime'], '%Y-%m-%dT%H:%M:%S')

        end = dt.strptime(self.meals[len(self.meals) - 1]['deviceTime'], '%Y-%m-%dT%H:%M:%S')

        delta = td(hours=12)

        while t < end:
            next = t + delta + self._time_shift()

            current_value = round(random.gauss(self.mu, self.sigma), 1)

            current_recommendation = round(current_value + random.choice(likelihood) * self._dose_shift(), 1)

            if (current_recommendation > 0) and (current_value > 0):
                self.boluses.append({'id': str(uuid.uuid4()), 'type': 'bolus', 'deviceTime': next.isoformat(), 'value': current_value, 'recommended': current_recommendation})

            t = next

    def _generate_extended_boluses(self):
        """Generate some dual- and square-wave boluses."""

        likelihood = [0,1]

        quarter = [0,0,0,1]

        durations = [30,45,60,90,120,180,240]

        tenths = range(0,10)

        for bolus in self.boluses:
            coin_flip = random.choice(likelihood)

            if coin_flip:
                if bolus['value'] >= 2:
                    dual = random.choice(likelihood)
                    if dual:
                        bolus['initialDelivery'] = round(float(random.choice(range(1,10)))/10 * bolus['value'], 1)
                        bolus['extendedDelivery'] = bolus['value'] - bolus['initialDelivery']
                        bolus['duration'] = random.choice(durations) * 60 * 1000
                        bolus['type'] = 'bolus'
                        bolus['extended'] = True
                    else:
                        bolus['extendedDelivery'] = bolus['value']
                        bolus['duration'] = random.choice(durations) * 60 * 1000
                        bolus['type'] = 'bolus'
                        bolus['extended'] = True

            # make it so that some boluses have a difference between programmed and delivered
            if random.choice(quarter):
                if bolus['value'] >= 1:
                    bolus['programmed'] = bolus['value']
                    bolus['type'] = 'bolus'
                    bolus['value'] = float(random.choice(tenths)/10.0)
            else:
                bolus['type'] = 'bolus'
                bolus['programmed'] = bolus['value']

class Dexcom:
    """Generate demo Dexcom data."""

    def __init__(self, filename, days, start=dt.now()):
        """Load the indexed segments to use for generating demo Dexcom data."""

        filename = filename if (filename != None) else 'indexed_segments.json'

        self.segments = json.load(open(filename, 'rU'))

        self.days = days

        self.delta = td(minutes=5)

        self.start = start

    def _increment_timestamp(self, t):
        """Increment a timestamp with a timedelta and return the updated value."""

        self.current = t + self.delta
        return self.current

    def _stitch_segments(self):
        """Stitch together segments of Dexcom data."""
        
        initial = random.choice(self.segments[random.choice(self.segments.keys())])

        start = self.start + td(hours=random.choice(range(-5,6)))

        self.current = start

        self.readings = [{'deviceTime': self._increment_timestamp(self.current), 'value': reading['blood_glucose']} for reading in initial]

        last_reading = initial[len(initial) - 1]['blood_glucose']

        self.final = start + td(days=self.days)

        elapsed = self.current - start

        while(elapsed.total_seconds() < (86400 * self.days)):
            try:
                next = random.choice(self.segments[str(last_reading + random.choice([-1, 0, 1]))])
                last_reading = next[len(next) - 1]['blood_glucose']
            except KeyError:
                print()
                print('Could not stitch segments!')

                next = None
                try:
                    while next is None:
                        next = self._get_segment(last_reading)
                except RuntimeError:
                    sys.exit('\nRecursion limit exceeded. Please try again.\n')
                last_reading = next[len(next) - 1]['blood_glucose']

            jump = random.randint(0,6)

            i = 0
            while i < jump:
                self.current = self._increment_timestamp(self.current)
                i += 1

            self.readings += [{'deviceTime': self._increment_timestamp(self.current), 'value': reading['blood_glucose']} for reading in next]
            elapsed = self.current - start

    def _get_segment(self, last_reading):
        """Return a randomly shifted segment of Dexcom data."""

        print()
        print('Rescue stitch!')

        random_increment = random.randint(-6, 6)

        try:
            return random.choice(self.segments[str(last_reading + random_increment)])
        except KeyError:
            self._get_segment(last_reading)

    def generate_JSON(self):
        """Generate a list ready to print to JSON of demo Dexcom data."""
        
        self._stitch_segments()

        self.json = [{'id': str(uuid.uuid4()), 'type': 'cbg', 'value': reading['value'], 'deviceTime': reading['deviceTime'].isoformat()[:-7], 'source': 'demo', 'deviceId': 'Demo - 123', 'units': 'mg/dL'} for reading in self.readings if reading['deviceTime'] < self.final]

class Meals:
    """Generate demo carb intake data."""

    def __init__(self, smbg):

        self.readings = smbg.readings

        # mean of Normal distribution of carb intake datapoints
        self.mu = 50

        # standard deviation of Normal distribution of carb intake datapoints
        self.sigma = 20

        self.carbs = self._generate_meals(self.mu, self.sigma)

        self.json = [{'id': str(uuid.uuid4()), 'type': 'carbs', 'units': 'grams', 'value': c['value'], 'deviceTime': c['deviceTime'].isoformat()[:-7]} for c in self.carbs if c['value'] > 5]

    def _generate_meals(self, mu, sigma):
        """Generate carb counts for meals based on generated smbgs."""

        mealtimes = random.sample(self.readings, int(.8 * len(self.readings)))

        carbs = [{'deviceTime': meal['deviceTime'], 'value': int(random.gauss(mu, sigma))} for meal in mealtimes]

        return carbs

class Wizards:
    """Generate demo bolus wizard data."""

    def __init__(self, meals):

        self.meals = meals

        self.json = self._meal_to_wizard()

    def _meal_to_wizard(self):
        """Transform a carbs json into a wizard record."""

        return [{
                'id': record['id'],
                'deviceTime': record['deviceTime'],
                'payload': {'carbInput': record['value'], 'carbUnits': record['units']},
                'type': 'wizard',
                'joinKey': str(uuid.uuid4())} for record in self.meals.json]

class Messages:
    """Generate demo messages with bacon ipsum."""

    def __init__(self, smbg):

        self.dates = get_dates(smbg.readings)

        self.json = []

        self._generate_messages()

    def _generate_message(self, t, message_id, parent_message_id):
        """Generate a single message with bacon ipsum."""

        if parent_message_id != '':
            timestamp = t + td(minutes=random.choice(range(1,61)))
        else:
            timestamp = t

        print()
        print(dt.now(), 'Fetching some bacon ipsum...')
        
        request = urlopen('https://baconipsum.com/api/?type=meat-and-filler&sentences=' + str(random.choice(range(1,4))))

        bacon_ipsum = json.loads(request.read())[0]

        return {'type': 'message', 'id': message_id, 'parentMessage': parent_message_id, 'utcTime': timestamp.isoformat()[:-7] + 'Z', 'messageText': bacon_ipsum}

    def _generate_messages(self):

        likelihood = [0,0,1]

        messages = []

        for d in self.dates:

            hour = random.choice(HOURS)

            timestamp = dt(d.year, d.month, d.day, hour, random.choice(SIXTY), random.choice(SIXTY), random.choice(MICRO))

            message_id = str(uuid.uuid4())

            message = self._generate_message(timestamp, message_id, '')

            self.json.append(message)

            if random.choice(likelihood):
                parent_message_id = message_id

                length_of_thread = random.choice(range(1,6))

                threaded_messages = []

                i = 0

                while i <= length_of_thread:
                    message_id = str(uuid.uuid4())

                    message = self._generate_message(timestamp, message_id, parent_message_id)

                    threaded_messages.append(message)

                    i += 1

                self.json += threaded_messages

def get_dates(data):
    """Get the unique dates from an arbitrary set of device data."""

    dates = set([])

    for reading in data:
        dates.add(reading['deviceTime'].date())

    return dates


class SMBG:
    """Generate demo self-monitored blood glucose data."""

    def __init__(self, dex, readings_per_day = 7):

        self.dexcom = dex.readings

        self.dates = get_dates(self.dexcom)

        self.readings_per_day = readings_per_day

        self.readings = []

        for date in self.dates:
            self.readings += self._generate_smbg(date)

        self.readings = sorted(self.readings, key=lambda reading: reading['deviceTime'])

        self.json = [{'id': str(uuid.uuid4()), 'type': 'smbg', 'value': r['value'], 'deviceTime': r['deviceTime'].isoformat()[:-7], 'units': 'mg/dL'} for r in self.readings]

    def _generate_smbg(self, d):
        """Generate timestamps and smbg values from a non-uniform pool of potential timestamps."""

        readings = []

        i = 0

        while i < self.readings_per_day:

            hour = random.choice(HOURS)

            timestamp = dt(d.year, d.month, d.day, hour, random.choice(SIXTY), random.choice(SIXTY), random.choice(MICRO))

            near = []

            for reading in self.dexcom:
                t = reading['deviceTime']
                if t.date() == d:
                    if t.hour == hour:
                        near.append(reading)

            jump = random.randint(-26, 26)

            try:
                value = random.choice(near)['value'] + jump
                readings.append({'value': value, 'deviceTime': timestamp})
            # exception occurs when can't find a near enough timestamp because data starts with datetime.now()
            # which could be middle of the afternoon, but this method will always try to generate some morning timestamps
            except IndexError:
                pass

            i += 1

        return readings

class Settings:
    """Generate demo settings data."""

    def __init__(self, basal_schedule, carb_ratio, final, num_days):

        self.schedule = basal_schedule

        self.schedules = {
            'Standard': self._schedule_to_array(self.schedule),
            'Pattern A': self._schedule_to_array(self._mutate_schedule()),
            'Pattern B': self._schedule_to_array(self._mutate_schedule())
            }

        self.ratio = carb_ratio

        self.isf = 75

        self.penultimate = final + td(days=random.choice(range(-(num_days - 1),0)))

        self.most_recent = final

        self.json = self._get_settings()

    def _get_settings(self):
        """Put together two complete settings objects."""

        most_recent = {
            'deviceTime': self.most_recent.isoformat()[:-7],
            'id': str(uuid.uuid4()),
            'type': 'settings',
            'activeBasalSchedule': random.choice(self.schedules.keys()),
            'basalSchedules': self.schedules,
            'carbRatio': [{'start': 0, 'amount': int(self.ratio)}],
            'insulinSensitivity': [{'start': 0, 'amount': self.isf}],
            'bgTarget': [{'start': 0, 'high': 100, 'low': 80}]
        }

        penultimate = {
            'deviceTime': self.penultimate.isoformat()[:-7],
            'id': str(uuid.uuid4()),
            'type': 'settings',
            'activeBasalSchedule': random.choice(self.schedules.keys()),
            'basalSchedules': {k:(v if k != 'Standard' else self._schedule_to_array(self._mutate_schedule())) for k,v in self.schedules.items()},
            'carbRatio': [{'start': 0, 'amount': self.ratio * 1.2}],
            'insulinSensitivity': [{'start': 0, 'amount': self.isf + 10}],
            'bgTarget': [{'start': 0, 'high': 100, 'low': 80}]
        }

        return [penultimate, most_recent]

    def _mutate_schedule(self):
        """Add some random variation to the base basal schedule, return the mutated schedule."""

        basal_increments = [x / 100.0 for x in range(-25, 25, 5)]

        likelihood = [0,1]

        die = range(0,6)

        schedule = {}

        for key, val in self.schedule.items():
            coin_flip = random.choice(likelihood)
            if coin_flip:
                new_val = val + random.choice(basal_increments)
            else:
                new_val = val
            dice_roll = random.choice(die)
            if key.hour != 0 and dice_roll in [2,3]:
                new_key = (dt.combine(dt.now(), key) + td(minutes=30)).time()
                schedule[new_key] = new_val
            else:
                schedule[key] = new_val

        return schedule

    def _ms_from_time(self, time):
        """Translate a time object into a milliseconds in twenty-four hours start time."""

        MS_IN_SEC = 1000

        SEC_IN_MIN = 60

        MIN_IN_HOUR = 60

        MS_IN_HOUR = MIN_IN_HOUR * SEC_IN_MIN * MS_IN_SEC

        MS_IN_MIN = SEC_IN_MIN * MS_IN_SEC

        return time.hour * MS_IN_HOUR + time.minute * MS_IN_MIN + time.second * MS_IN_SEC

    def _schedule_to_array(self, schedule):
        """Create an array to represent a basal schedule and return it."""

        new_schedule = []

        for key, val in schedule.items():
            new_schedule.append({
                'start': self._ms_from_time(key),
                'rate': val
                })

        return _fix_floating_point(sorted(new_schedule, key=lambda x: x['start']))

def _fix_floating_point(a):
    """Iterate through an array of dicts, checking for floats and rounding them."""

    return map(lambda i: {key: (round(val, 3) if isinstance(val, float) else val) for key, val in i.items() }, a)

def print_JSON(all_json, out_file, minify=False):

    # add deviceId field to smbg, boluses, carbs, and basal-rate-segments
    pump_fields = ['smbg', 'carbs', 'wizard', 'bolus', 'basal-rate-segment', 'settings']
    units_fieds = ['cbg', 'smbg', 'carbs']
    annotation_fields = ['bolus', 'basal-rate-segment']
    suspends = []
    for a in all_json:
        if not minify:
            if a['type'] in pump_fields:
                a['deviceId'] = 'Demo - 123'
                a['source'] = 'demo'
        else:
            if a['type'] == 'cbg':
                del a['deviceId']
                del a['source']
            if a['type'] in units_fieds:
                del a['units']
        # temporarily add a device time to messages to enable sorting
        try:
            t = a['utcTime']
            a['deviceTime'] = t
        except KeyError:
            pass
        # temporarily add a device time to basals to enable sorting
        try:
            t = a['start']
            a['deviceTime'] = t
        except KeyError:
            pass

        # add some annotations
        if not minify:
            if a['type'] in annotation_fields:
                num = random.choice(range(0,15))
                if not num:
                    a['annotations'] = [{'code': 'demo annotation'}]

        # find extended boluses where programmed differs from delivered
        # and add a 'suspendedAt' field
        # TODO: remove when we have nurse-shark
        if not minify:
            try:
                if (a['type'] == 'bolus') and a['extended'] and a['programmed']:
                    fraction = random.choice([4,3,2])
                    coin_flip = random.choice([0,1])
                    reason = random.choice(['manual', 'low_glucose', 'alarm'])
                    if coin_flip:
                        time = dt.strptime(a['deviceTime'], '%Y-%m-%dT%H:%M:%S')
                        dur = a['duration']/fraction
                        a['suspendedAt'] = dt.strftime(time + td(milliseconds=dur), '%Y-%m-%dT%H:%M:%S')
                        # change delivered bolus value to be calculated from suspendedAt
                        fraction_delivered = dur/float(a['duration'])
                        if not 'initialDelivery' in a.keys():
                            a['value'] = round(fraction_delivered * a['programmed'], 1)
                        elif 'initialDelivery' in a.keys():
                            extended_delivered = round(fraction_delivered * a['extendedDelivery'], 1)
                            a['value'] = round(extended_delivered + a['initialDelivery'], 1)
                        suspendId = str(uuid.uuid4())
                        suspend = {
                            'id': suspendId,
                            'reason': reason,
                            'type': 'deviceMeta',
                            'subType': 'status',
                            'status': 'suspended',
                            'deviceTime': a['suspendedAt'],
                            'deviceId': 'Demo - 123',
                            'source': 'demo'
                        }
                        resume = {
                            'id': str(uuid.uuid4()),
                            'reason': random.choice(['manual', 'automatic']),
                            'type': 'deviceMeta',
                            'subType': 'status',
                            'status': 'resumed',
                            'deviceTime': dt.strftime(time + td(milliseconds=dur) * 2 + td(minutes=random.choice(range(-5,6))), '%Y-%m-%dT%H:%M:%S'),
                            'deviceId': 'Demo - 123',
                            'source': 'demo',
                            'joinKey': suspendId
                        }
                        suspends.append(suspend)
                        suspends.append(resume)
            except KeyError:
                pass

    all_json = _fix_floating_point(sorted(all_json + suspends, key=lambda x: x['deviceTime']))

    for a in all_json:
        # remove device time from messages
        try:
            utc = a['utcTime']
            del a['deviceTime']
        except KeyError:
            pass
        # remove device time from basals
        try:
            start = a['start']
            del a['deviceTime']
        except KeyError:
            pass

    with open(out_file, 'w') as f:
        if not minify:
            f.write(json.dumps(all_json, indent=4, separators=(',', ': ')))
        else:
            f.write(json.dumps(all_json, separators=(',',':')))

def main():

    parser = argparse.ArgumentParser(description='Generate demo diabetes data for Tidepool applications and visualizations.')
    parser.add_argument('-d', '--dexcom', action='store', dest='dexcom_segments', help='name of file containing indexed continuous segments of Dexcom data;\ndefault is indexed_segments.json')
    parser.add_argument('-m', '--mock', action='store_true', help='shortcut for producing new mock data for blip')
    parser.add_argument('-n', '--num_days', action='store', dest='num_days', default=30, type=int, help='number of days of demo data to generate;\ndefault is 30')
    parser.add_argument('-o', '--output_file', action='store', dest='output_file', default='device-data.json', help='name of output JSON file;\ndefault is device-data.json')
    parser.add_argument('-s', '--start_date', action='store', dest="start_date", help='ISO 8601 start date\ndefault is now')
    parser.add_argument('-t', '--minify', action='store_true', default=False, help='print bare minimum fields and minify JSON')
    parser.add_argument('-q', '--quiet_messages', action='store_true', dest='quiet_messages', help='use this flag to turn off messages when bacon ipsum is being slow')
    args = parser.parse_args()

    if args.mock:
        dex = Dexcom(args.dexcom_segments, args.num_days, dt(2014, 2, 11, 23, 50, 23, random.choice(MICRO)))
    elif args.start_date:
        dex = Dexcom(args.dexcom_segments, args.num_days, dt.strptime(args.start_date + '.040881', '%Y-%m-%dT%H:%M:%S.%f'))
    else:
        dex = Dexcom(args.dexcom_segments, args.num_days)
    dex.generate_JSON()

    smbg = SMBG(dex)

    meals = Meals(smbg)

    wizards = Wizards(meals)

    boluses = Boluses(wizards)

    basal = Basal({}, boluses.json, meals.carbs)

    settings = Settings(basal.schedule, boluses.ratio, dex.final, args.num_days)

    if args.minify:
        all_json = dex.json + smbg.json + basal.json + meals.json + boluses.json
    elif args.mock or args.quiet_messages:
        all_json = dex.json + smbg.json + basal.json + meals.json + wizards.json + boluses.json + settings.json
    else:
        messages = Messages(smbg)
        all_json = dex.json + smbg.json + basal.json + meals.json + wizards.json + boluses.json + messages.json + settings.json

    if not args.minify:
        print_JSON(all_json, args.output_file)
    else:
        print_JSON(all_json, args.output_file, args.minify)
    print()

if __name__ == '__main__':
    main()