import threading
import webbrowser
from wsgiref.simple_server import make_server
import sys
import json

FILE = 'index.html'
PORT = 8080

def test_app(environ, start_response):
    if environ['REQUEST_METHOD'] == 'POST':
        try:
            request_body_size = int(environ['CONTENT_LENGTH'])
            request_body = environ['wsgi.input'].read(request_body_size)
        except (TypeError, ValueError):
            request_body = "0"
        try:
            #response_body = str(int(request_body) ** 2)
            response_body = str(7 ** 2)
        except:
            response_body = "error"
        status = '200 OK'
        headers = [('Content-type', 'text/plain')]
        start_response(status, headers)
        return [response_body]
    else:

        if environ['PATH_INFO'] == '/Entidades_2013.json':
            response_body = open('./Entidades_2013.json').read()
            headers = [('Content-type', 'application/json'),
                       ('Content-Length', str(len(response_body)))]

        elif environ['PATH_INFO'] == '/index.html':
            response_body = open(FILE).read()
            headers = [('Content-type', 'text/html'),
                       ('Content-Length', str(len(response_body)))]

        elif environ['PATH_INFO'] == '/favicon.ico':
            response_body = ""
            headers = [('Content-type', 'text/javascript'),
                       ('Content-Length', str(len(response_body)))]

        else:
            response_body = open('.' + environ['PATH_INFO']).read()
            headers = [('Content-type', 'text/plain'),
                       ('Content-Length', str(len(response_body)))]

        status = '200 OK'
        start_response(status, headers)
        return [response_body]

def open_browser():
    """Start a browser after waiting for half a second."""
    def _open_browser():
        webbrowser.open('http://localhost:%s/%s' % (PORT, FILE))
    thread = threading.Timer(0.5, _open_browser)
    thread.start()

def start_server():
    """Start the server."""
    httpd = make_server("", PORT, test_app)
    httpd.serve_forever()


if __name__ == "__main__":
    sys.stdout = sys.stderr
    open_browser()
    start_server()
