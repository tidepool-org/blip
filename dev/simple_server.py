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