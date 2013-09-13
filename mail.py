from bottle import route, run, request, static_file
from os import popen, system, path
import json

def shell(cmd):
    return json.loads("\n".join(popen(cmd).readlines()))

def add_link(line):
    w = line.split()
    return "<a href='/mail/%s'>%s</a>" % (w[0].split(":")[1], " ".join(w[1:]))

if path.isfile("pass.txt"):
    f = open("pass.txt")
    password = f.read().strip()
    f.close()
else:
    print("Input Password:")
    password = raw_input()

@route('/mail/')
def index():
    return """<html><head>
    <meta content="width=device-width" name="viewport" />
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
    if request.query.get('p','') != password:
        raise RuntimeError, "Invalid Password"
    return {"content": shell("TZ=EST notmuch search --format=json tag:important AND tag:inbox")}

@route('/mail/junk/<thread>')
def junk(thread):
    if request.query.get('p','') != password:
        raise RuntimeError, "Invalid Password"
    system("TZ=EST notmuch tag -important +spam -inbox thread:%s" % thread)
    return {}

@route('/mail/archive/<thread>')
def archive(thread):
    if request.query.get('p','') != password:
        raise RuntimeError, "Invalid Password"
    system("TZ=EST notmuch tag -important thread:%s" % thread)
    return {}

@route('/mail/html/<id>/<part>')
def html(id, part):
    if request.query.get('p','') != password:
        raise RuntimeError, "Invalid Password"
    return "\n".join(popen("TZ=EST notmuch show --part=%s id:%s" % (part, id)).readlines())


@route('/mail/<thread>')
def read(thread):
    if request.query.get('p','') != password:
        raise RuntimeError, "Invalid Password"
    return {"content": shell("TZ=EST notmuch show --format=json thread:%s" % thread)}

run(host='localhost', port=40000)
