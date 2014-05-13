#!/usr/bin/env python
# encoding: utf-8
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

import json
import jsonschema
import argparse

def main():
    parser = argparse.ArgumentParser(description='Validate a JSON data file against a specified JSON Schema.')
    parser.add_argument('-s', '--schema', action='store', dest='schema', help='name of JSON Schema file')
    parser.add_argument('-d', '--data', action='store', dest='data', help='name of JSON data file')
    args = parser.parse_args()

    if not args.data:
        print()
        print("You need to pass me a data file to validate, dummy. :(")
        print()
        exit()
    if not args.schema:
        print()
        print("You need to pass me a schema to use for validation, idiot. >(")
        print()
        exit()

    data = json.load(open(args.data, 'rU'))
    
    schema = json.load(open(args.schema, 'rU'))

    jsonschema.validate(data, schema)

if __name__ == '__main__':
    main()