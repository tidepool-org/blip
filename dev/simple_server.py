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

from __future__ import print_function
import SimpleHTTPServer
import SocketServer

try:
    print()
    print('Serving tideline at http://localhost:8081...CTRL-C to stop.')
    print()
    Handler = SimpleHTTPServer.SimpleHTTPRequestHandler
    class MyTCPServer(SocketServer.TCPServer):
        allow_reuse_address = True
    server = MyTCPServer(('0.0.0.0', 8081), Handler)

    server.serve_forever()
except KeyboardInterrupt:
    pass