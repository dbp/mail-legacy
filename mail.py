from bottle import route, run, static_file
from os import popen
import json

def shell(cmd):
    return json.loads("\n".join(popen(cmd).readlines()))

def add_link(line):
    w = line.split()
    return "<a href='/mail/%s'>%s</a>" % (w[0].split(":")[1], " ".join(w[1:]))

@route('/mail/')
def index():
    return """<html><head>
    <script src="http://code.jquery.com/jquery-1.10.1.min.js"></script>
    <script src="http://code.jquery.com/jquery-migrate-1.2.1.min.js"></script>
    <script type=text/javascript src='/mail/mail.js'></script>
    <link rel="stylesheet" type="text/css" href="/mail/main.css"></link>
    </head><body></body></html>"""

@route('/mail/mail.js')
def js():
    return static_file("mail.js", "")

@route('/mail/main.css')
def js():
    return static_file("main.css", "")

@route('/mail/all')
def all():
    return {"content": shell("notmuch search --format=json tag:important AND tag:inbox")}

@route('/mail/<thread>')
def read(thread):
    return {"content": shell("notmuch show --format=json thread:%s" % thread)}

run(host='localhost', port=40000)
