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

# USAGE:
# python munge_json.py /path/to/console/output 'data-type'
# this script expects two command-line arguments in order:
# 1) the name of the raw console output (copied and pasted from blip's console) text file
# 2) the datatype you'd like to extract (e.g., 'basal-rate-segment')
# at present, you can only extract one datatype at a time

import json
import re
import sys

def main():

    with open(sys.argv[1], 'rU') as input_file:

        data_regex = re.compile('^\"(\[\{.*\}\])\"')

        for line in input_file:
            if line.find('\"[{') != -1:
                data = data_regex.search(line).group(1)
                json_data = json.loads(data)
        try:
            data_to_print = [d for d in json_data if d['type'] == sys.argv[2]]
        except IndexError:
            data_to_print = json_data

        # to_exclude = ['id', '_id', 'groupId', 'deviceId', 'source', 'scheduleName', 'duration', 'units', 'normalTime', 'normalEnd']

        # for d in data_to_print:
        #     for key in to_exclude:
        #         try:
        #             del d[key]
        #         except KeyError:
        #             pass

        with open('blip-output.json', 'w') as f:
            print >> f, json.dumps(data_to_print, separators=(',', ': '), indent=4)

if __name__ == '__main__':
    main()