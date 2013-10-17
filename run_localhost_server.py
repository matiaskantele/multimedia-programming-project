from http.server import HTTPServer, SimpleHTTPRequestHandler

print("Running server at localhost:8000")
httpd = HTTPServer(('127.0.0.1', 8000), SimpleHTTPRequestHandler)
httpd.serve_forever()