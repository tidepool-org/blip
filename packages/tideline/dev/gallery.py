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
# usage: gallery.py [-h] [-p] [-g] [-r] [-l]
#
# Easy tideline gallery management.
#
# optional arguments:
#   -h, --help      show this help message and exit
#   -p, --progress  update tideline current progress page
#   -g, --gallery   add an item to the gallery
#   -r, --remove    remove one or more items from the gallery
#   -l, --list      list items currently in the gallery

# for Python 3 compatibility
from __future__ import print_function
# because raw_input got renamed in Python 3.something
try:
  input = raw_input
except NameError:
  pass

import argparse
import json
import os
import shutil
import subprocess

REGISTRY='./web/_data/registry.yml'
EXAMPLES='./web/example/'

WEBPACK_COMMON="./node_modules/.bin/webpack './example/example.js' --output-path './web/example' --output-file '%s.js' --progress --colors"

def ask(question):
  print()
  return input(question)

def update_data():
  """Copy the demo data down into the gh-pages branch/directory."""

  shutil.copy('example/data/device-data.json', 'web/example/data/')

def update_progress():
  """Update the current progress page in the tideline gallery."""

  print()
  print('Building new current progress bundle...')
  subprocess.call(WEBPACK_COMMON %('bundle'), shell=True)
  update_data()
  print()

def add_to_gallery():
  """Add a page to the tideline gallery."""

  with open(REGISTRY, 'rU') as f:
    reg = json.load(f)
    item = {}
    item['branch'] = ask('What branch are you adding to the gallery? ')
    item['title'] = ask('What should the title of the gallery item be? ')
    item['desc'] = ask('Please enter a short description of the gallery item: ')

    item['branch'] = item['branch'].replace("/", '-')
    item['href'] = 'example/%s.html' %(item['branch'])
    item['bundle'] = item['branch'] + '.js'

    reg.append(item)

  print()
  print('Building new gallery bundle...')
  subprocess.call(WEBPACK_COMMON %(item['branch']), shell=True)
  update_data()
  print()

  with open(REGISTRY, 'w') as f:
    print(json.dumps(reg, indent=2, separators=(',', ': ')), file=f)

  with open(EXAMPLES + item['branch'] + '.md', 'w') as f:
    print('---', file=f)
    print('layout: example', file=f)
    print('title: %s' %(item['title']), file=f)
    print('bundle: %s' %(item['bundle']), file=f)
    print('---', file=f)

def remove_from_gallery():
  """Remove one or all pages from the tideline gallery."""

  PATH_PREFIX = 'web/example/'

  list_gallery()

  clear = ask('Do you want to remove all items from the gallery? (y/[n]) ')
  print()

  if clear == 'y':
    with open(REGISTRY, 'w') as f:
      print(json.dumps([]), file=f)
  else:
    print('Please provide a comma-separated list of the letters corresponding to the items you would like to remove:')
    list_gallery(True)
    to_removes = ask('Ex: 1, 3\n\nRemove: ').split(',')
    print()
    with open(REGISTRY, 'rU') as f:
      reg = json.load(f)
      for to_remove in to_removes:
        try:
          idx = int(to_remove) - 1
          os.remove(PATH_PREFIX + reg[idx]['bundle'])
          os.remove(PATH_PREFIX + reg[idx]['branch'] + '.md')
          del reg[idx]
        except IndexError:
          print("There isn't a gallery item numbered %s, teapot!" %(to_remove))
          print()

    with open(REGISTRY, 'w') as f:
      print(json.dumps(reg, indent=2, separators=(',', ': ')), file=f)

def list_gallery(letters=False):
  """List current items in the tideline gallery."""

  with open(REGISTRY, 'rU') as f:
    reg = json.load(f)
    print()
    print('Items currently in the tideline gallery:')
    print()
    [print((str(idx + 1) + '. ' if letters else ' - ') + item['title'] + ': ' + item['branch']) for idx, item in enumerate(reg)]

def main():
  parser = argparse.ArgumentParser(description='Easy tideline gallery management.')

  parser.add_argument('-p', '--progress', action='store_true', help='update tideline current progress page')
  parser.add_argument('-g', '--gallery', action='store_true', help='add an item to the gallery')
  parser.add_argument('-r', '--remove', action='store_true', help='remove one or more items from the gallery')
  parser.add_argument('-l', '--list', action='store_true', help='list items currently in the gallery')

  args = parser.parse_args()

  if args.list:
    list_gallery()
  if args.progress:
    update_progress()
  if args.gallery:
    add_to_gallery()
  if args.remove:
    remove_from_gallery()

  if not args.list and not args.progress and not args.gallery and not args.remove:
    print()
    print("You didn't give a command-line option.")
    print()
    answer = input("Default to updating current progress page? ([y]/n) ")
    if answer == 'y':
      update_progress()
    else:
      print()

if __name__ == '__main__':
  main()
