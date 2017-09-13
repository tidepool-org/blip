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
#                     [-o OUTPUT_FILE] [-s START_DATE] [-t] [-q]
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
#   -s START_DATE, --start_date START_DATE
#                         ISO 8601 start date default is now
#   -t, --minify          print bare minimum fields and minify JSON
#   -q, --quiet_messages  use this flag to turn off messages when bacon ipsum is
#                         being slow

# for Python 3 compatibility
from __future__ import print_function

import argparse
from datetime import datetime as dt
from datetime import time as t
from datetime import timedelta as td
import json
from pytz import timezone
import pytz
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

        self.end_initial = self._get_initial_segment()

        self.end_middle = self._get_middle_segments()

        self._get_final_segment()

        def fix_duration(segment):
            dur = int(segment['duration'].total_seconds()*1000)
            if dur < 0:
                segment['duration'] = td(milliseconds=(86400000 + dur))
            else:
                segment['duration'] = td(milliseconds=dur)
            return segment

        self.segments = [fix_duration(s) for s in self.segments]

        self._make_temp_segments()

        def serialize(segment):
            segment['normalEnd'] = (segment['deviceTime'] + segment['duration']).isoformat() + '.000Z'
            segment['deviceTime'] = segment['deviceTime'].isoformat()
            segment['duration'] = int(segment['duration'].total_seconds()*1000)
            segment['id'] = str(uuid.uuid4())
            try:
                serialize(segment['suppressed'])
            except KeyError:
                pass
            try:
                del segment['used']
            except KeyError:
                pass
            return segment

        self.json = [serialize(s) for s in self.segments]

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
                    'type': 'basal',
                    'rate': self.schedule[current_segment],
                    'deliveryType': 'scheduled',
                    'deviceTime': start,
                    'duration': end - start
                }

        self.segments.append(segment);

    def _get_difference(self, t1, t2):

        d = dt.now() - td(days=30)

        dt1 = dt(d.year, d.month, d.day, t1.hour, t1.minute, t1.second)

        dt2 = dt(d.year, d.month, d.day, t2.hour, t2.minute, t2.second)

        if t1 == t(0,0,0):
            dt1 = dt1 + td(days=1)

        return dt1 - dt2

    def _get_endpoints(self):

        all_pump_data = self.boluses + self.carbs

        all_pump_data = sorted(all_pump_data, key=lambda x: x['deviceTime'])

        to_return = (all_pump_data[0], all_pump_data[len(all_pump_data) - 1])

        return [dt.strptime(item['deviceTime'],  '%Y-%m-%dT%H:%M:%S') for item in to_return]

    def _get_initial_segment(self):

        d = self.endpoints[0]

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

        d = self.endpoints[0]

        end = self.endpoints[1]

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

        d = self.endpoints[1]

        self._append_segment(self.end_middle, t(d.hour, d.minute, d.second))

    def _make_temp_segments(self):

        likelihood = [0,0,0,0,0,0,0,1]

        percents = [item/10.0 for item in range(0,16)]

        original_length = len(self.segments)

        for i, segment in enumerate(self.segments):

            percent = random.choice(percents)
            if percent == 1.0:
                percent = 0.5

            # proper subset temps
            if random.choice(likelihood) and i < original_length:
                left_segment = segment.copy()
                left_segment['duration'] = td(seconds=int(segment['duration'].total_seconds() * 0.25))
                left_segment['used'] = 'subset/left_segment'

                middle_segment = segment.copy()
                middle_segment['deviceTime'] = segment['deviceTime'] + left_segment['duration']
                middle_segment['duration'] = left_segment['duration'] * 2
                middle_segment['used'] = 'subset/middle_segment'
                middle_segment['source'] = 'demo'
                middle_segment['deviceId'] = 'Demo - 123'

                right_segment = segment.copy()
                right_segment['deviceTime'] = segment['deviceTime'] + left_segment['duration'] + middle_segment['duration']
                right_segment['duration'] = segment['duration'] - left_segment['duration'] - middle_segment['duration']
                right_segment['used'] = 'subset/right_segment'

                segment['deviceTime'] = middle_segment['deviceTime']
                segment['duration'] = middle_segment['duration']
                segment['deliveryType'] = 'temp'
                segment['percent'] = percent
                segment['rate'] = round(segment['percent'] * middle_segment['rate'], 3)
                segment['suppressed'] = middle_segment
                segment['used'] = 'subset/segment'

                self.segments.append(left_segment)
                self.segments.append(right_segment)

