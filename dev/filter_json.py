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

# Usage:
# python filter_json.py <path/to/JSON/file> <filter> <optional/path/to/output/file>

import json
import sys

def main():
    o = open(sys.argv[1], 'rU')
    try:
        output_file = open(sys.argv[3], 'w')
    except IndexError:
        output_file = open('filter-output.json', 'w')
    jsn = json.load(o)

    filtered = []

    for obj in jsn:
        if obj['type'] == sys.argv[2]:
            filtered.append(obj)

    print >> output_file, json.dumps(filtered, separators=(',',': '), indent=4)

if __name__ == '__main__':
    main()