class Boluses:
    """Generate demo bolus data."""

    def __init__(self, wizards):

        self.wizards = wizards

        self.mu = 2.0

        self.sigma = 2.0

        self.boluses = self._generate_meal_boluses()

        self._generate_extended_boluses()

        self._generate_correction_boluses()

        self.json = [b for b in self.boluses if (self._get_value(b)[0] > 0)]

    def _get_value(self, bolus):
        """Return the value of a bolus no matter if bolus is normal or extended."""

        try:
            val = bolus['normal']
            return (val, 'normal')
        except KeyError:
            return (bolus['extended'], 'extended')

    def _time_shift(self):

        return td(minutes=random.randint(-5,5))

    def _ratio_shift(self):

        return random.randint(-4, 4)

    def _generate_meal_boluses(self):
        """Generate boluses to match generated carb counts."""

        likelihood = [0,0,0,1]

        additions = [-2.2, -1.3, -0.4, 0.5, 1.2, 1.7, 3.4]

        def bolus_value(wiz):
            bolus = 0.0
            rec = wiz['recommended']
            if 'carb' in rec.keys():
                bolus += rec['carb']
            if 'correction' in rec.keys():
                bolus += rec['correction']
            bolus += (random.choice(likelihood) * random.choice(additions))
            return bolus

        boluses = []
        wizards = []

        for wiz in self.wizards.json:
            bolus = {
                'id': str(uuid.uuid4()),
                'type': 'bolus',
                'subType': 'normal',
                'deviceTime': wiz['deviceTime'],
                'joinKey': wiz['joinKey'],
                'normal': bolus_value(wiz)
            }
            if bolus['normal'] > 0:
                boluses.append(bolus)

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

            if current_value > 0:
                self.boluses.append({'id': str(uuid.uuid4()), 'type': 'bolus', 'subType': 'normal', 'deviceTime': next.isoformat(), 'normal': current_value})

            t = next

    def _generate_extended_boluses(self):
        """Generate some dual- and square-wave boluses."""

        likelihood = [0,1]

        quarter = [0,0,0,1]

        durations = [30,45,60,90,120,180,240]

        for bolus in self.boluses:
            coin_flip = random.choice(likelihood)

            fractions = [2,3,4]

            if coin_flip:
                if bolus['normal'] >= 2:
                    dual = random.choice(likelihood)
                    if dual:
                        total = bolus['normal']
                        bolus['normal'] = round(float(random.choice(range(1,10)))/10 * total, 1)
                        bolus['extended'] = total - bolus['normal']
                        bolus['duration'] = random.choice(durations) * 60 * 1000
                        bolus['type'] = 'bolus'
                        bolus['subType'] = 'dual/square'
                    else:
                        bolus['extended'] = bolus['normal']
                        del bolus['normal']
                        bolus['duration'] = random.choice(durations) * 60 * 1000
                        bolus['type'] = 'bolus'
                        bolus['subType'] = 'square'

            # make it so that some boluses have a difference between programmed and delivered
            if random.choice(quarter):
                val, btype = self._get_value(bolus)
                if val >= 1:
                    bolus['expected' + btype.title()] = val
                    bolus['type'] = 'bolus'
                    bolus[btype] = round(val/random.choice(fractions), 1)
                    if btype == 'normal':
                        if 'extended' in bolus.keys():
                            bolus['expectedExtended'] = bolus['extended']
                            bolus['extended'] = 0.0
                            bolus['expectedDuration'] = bolus['duration']
                            bolus['duration'] = 0
                    elif btype == 'extended':
                        bolus['expectedDuration'] = bolus['duration']
                        bolus['duration'] = round((bolus['extended']/bolus['expectedExtended']) * bolus['duration'],0)

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

        self.ratio = 12.0

        self.isf = 60.0

        self.bgTarget = {
            "target": 100,
            "high": 120
        }

        self.meals = meals

        self.json = self._meal_to_wizard()

    def _meal_to_wizard(self):
        """Transform a carbs json into a wizard record."""

        bgs = range(39, 402)

        iobs = range(1,31)

        biased = [0,1,1]

        coin_flip = [0,1]

        wizards = []

        for record in self.meals.json:
            wiz = {
                'type': 'wizard',
                'id': record['id'],
                'deviceTime': record['deviceTime'],
                'joinKey': str(uuid.uuid4()),
                'bgTarget': self.bgTarget.copy(),
                'insulinCarbRatio': self.ratio,
                'insulinSensitivity': self.isf,
                'recommended': {}
            }
            if random.choice(biased):
                wiz['carbInput'] = record['value']
            if random.choice(biased):
                wiz['bgInput'] = random.choice(bgs)
            # wizards events can't lack *both* carbInput and bgInput
            if 'carbInput' not in wiz.keys() and 'bgInput' not in wiz.keys():
                wiz['carbInput'] = record['value']
            if random.choice(coin_flip):
                wiz['insulinOnBoard'] = round(random.choice(iobs)/10.0, 2)

            if 'bgInput' in wiz.keys() and wiz['bgInput'] > self.bgTarget['high']:
                if 'insulinOnBoard' not in wiz.keys():
                    wiz['recommended']['correction'] = round((wiz['bgInput'] - self.bgTarget['target'])/self.isf, 1)
                else:
                    val = round((wiz['bgInput'] - self.bgTarget['target'])/self.isf, 1) - wiz['insulinOnBoard']
                    wiz['recommended']['correction'] = val if val > 0 else 0.0

            if 'carbInput' in wiz.keys():
                wiz['recommended']['carb'] = round(wiz['carbInput']/self.ratio, 1)


            wizards.append(wiz)

        return wizards

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

        return {'type': 'message', 'id': message_id, 'parentmessage': parent_message_id if len(parent_message_id) > 0 else None, 'timestamp': dt.strftime(pytz.utc.localize(timestamp), '%Y-%m-%dT%H:%M:%S') + '.000Z', 'messagetext': bacon_ipsum}

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

    def __init__(self, basal_schedule, carb_ratio, isf, final, num_days):

        self.schedule = basal_schedule

        self.schedules = {
            'standard': self._schedule_to_array(self.schedule),
            'pattern a': self._schedule_to_array(self._mutate_schedule()),
            'pattern b': self._schedule_to_array(self._mutate_schedule())
        }

        self.schedule_names = ['standard', 'pattern a', 'pattern b']

        self.ratio = carb_ratio

        self.isf = isf

        self.penultimate = final + td(days=random.choice(range(-(num_days - 1),0)))

        self.most_recent = final

        self.json = self._get_settings()

    def _get_settings(self):
        """Put together two complete settings objects."""

        most_recent = {
            'deviceTime': self.most_recent.isoformat()[:-7],
            'id': str(uuid.uuid4()),
            'type': 'settings',
            'activeBasalSchedule': random.choice(self.schedule_names),
            'basalSchedules': self.schedules,
            'carbRatio': [{'start': 0, 'amount': int(self.ratio)}],
            'insulinSensitivity': [{'start': 0, 'amount': self.isf}],
            'bgTarget': [{'start': 0, 'high': 100, 'low': 80}],
            'units': {'carb': 'grams', 'bg': 'mg/dL'}
        }

        new_schedules = {}
        for name, sched in self.schedules.items():
            if name == 'standard':
                new_schedules[name] = sched
            else:
                sched = self._schedule_to_array(self._mutate_schedule())
                new_schedules[name] = sched

        penultimate = {
            'deviceTime': self.penultimate.isoformat()[:-7],
            'id': str(uuid.uuid4()),
            'type': 'settings',
            'activeBasalSchedule': random.choice(self.schedule_names),
            'basalSchedules': new_schedules,
            'carbRatio': [{'start': 0, 'amount': int(self.ratio * 1.2)}],
            'insulinSensitivity': [{'start': 0, 'amount': self.isf + 10}],
            'bgTarget': [{'start': 0, 'high': 100, 'low': 80}],
            'units': {'carb': 'grams', 'bg': 'mg/dL'}
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

    def get_type(thing):
        try:
            return thing['type']
        except KeyError:
            return 'message'

    for thing in a:
        if get_type(thing) not in ['cbg', 'smbg']:
            for key, val in thing.items():
                if isinstance(val, float):
                    thing[key] = round(val, 3)

    return a

def translate_to_mmol(all_json, mmol):

    MGDL_PER_MMOLL = 18.01559

    def translate_bg(val):
        if mmol:
            return round(float(val)/MGDL_PER_MMOLL, 1)
        else:
            return float(val)/MGDL_PER_MMOLL

    for a in all_json:
        if a['type'] == 'cbg' or a['type'] == 'smbg':
            a['value'] = translate_bg(a['value'])
            a['units'] = 'mmol/L' if mmol else 'mg/dL'
        elif a['type'] == 'settings':
            a['units']['bg'] = 'mmol/L' if mmol else 'mg/dL'
            for t in a['bgTarget']:
                for k in t.keys():
                    if k != 'range' and k != 'start':
                        t[k] = translate_bg(t[k])
            for i in a['insulinSensitivity']:
                i['amount'] = translate_bg(i['amount'])
        elif a['type'] == 'wizard':
            a['units'] = 'mmol/L' if mmol else 'mg/dL'
            if 'bgInput' in a.keys():
                a['bgInput'] = translate_bg(a['bgInput'])
            if 'insulinSensitivity' in a.keys():
                a['insulinSensitivity'] = translate_bg(a['insulinSensitivity'])
            if 'bgTarget' in a.keys():
                for k in a['bgTarget'].keys():
                    if k != 'range':
                        a['bgTarget'][k] = translate_bg(a['bgTarget'][k])

def print_JSON(all_json, out_file, minify=False):

    # add deviceId field to smbg, boluses, carbs, and basals
    pump_fields = ['smbg', 'carbs', 'wizard', 'bolus', 'basal', 'settings']
    units_fieds = ['cbg', 'smbg', 'carbs']
    annotation_fields = ['bolus', 'basal']
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

        # TODO: make this configurable later, as CL option
        this_tz = timezone('US/Pacific')
        utc = pytz.utc

        def add_time(a):
            try:
                timestamp = dt.strptime(a['deviceTime'], '%Y-%m-%dT%H:%M:%S')
            except ValueError:
                timestamp = dt.strptime(a['deviceTime'], '%Y-%m-%dT%H:%M:%S.%f')
            a['time'] = this_tz.localize(timestamp, is_dst=True).astimezone(utc).isoformat()
            a['time'] = a['time'].replace('+00:00', '.000Z')
            a['timezoneOffset'] = -((24*60) - this_tz.utcoffset(timestamp, is_dst=True).seconds/60)

        if a['type'] != 'message':
            add_time(a)
        try:
            add_time(a['suppressed'])
        except KeyError:
            pass

        # add some annotations
        if not minify:
            if a['type'] in annotation_fields:
                num = random.choice(range(0,15))
                if not num:
                    a['annotations'] = [{'code': 'demo annotation'}]

        if a['type'] == 'message':
            del a['type']

    def get_sort_by(x):
        try:
            return x['time']
        except KeyError:
            return x['timestamp']

    all_json = _fix_floating_point(sorted(all_json, key=lambda x: get_sort_by(x)))

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
    parser.add_argument('--mmol', action='store_true', dest='mmol', help='all BG and BG-related fields in mmol/L')
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

    basal = Basal({}, boluses.json, meals.json)

    settings = Settings(basal.schedule, wizards.ratio, wizards.isf, dex.final, args.num_days)

    if args.minify:
        all_json = dex.json + smbg.json + basal.json + meals.json + boluses.json
    elif args.mock or args.quiet_messages:
        all_json = dex.json + smbg.json + basal.json + wizards.json + boluses.json + settings.json
    else:
        messages = Messages(smbg)
        all_json = dex.json + smbg.json + basal.json + wizards.json + boluses.json + messages.json + settings.json

    translate_to_mmol(all_json, args.mmol)

    if not args.minify:
        print_JSON(all_json, args.output_file)
    else:
        print_JSON(all_json, args.output_file, args.minify)
    print()

if __name__ == '__main__':
    main()
